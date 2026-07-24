// ═══════════════════════════════════════════════
// RUNTIME AUTHORITY (Package: Runtime Authority)
// The SINGLE source of truth for every runtime metric.
// The LLM may never generate these values — it only
// explains what the runtime measured.
//
// Every number originates here:
//   plannerTime, contextBuildTime, promptBuildTime,
//   llmLatency, tokenEstimate, cacheHits/Misses,
//   databaseQueries, contextsLoaded/Skipped,
//   computeMode, bandwidth, memoryUsage
// ═══════════════════════════════════════════════

const PLANNER_VERSION = '2.0';
const PROMPT_TOKEN_BUDGET = 5000;
const SYSTEM_PROMPT_TOKENS = 800;
const RESPONSE_RESERVE = 500;

let _report = null;
let _queryCount = 0;
let _hallucinationPrevented = 0;
let _apiCalls = 0;
let _externalCalls = 0;
let _latencies = [];

// ── Origin tracking (Part X) ──
export const ORIGIN = {
  LIVE: 'LIVE',
  CACHE: 'CACHE',
  DATABASE: 'DATABASE',
  INFERRED: 'INFERRED',
  ESTIMATED: 'ESTIMATED',
};

export function beginInteraction() {
  _report = {
    plannerTimeMs: 0,
    contextBuildMs: 0,
    promptBuildMs: 0,
    llmLatencyMs: 0,
    tokenEstimate: 0,
    actualPromptTokens: null,
    completionTokens: null,
    cacheHits: 0,
    cacheMisses: 0,
    cacheEvictions: 0,
    databaseQueries: 0,
    contextsLoaded: [],
    contextsSkipped: [],
    contextEntries: [],
    computeMode: 'FULL',
    bandwidth: 100,
    memoryUsageMB: 0,
    plannerVersion: PLANNER_VERSION,
    apiCalls: 0,
    externalCalls: 0,
    averageLatencyMs: 0,
    hallucinationsPrevented: _hallucinationPrevented,
  };
  _queryCount = 0;
  _apiCalls = 0;
  _externalCalls = 0;
  _latencies = [];
}

export function getReport() {
  if (!_report) beginInteraction();
  _report.databaseQueries = _queryCount;
  _report.apiCalls = _apiCalls;
  _report.externalCalls = _externalCalls;
  _report.hallucinationsPrevented = _hallucinationPrevented;
  _report.averageLatencyMs = _latencies.length > 0
    ? Math.round(_latencies.reduce((a, b) => a + b, 0) / _latencies.length)
    : 0;
  if (typeof performance !== 'undefined' && performance.memory) {
    _report.memoryUsageMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 10) / 10;
  }
  return { ..._report };
}

// ── Timing ──
export function recordPlannerTime(ms) { if (_report) _report.plannerTimeMs = Math.round(ms); }
export function recordContextBuildTime(ms) { if (_report) _report.contextBuildMs = Math.round(ms); }
export function recordPromptBuildTime(ms) { if (_report) _report.promptBuildMs = Math.round(ms); }
export function recordLLMLatency(ms) {
  if (_report) {
    _report.llmLatencyMs = Math.round(ms);
    _latencies.push(ms);
  }
}

// ── Tokens ──
export function recordTokenEstimate(tokens) { if (_report) _report.tokenEstimate = tokens; }
export function recordActualPromptTokens(tokens) { if (_report) _report.actualPromptTokens = tokens; }
export function recordCompletionTokens(tokens) { if (_report) _report.completionTokens = tokens; }

// ── Cache ──
export function recordCacheHit() { if (_report) _report.cacheHits++; }
export function recordCacheMiss() { if (_report) _report.cacheMisses++; }
export function recordCacheEviction() { if (_report) _report.cacheEvictions++; }

// ── Database ──
export function incrementDBQuery() { _queryCount++; }
export function trackedQuery(promise) {
  incrementDBQuery();
  return promise;
}
export function recordDBQueries(count) { _queryCount += count; }

// ── Contexts ──
export function recordContextLoaded(entry) {
  if (_report) {
    _report.contextsLoaded.push(entry.module);
    _report.contextEntries.push(entry);
  }
}
export function recordContextSkipped(name, reason) {
  if (_report) {
    _report.contextsSkipped.push({ name, reason });
  }
}

// ── System ──
export function recordComputeMode(mode) { if (_report) _report.computeMode = mode; }
export function recordBandwidth(bw) { if (_report) _report.bandwidth = bw; }
export function incrementAPICall() { _apiCalls++; }
export function incrementExternalCall() { _externalCalls++; }
export function incrementHallucinationPrevented() { _hallucinationPrevented++; }

// ── Token estimation (runtime-owned, never LLM-generated) ──
export function estimateTokens(text) {
  if (!text) return 0;
  const chars = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(Math.ceil(chars / 4), Math.ceil(words * 1.3));
}

export function computeRemainingBudget(recentHistory = []) {
  const conversationTokens = recentHistory.length > 0
    ? estimateTokens(recentHistory.map(m => `${m.role}: ${m.text}`).join(' '))
    : 0;
  return PROMPT_TOKEN_BUDGET - SYSTEM_PROMPT_TOKENS - conversationTokens - RESPONSE_RESERVE;
}

export function getPromptTokenBudget() { return PROMPT_TOKEN_BUDGET; }
export function getSystemPromptTokens() { return SYSTEM_PROMPT_TOKENS; }
export function getResponseReserve() { return RESPONSE_RESERVE; }

// ── Audit command (Part XIV) ──
export function detectAuditRequest(input) {
  return /show runtime audit|runtime audit|planner audit|show me the (runtime|planner)/i.test(input || '');
}

export function formatAuditReport() {
  const r = getReport();
  const lines = [];
  lines.push('RUNTIME AUDIT REPORT');
  lines.push('═══════════════════════════════════════════════');
  lines.push(`Planner Version: ${r.plannerVersion}`);
  lines.push('');
  lines.push('TIMING (measured by runtime, not LLM):');
  lines.push(`  Planner:       ${r.plannerTimeMs}ms`);
  lines.push(`  Context Build: ${r.contextBuildMs}ms`);
  lines.push(`  Prompt Build:  ${r.promptBuildMs}ms`);
  lines.push(`  LLM Latency:   ${r.llmLatencyMs}ms`);
  lines.push(`  Average:       ${r.averageLatencyMs}ms`);
  lines.push('');
  lines.push('TOKENS (measured, not estimated by LLM):');
  lines.push(`  Estimated:     ${r.tokenEstimate}`);
  lines.push(`  Actual Prompt: ${r.actualPromptTokens ?? 'N/A'}`);
  lines.push(`  Completion:   ${r.completionTokens ?? 'N/A'}`);
  lines.push('');
  lines.push(`DATABASE QUERIES: ${r.databaseQueries} (origin: ${ORIGIN.LIVE})`);
  lines.push(`CACHE: hits=${r.cacheHits} misses=${r.cacheMisses} evictions=${r.cacheEvictions}`);
  lines.push(`API CALLS: ${r.apiCalls}`);
  lines.push(`EXTERNAL CALLS: ${r.externalCalls}`);
  lines.push(`BANDWIDTH: ${r.bandwidth}%`);
  lines.push(`MEMORY: ${r.memoryUsageMB}MB`);
  lines.push(`COMPUTE MODE: ${r.computeMode}`);
  lines.push('');
  lines.push(`CONTEXTS LOADED (${r.contextsLoaded.length}):`);
  for (const e of r.contextEntries) {
    lines.push(`  ✓ ${e.module} — ${e.reason} (${e.tokenCost} tokens, priority: ${e.priority})`);
  }
  lines.push('');
  lines.push(`CONTEXTS SKIPPED (${r.contextsSkipped.length}):`);
  for (const s of r.contextsSkipped) {
    lines.push(`  ✗ ${s.name} — ${s.reason}`);
  }
  lines.push('');
  lines.push(`HALLUCINATIONS PREVENTED: ${r.hallucinationsPrevented}`);
  lines.push('═══════════════════════════════════════════════');
  return lines.join('\n');
}