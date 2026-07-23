// ═══════════════════════════════════════════════
// INSIGHT SYNTHESIS ENGINE (Phase 18)
// BISON MAY DISCOVER CONNECTIONS.
// BISON MUST NOT CONFUSE CONNECTIONS WITH FACTS.
// No shadow memory — references canonical IDs only.
// Event-driven synthesis — no continuous scanning.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const SYNTHESIS_TRIGGER_PATTERNS = [
  /connect.{0,10}(the )?dots/i,
  /do you see.{0,10}pattern/i,
  /what.{0,10}(bigger picture|larger picture|big picture)/i,
  /have you noticed/i,
  /synthe(s)?i[sz]e/i,
  /any (patterns|connections|themes)/i,
];

export function detectSynthesisRequest(input) {
  if (!input || typeof input !== 'string') return false;
  return SYNTHESIS_TRIGGER_PATTERNS.some(p => p.test(input));
}

export const EVIDENCE_STRENGTH = {
  WEAK: 'WEAK',
  MODERATE: 'MODERATE',
  STRONG: 'STRONG',
};

export const CONFIDENCE = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
};

export const SENSITIVITY_LEVEL = {
  NORMAL: 'NORMAL',
  SENSITIVE: 'SENSITIVE',
  HIGHLY_SENSITIVE: 'HIGHLY_SENSITIVE',
};

export const FEEDBACK_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  CORRECTED: 'CORRECTED',
  REJECTED: 'REJECTED',
  SNOOZED: 'SNOOZED',
  INVALIDATED: 'INVALIDATED',
};

const SENSITIVE_TAGS = ['trauma', 'abuse', 'assault', 'grief', 'loss', 'crisis'];

function checkSensitivity(item) {
  const text = ((item.text || '') + ' ' + (item.content || '')).toLowerCase();
  const tags = item.tags || [];
  if (SENSITIVE_TAGS.some(t => text.includes(t) || tags.includes(t))) {
    return SENSITIVITY_LEVEL.HIGHLY_SENSITIVE;
  }
  return SENSITIVITY_LEVEL.NORMAL;
}

// In-memory knowledge graph — Map/Set, rebuilt per synthesis. No persistent graph DB.
function buildKnowledgeGraph(memories, journals, checkIns) {
  const nodes = new Map();
  const edges = [];

  for (const m of memories || []) {
    nodes.set(m.id, {
      id: m.id,
      sourceType: 'SavedMemory',
      tags: m.tags || [],
      date: m.created_date,
      epistemicStatus: m.epistemic_status || 'USER_CONFIRMED',
      sensitivity: checkSensitivity(m),
    });
  }

  for (const j of journals || []) {
    nodes.set(j.id, {
      id: j.id,
      sourceType: 'JournalEntry',
      tags: j.tags || [],
      date: j.date,
      mood: j.mood,
      energy: j.energy,
      epistemicStatus: 'USER_CONFIRMED',
      sensitivity: checkSensitivity({ text: j.content, tags: j.tags }),
    });
  }

  for (const c of checkIns || []) {
    nodes.set(c.id, {
      id: c.id,
      sourceType: 'CheckIn',
      tags: [],
      date: c.date,
      mood: c.mood,
      energy: c.energy,
      exerciseType: c.exercise_type,
      epistemicStatus: 'USER_CONFIRMED',
      sensitivity: SENSITIVITY_LEVEL.NORMAL,
    });
  }

  const nodeArray = Array.from(nodes.values());
  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const a = nodeArray[i];
      const b = nodeArray[j];

      // Shared theme
      const sharedTags = a.tags.filter(t => b.tags.includes(t));
      if (sharedTags.length > 0) {
        edges.push({ source: a.id, target: b.id, type: 'shared_theme', sharedTags });
      }

      // Temporal proximity
      if (a.date && b.date) {
        const diffDays = Math.abs(new Date(a.date) - new Date(b.date)) / (1000 * 60 * 60 * 24);
        if (diffDays <= 3) {
          edges.push({ source: a.id, target: b.id, type: 'temporal', diffDays });
        }
      }

      // Embodied correlation — exercise + low energy
      if (a.exerciseType && b.energy != null && b.energy < 4) {
        edges.push({ source: a.id, target: b.id, type: 'embodied_correlation' });
      }
      if (b.exerciseType && a.energy != null && a.energy < 4) {
        edges.push({ source: a.id, target: b.id, type: 'embodied_correlation' });
      }
    }
  }

  return { nodes, edges };
}

function generateInsights(graph, sharedContext) {
  const insights = [];
  const rejectedPatterns = sharedContext?.rejectedInsightPatterns || [];

  // A. Cross-domain synthesis — shared tags across different source types
  const crossDomainEdges = graph.edges.filter(e => e.type === 'shared_theme');
  for (const edge of crossDomainEdges.slice(0, 3)) {
    const sourceNode = graph.nodes.get(edge.source);
    const targetNode = graph.nodes.get(edge.target);
    if (!sourceNode || !targetNode) continue;
    if (sourceNode.sourceType === targetNode.sourceType) continue;

    const patternKey = `cross-domain:${edge.sharedTags.join(',')}`;
    if (rejectedPatterns.some(p => p.pattern === patternKey)) continue;

    insights.push({
      sourceReferences: [edge.source, edge.target],
      sourceTypes: [sourceNode.sourceType, targetNode.sourceType],
      observedConnection: `Two entries from different areas share the theme "${edge.sharedTags.join(', ')}"`,
      hypothesis: null,
      evidenceStrength: EVIDENCE_STRENGTH.MODERATE,
      confidence: CONFIDENCE.LOW,
      alternativeExplanations: ['The shared theme may be coincidental', 'The user may have been reflecting on this topic generally'],
      sensitivityLevel: Math.max(sourceNode.sensitivity, targetNode.sensitivity),
      userFeedbackStatus: FEEDBACK_STATUS.PENDING,
    });
  }

  // B. Temporal echo — entries close in time
  const temporalEdges = graph.edges.filter(e => e.type === 'temporal' && e.diffDays > 1);
  for (const edge of temporalEdges.slice(0, 2)) {
    const sourceNode = graph.nodes.get(edge.source);
    const targetNode = graph.nodes.get(edge.target);
    if (!sourceNode || !targetNode) continue;

    insights.push({
      sourceReferences: [edge.source, edge.target],
      sourceTypes: [sourceNode.sourceType, targetNode.sourceType],
      observedConnection: 'Two entries from different days appear close in time',
      evidenceStrength: EVIDENCE_STRENGTH.WEAK,
      confidence: CONFIDENCE.LOW,
      alternativeExplanations: ['Proximity in time may not indicate a meaningful connection'],
      sensitivityLevel: Math.max(sourceNode.sensitivity, targetNode.sensitivity),
      userFeedbackStatus: FEEDBACK_STATUS.PENDING,
    });
  }

  // C. Embodied correlation — exercise + low energy
  const embodiedEdges = graph.edges.filter(e => e.type === 'embodied_correlation');
  for (const edge of embodiedEdges.slice(0, 1)) {
    const sourceNode = graph.nodes.get(edge.source);
    const targetNode = graph.nodes.get(edge.target);
    if (!sourceNode || !targetNode) continue;

    insights.push({
      sourceReferences: [edge.source, edge.target],
      sourceTypes: [sourceNode.sourceType, targetNode.sourceType],
      observedConnection: 'A day with physical activity was followed by a day with lower reported energy',
      evidenceStrength: EVIDENCE_STRENGTH.WEAK,
      confidence: CONFIDENCE.LOW,
      alternativeExplanations: ['Fatigue may have other causes', 'The correlation may be coincidental', 'Sleep quality may be a factor'],
      sensitivityLevel: SENSITIVITY_LEVEL.NORMAL,
      userFeedbackStatus: FEEDBACK_STATUS.PENDING,
    });
  }

  return insights;
}

// Prevent hypothesis-as-fact contamination
function validateEpistemically(insight) {
  return {
    ...insight,
    provenance: {
      sourceType: 'DERIVED_SYNTHESIS',
      epistemicStatus: 'INFERRED',
      isHypothesis: true,
      canBecomeFact: false,
      note: 'Derived correlation. Not a confirmed fact.',
    },
  };
}

function evaluateInsightPolicy(insight, sharedContext) {
  if (insight.sensitivityLevel === SENSITIVITY_LEVEL.HIGHLY_SENSITIVE) {
    return { shouldPresent: false, deliveryMode: 'withhold' };
  }

  const rejectedPatterns = sharedContext?.rejectedInsightPatterns || [];
  const patternKey = insight.observedConnection.substring(0, 50);
  if (rejectedPatterns.some(p => p.pattern === patternKey)) {
    return { shouldPresent: false, deliveryMode: 'withhold' };
  }

  if (insight.sensitivityLevel === SENSITIVITY_LEVEL.SENSITIVE) {
    return { shouldPresent: true, deliveryMode: 'offer_first' };
  }

  return { shouldPresent: true, deliveryMode: 'direct' };
}

const SHARED_CONTEXT_DEFAULTS = {
  sharedVocabulary: [],
  acceptedInsights: [],
  correctedInsights: [],
  rejectedInsightPatterns: [],
  userApprovedRituals: [],
};

async function getSharedContext() {
  try {
    const user = await base44.auth.me();
    return user?.shared_context || { ...SHARED_CONTEXT_DEFAULTS };
  } catch (e) {
    return { ...SHARED_CONTEXT_DEFAULTS };
  }
}

export async function runSynthesis(embodiedContext, affectiveContext) {
  try {
    const [memories, journals, checkIns, sharedContext] = await Promise.all([
      base44.entities.SavedMemory.list('-created_date', 50).catch(() => []),
      base44.entities.JournalEntry.list('-created_date', 20).catch(() => []),
      base44.entities.CheckIn.list('-date', 14).catch(() => []),
      getSharedContext(),
    ]);

    const graph = buildKnowledgeGraph(memories, journals, checkIns);
    let insights = generateInsights(graph, sharedContext);
    insights = insights.map(validateEpistemically);

    const policyResults = insights.map(i => ({ insight: i, policy: evaluateInsightPolicy(i, sharedContext) }));
    const presentable = policyResults
      .filter(p => p.policy.shouldPresent)
      .map(p => ({ ...p.insight, deliveryMode: p.policy.deliveryMode }));

    for (const insight of presentable) {
      try {
        await base44.entities.InsightGem.create({
          source_references: insight.sourceReferences,
          source_types: insight.sourceTypes,
          observed_connection: insight.observedConnection,
          hypothesis: insight.hypothesis,
          evidence_strength: insight.evidenceStrength,
          confidence: insight.confidence,
          alternative_explanations: insight.alternativeExplanations,
          sensitivity_level: insight.sensitivityLevel,
          user_feedback_status: FEEDBACK_STATUS.PENDING,
        });
      } catch (e) {}

      // LUMEN token creation for high-coherence insights (Package 32)
      if (insight.evidenceStrength === EVIDENCE_STRENGTH.STRONG) {
        try {
          const lumenSignature = `The grove remembers: ${insight.observedConnection.substring(0, 60)}`;
          await base44.entities.SavedMemory.create({
            text: `${insight.observedConnection}\n\n[LUMEN: ${lumenSignature}]`,
            source: 'lumen_token',
            tags: ['lumen', 'synthesis'],
            epistemic_status: 'INFERRED',
          });
        } catch (e) {}
      }
    }

    return {
      detected: presentable.length > 0,
      insights: presentable,
      sharedContext,
    };
  } catch (e) {
    return { detected: false, insights: [], sharedContext: null };
  }
}

export async function updateInsightFeedback(insightId, status, correction = null) {
  try {
    await base44.entities.InsightGem.update(insightId, { user_feedback_status: status });

    const user = await base44.auth.me();
    const sharedContext = user?.shared_context || { ...SHARED_CONTEXT_DEFAULTS };

    if (status === FEEDBACK_STATUS.ACCEPTED) {
      sharedContext.acceptedInsights.push(insightId);
    } else if (status === FEEDBACK_STATUS.CORRECTED && correction) {
      sharedContext.correctedInsights.push({ insightId, correction, correctedAt: new Date().toISOString() });
    } else if (status === FEEDBACK_STATUS.REJECTED) {
      sharedContext.rejectedInsightPatterns.push({
        pattern: insightId,
        rejectedAt: new Date().toISOString(),
      });
    }

    await base44.auth.updateMe({ shared_context: sharedContext });
    return sharedContext;
  } catch (e) {
    return null;
  }
}

// Derived-data invalidation — deleted memory must not survive indirectly
export async function invalidateDerivedData(sourceId) {
  try {
    const insights = await base44.entities.InsightGem.filter({
      user_feedback_status: { $ne: FEEDBACK_STATUS.INVALIDATED }
    });

    const toInvalidate = (insights || []).filter(i =>
      i.source_references && i.source_references.includes(sourceId)
    );

    for (const insight of toInvalidate) {
      await base44.entities.InsightGem.update(insight.id, {
        user_feedback_status: FEEDBACK_STATUS.INVALIDATED,
      });
    }

    const user = await base44.auth.me();
    const sharedContext = user?.shared_context || { ...SHARED_CONTEXT_DEFAULTS };
    sharedContext.sharedVocabulary = (sharedContext.sharedVocabulary || []).filter(
      v => v.sourceMemoryId !== sourceId
    );
    await base44.auth.updateMe({ shared_context: sharedContext });

    return toInvalidate.length;
  } catch (e) {
    return 0;
  }
}

export function buildInsightContextString(insightContext) {
  if (!insightContext || !insightContext.detected || !insightContext.insights?.length) return '';

  const parts = ['[INSIGHT SYNTHESIS — TENTATIVE, NOT FACT]'];

  for (const insight of insightContext.insights.slice(0, 1)) {
    parts.push(`Observed connection: ${insight.observedConnection}`);
    parts.push(`Evidence strength: ${insight.evidenceStrength}`);
    parts.push(`Confidence: ${insight.confidence}`);
    if (insight.alternativeExplanations?.length > 0) {
      parts.push('Alternative explanations:');
      for (const alt of insight.alternativeExplanations) {
        parts.push(`  - ${alt}`);
      }
    }
    parts.push(`Provenance: Derived from ${insight.sourceReferences?.length || 0} user-confirmed entries.`);
    parts.push(`Delivery: ${insight.deliveryMode}`);
  }

  parts.push('Instruction: Present as a possibility, not a revelation.');
  parts.push('Use: "I noticed a possible connection..." or "One interpretation might be..."');
  parts.push('Ask: "Does that fit your experience?"');
  parts.push('Do not assert as fact. Do not diagnose. Respect corrections immediately.');
  parts.push('[/INSIGHT SYNTHESIS]\n');

  return parts.join('\n') + '\n';
}