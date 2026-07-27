// ═══════════════════════════════════════════════
// RUNTIME DIAGNOSTICS (Package 45.5)
// Single diagnostic interface aggregating:
//   loaded/skipped modules, timings, token usage,
//   cache performance, database activity,
//   execution graph, scheduler module states.
//
// Every value comes from instrumented code
// (RuntimeAuthority, profiler, cache, scheduler) —
// never from the LLM.
// ═══════════════════════════════════════════════

import { getReport } from './runtimeAuthority';
import { getProfileSummary } from './profiler';
import { getCacheStats } from './contextCache';
import { getSchedulerState } from './executionScheduler';

const STORAGE_KEY = 'continuity_runtime_diagnostics';

let _lastSnapshot = null;

export function captureDiagnostics(contextPlan) {
  const authority = getReport();
  const scheduler = getSchedulerState();

  const snapshot = {
    timestamp: new Date().toISOString(),
    planner: contextPlan ? {
      intent: contextPlan.intent,
      requiredContexts: contextPlan.requiredContexts,
      optionalContexts: contextPlan.optionalContexts,
      skippedContexts: contextPlan.skippedContexts,
      estimatedTokens: contextPlan.estimatedTotalTokens,
      estimatedQueries: contextPlan.estimatedTotalQueries,
      tokenBudget: contextPlan.tokenBudget,
      queryBudget: contextPlan.queryBudget,
      remainingBudget: contextPlan.remainingBudget,
    } : null,
    timings: getProfileSummary(),
    tokens: {
      estimate: authority.tokenEstimate,
      actualPrompt: authority.actualPromptTokens,
      completion: authority.completionTokens,
    },
    cache: {
      ...getCacheStats(),
      hits: authority.cacheHits,
      misses: authority.cacheMisses,
      evictions: authority.cacheEvictions,
    },
    database: { queries: authority.databaseQueries },
    apiCalls: authority.apiCalls,
    externalCalls: authority.externalCalls,
    llmLatencyMs: authority.llmLatencyMs,
    computeMode: authority.computeMode,
    memoryUsageMB: authority.memoryUsageMB,
    hallucinationsPrevented: authority.hallucinationsPrevented,
    scheduler,
    executionGraph: buildExecutionGraph(scheduler, contextPlan),
    contextsLoaded: authority.contextEntries,
    contextsSkipped: authority.contextsSkipped,
  };

  _lastSnapshot = snapshot;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {}
  return snapshot;
}

function buildExecutionGraph(scheduler, contextPlan) {
  const nodes = scheduler.map(m => ({
    id: m.name,
    state: m.state,
    durationMs: m.lastDurationMs,
  }));
  const edges = [];
  if (contextPlan?.decisions) {
    for (const [name, d] of Object.entries(contextPlan.decisions)) {
      if (d.dependency) edges.push({ from: d.dependency, to: name });
    }
  }
  return { nodes, edges };
}

export function getLastDiagnostics() {
  if (_lastSnapshot) return _lastSnapshot;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      _lastSnapshot = JSON.parse(stored);
      return _lastSnapshot;
    }
  } catch (e) {}
  return null;
}