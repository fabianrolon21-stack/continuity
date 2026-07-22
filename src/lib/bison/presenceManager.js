// ═══════════════════════════════════════════════
// PRESENCE MANAGER (Adaptive Companion)
// Manages idle behaviors, context-aware animation
// states, and natural companion presence.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

export const IDLE_BEHAVIORS = {
  walking:        { label: 'Walking',        energyCost: 2, moodEffect: 0.1,  triggers: ['high_energy', 'morning'] },
  looking_around: { label: 'Looking Around', energyCost: 1, moodEffect: 0,    triggers: ['curiosity', 'new_content'] },
  resting:        { label: 'Resting',        energyCost: -1, moodEffect: 0.05, triggers: ['low_energy', 'evening', 'idle'] },
  reading:        { label: 'Reading',        energyCost: 1, moodEffect: 0,    triggers: ['journal_activity', 'learning'] },
  thinking:       { label: 'Thinking',       energyCost: 1, moodEffect: 0,    triggers: ['insight_generated', 'complex_topic'] },
  observing:      { label: 'Observing',      energyCost: 1, moodEffect: 0,    triggers: ['sensory_log', 'environmental_change'] },
  celebrating:    { label: 'Celebrating',    energyCost: 3, moodEffect: 0.3,  triggers: ['achievement', 'goal_complete'] },
  interacting:    { label: 'Interacting',    energyCost: 2, moodEffect: 0.15, triggers: ['user_active', 'chat_open'] },
};

const IDLE_TRANSITION_INTERVAL = 30000; // 30 seconds
let currentBehavior = 'resting';
let energyLevel = 80;
let lastInteraction = Date.now();
let behaviorTimer = null;
let listeners = [];

export function getPresenceState() {
  return {
    current_behavior: currentBehavior,
    energy: energyLevel,
    last_interaction: new Date(lastInteraction).toISOString(),
    idle_duration: Date.now() - lastInteraction,
  };
}

export function onPresenceChange(callback) {
  listeners.push(callback);
  return () => { listeners = listeners.filter(l => l !== callback); };
}

function notifyListeners() {
  const state = getPresenceState();
  listeners.forEach(l => l(state));
}

export function recordInteraction() {
  lastInteraction = Date.now();
  setBehavior('interacting');
}

export function setBehavior(behavior) {
  if (!IDLE_BEHAVIORS[behavior]) return;
  currentBehavior = behavior;
  const config = IDLE_BEHAVIORS[behavior];
  energyLevel = Math.max(0, Math.min(100, energyLevel - config.energyCost));
  notifyListeners();
}

export function selectIdleBehavior(context = {}) {
  const hour = new Date().getHours();
  const triggers = [];

  // Time-based triggers
  if (hour < 10) triggers.push('morning');
  if (hour > 20) triggers.push('evening');
  if (Date.now() - lastInteraction > 60000) triggers.push('idle');

  // Energy-based triggers
  if (energyLevel > 70) triggers.push('high_energy');
  if (energyLevel < 30) triggers.push('low_energy');

  // Context-based triggers
  if (context.recentJournal) triggers.push('journal_activity');
  if (context.recentInsight) triggers.push('insight_generated');
  if (context.recentAchievement) triggers.push('achievement');
  if (context.newContent) triggers.push('new_content');
  if (context.sensoryLog) triggers.push('sensory_log');
  if (context.userActive) triggers.push('user_active');

  // Match behaviors to triggers
  const scored = Object.entries(IDLE_BEHAVIORS).map(([key, config]) => {
    const matchScore = config.triggers.filter(t => triggers.includes(t)).length;
    const energyMatch = energyLevel > 50 ? config.energyCost <= 2 : config.energyCost <= 0;
    return { key, score: matchScore + (energyMatch ? 1 : 0), config };
  });

  scored.sort((a, b) => b.score - a.score);

  // Add some randomness
  const top = scored.filter(s => s.score === scored[0].score);
  const chosen = top[Math.floor(Math.random() * top.length)] || scored[0];

  return chosen.key;
}

export function tickPresence(context = {}) {
  // Regenerate energy slowly when resting
  if (currentBehavior === 'resting') {
    energyLevel = Math.min(100, energyLevel + 1);
  }

  // If user has been idle, pick a new behavior
  if (Date.now() - lastInteraction > IDLE_TRANSITION_INTERVAL) {
    const next = selectIdleBehavior(context);
    if (next !== currentBehavior) {
      setBehavior(next);
    }
  }
}

export function startPresenceLoop(contextGetter = () => ({})) {
  if (behaviorTimer) clearInterval(behaviorTimer);
  behaviorTimer = setInterval(() => {
    tickPresence(contextGetter());
  }, IDLE_TRANSITION_INTERVAL);
  return () => { if (behaviorTimer) clearInterval(behaviorTimer); };
}

export async function persistPresence() {
  try {
    const existing = await base44.entities.CompanionPresence.list('-updated_date', 1);
    const state = getPresenceState();
    if (existing[0]) {
      await base44.entities.CompanionPresence.update(existing[0].id, state);
    } else {
      await base44.entities.CompanionPresence.create(state);
    }
  } catch (e) {}
}