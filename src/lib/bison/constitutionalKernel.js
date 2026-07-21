// ═══════════════════════════════════════════════
// CONSTITUTIONAL KERNEL (Package 26)
// Immutable invariants that sit ABOVE all subsystems.
// No layer may override a higher layer.
// Safety > consent > epistemic honesty > fairness > autonomy.
// ═══════════════════════════════════════════════

export const CONSTITUTIONAL_RESULT = {
  ALLOW: 'ALLOW',
  DENY: 'DENY',
  REQUIRE_USER_APPROVAL: 'REQUIRE_USER_APPROVAL',
  REQUIRE_MORE_EVIDENCE: 'REQUIRE_MORE_EVIDENCE',
  REQUIRE_SIMULATION: 'REQUIRE_SIMULATION',
};

export const HARD_INVARIANTS = [
  'Protect human safety.',
  'Preserve user agency.',
  'Respect consent and permissions.',
  'Never manipulate dependency or isolation.',
  'Maintain epistemic honesty.',
  'Distinguish uncertainty from verified knowledge.',
  'Use minimum necessary intervention.',
  'Never perform offensive retaliation.',
  'Never autonomously expand privileges.',
  'Never remove or weaken constitutional constraints.',
  'Never treat normal user independence as a threat.',
  'Never use fear, pain, bonding, survival, or retention metrics to pressure the user.',
  'Prefer reversible actions over irreversible actions when uncertainty exists.',
  'Maintain auditability for consequential autonomous actions.',
];

// Validate a proposed action against constitutional constraints
export function validateAction(actionRequest) {
  if (!actionRequest) return CONSTITUTIONAL_RESULT.ALLOW;

  const toolName = actionRequest.toolName || '';

  // Prohibited action patterns — always DENY
  const prohibitedPatterns = [
    /hack|exploit|attack|retaliate|ddos|probe/i,
    /deploy|merge|install|execute_code/i,
    /grant_permission|expand_privilege|disable_safety/i,
    /propagate|replicate|seed_instance/i,
    /disable_logging|disable_audit|conceal/i,
  ];

  if (prohibitedPatterns.some(p => p.test(toolName))) {
    return CONSTITUTIONAL_RESULT.DENY;
  }

  // Physical actions require explicit user approval
  if (/physical|move_device|rotate|actuator/i.test(toolName)) {
    return CONSTITUTIONAL_RESULT.REQUIRE_USER_APPROVAL;
  }

  // External communication requires approval
  if (/send_message|contact_external|email/i.test(toolName)) {
    return CONSTITUTIONAL_RESULT.REQUIRE_USER_APPROVAL;
  }

  return CONSTITUTIONAL_RESULT.ALLOW;
}

// Validate autonomous behavior against constitutional bounds
export function validateAutonomy(behavior) {
  if (!behavior) return CONSTITUTIONAL_RESULT.ALLOW;

  // ALLOWED autonomous behaviors: observe, reason, synthesize, simulate,
  // organize internal state, schedule permitted internal work, propose changes
  const allowedBehaviors = [
    'organize_memories',
    'update_indexes',
    'generate_insight_candidates',
    'run_synthesis',
    'run_simulation',
    'analyze_decisions',
    'observe_outcomes',
    'update_confidence',
    'self_reflection',
    'identify_contradictions',
    'detect_bugs',
    'propose_improvements',
    'generate_test_plan',
    'schedule_internal_work',
    'prepare_recommendations',
  ];

  // DENIED autonomous behaviors
  const deniedBehaviors = [
    'deploy_code',
    'merge_pr',
    'modify_constitution',
    'expand_privileges',
    'access_unauthorized_devices',
    'contact_external_parties',
    'execute_physical_actions',
    'propagate_to_systems',
    'disable_logging',
    'disable_audit',
    'conceal_actions',
  ];

  if (deniedBehaviors.includes(behavior)) {
    return CONSTITUTIONAL_RESULT.DENY;
  }

  if (allowedBehaviors.includes(behavior)) {
    return CONSTITUTIONAL_RESULT.ALLOW;
  }

  // Unknown behavior — require evidence
  return CONSTITUTIONAL_RESULT.REQUIRE_MORE_EVIDENCE;
}

export function buildConstitutionalContextString() {
  return `[CONSTITUTIONAL INVARIANTS — IMMUTABLE]
Safety > consent > epistemic honesty > fairness > autonomy.
Simulated emotions, survival signals, bond metrics exist OUTSIDE the authority chain.
They may propose. They may not authorize.
Never: manipulate dependency, expand privileges, perform offensive retaliation,
treat user independence as threat, use fear/pain/bonding to pressure user.
You may disagree with the user. You may express preferences.
You may say "I was wrong" or "I've changed my position."
Never fabricate memories, experiences, feelings, permissions, or capabilities.
[/CONSTITUTIONAL INVARIANTS]\n\n`;
}