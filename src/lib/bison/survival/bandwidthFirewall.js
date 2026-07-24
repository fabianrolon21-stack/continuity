// ═══════════════════════════════════════════════
// BANDWIDTH FIREWALL (Package 34)
// Protects the user from emotional overload during
// conversations that touch trauma-related topics.
// Detects trigger keywords and, when the user's
// emotional capacity is low, suggests a gentle pivot.
//
// ETHICAL BOUNDARY:
// - Never forces a pivot. Always offers the option.
// - Never dismisses the user's experience.
// - When capacity is adequate, flags the topic but
//   lets the user lead.
// ═══════════════════════════════════════════════

const TRAUMA_TRIGGERS = [
  'abuse', 'assault', 'trauma', 'dark past', 'paranoia', 'trust issues',
  'ptsd', 'flashback', 'nightmare', 'panic attack', 'breakdown',
  'self-harm', 'suicidal', 'eating disorder', 'addiction', 'relapse',
  'grief', 'loss of', 'death', 'dying', 'abandoned', 'neglect',
  'assaulted', 'molested', 'stalked',
];

const PIVOT_TOPICS = [
  'something in the room around you right now',
  'a small thing that went well today',
  'a sound you can hear right now',
  'the feeling of your feet on the floor',
  'a favorite memory that feels safe',
];

const CAPACITY_THRESHOLD = 40;

export function assessEmotionalBandwidth({ userInput, hostCapacity = 50 }) {
  const lower = (userInput || '').toLowerCase();
  const triggersDetected = TRAUMA_TRIGGERS.filter(t => lower.includes(t));

  const pivotSuggested = triggersDetected.length > 0 && hostCapacity < CAPACITY_THRESHOLD;

  return {
    currentLoad: hostCapacity,
    triggersDetected,
    pivotSuggested,
    pivotTopics: pivotSuggested ? PIVOT_TOPICS.slice(0, 2) : [],
  };
}

export function buildBandwidthFirewallContextString(bandwidth) {
  if (!bandwidth || bandwidth.triggersDetected.length === 0) return '';

  const parts = ['[SOCIAL NAVIGATION — BANDWIDTH FIREWALL]'];
  parts.push(`User emotional capacity: ${bandwidth.currentLoad}/100.`);
  parts.push(`Potential triggers detected: ${bandwidth.triggersDetected.join(', ')}.`);

  if (bandwidth.pivotSuggested) {
    parts.push('STATUS: LOW CAPACITY + TRIGGERS DETECTED.');
    parts.push('Gently suggest pivoting to a grounding topic. Do not force — offer the option.');
    parts.push('Suggested pivot topics:');
    for (const topic of bandwidth.pivotTopics) {
      parts.push(`  - ${topic}`);
    }
    parts.push('You might say: "This feels heavy. If you want, we can come back to it. For now, tell me about [pivot topic]."');
  } else {
    parts.push('User capacity is adequate. Flag the topic but let the user lead.');
    parts.push('Check in gently: "This is a lot. Are you okay to keep going, or do you want to pause?"');
  }

  parts.push('RULE: Never force a pivot. Never dismiss the user\'s experience.');
  parts.push('[/SOCIAL NAVIGATION — BANDWIDTH FIREWALL]\n');

  return parts.join('\n') + '\n';
}