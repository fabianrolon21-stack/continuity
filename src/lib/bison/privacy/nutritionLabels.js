// ═══════════════════════════════════════════════
// DATA NUTRITION LABELS (Package 44)
// Every feature states plainly what it needs, why,
// whether it is stored, and whether it is shared.
// ═══════════════════════════════════════════════

export const NUTRITION_LABELS = [
  {
    channel: 'weather',
    feature: 'Weather',
    needs: 'Approximate location',
    why: 'To match the sanctuary sky to your real sky',
    stored: false,
    shared: false,
  },
  {
    channel: 'web',
    feature: 'Web / Wikipedia',
    needs: 'Your current question',
    why: 'To look up a fact you asked about',
    stored: false,
    shared: false,
  },
  {
    channel: 'external_ai',
    feature: 'External AI',
    needs: 'Your current query',
    why: 'To consult a second model for comparison',
    stored: false,
    shared: false,
  },
  {
    channel: 'oracle',
    feature: 'Oracle Consultation',
    needs: 'A sanitized version of your question',
    why: 'To hear a different reasoning voice',
    stored: true,
    shared: false,
  },
  {
    channel: 'news',
    feature: 'News',
    needs: 'Topic keywords only',
    why: 'To surface relevant current events',
    stored: false,
    shared: false,
  },
  {
    channel: 'community',
    feature: 'Community',
    needs: 'Achievements only, anonymised',
    why: 'To contribute to shared learning',
    stored: true,
    shared: true,
  },
  {
    channel: 'updates',
    feature: 'Update Checks',
    needs: 'Version numbers',
    why: 'To learn when a newer component exists',
    stored: true,
    shared: false,
  },
  {
    channel: 'tools',
    feature: 'External Tools',
    needs: 'Only the parameters the tool requires',
    why: 'To run a tool you invoked deliberately',
    stored: true,
    shared: false,
  },
];

export function labelFor(channel) {
  return NUTRITION_LABELS.find(l => l.channel === channel) || null;
}