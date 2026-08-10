// Layer 4 — Memory. Decays naturally; important events persist.

const MAX_MEMORIES = 40;

export function remember(agent, { tick, type, subjectId, summary, importance = 0.4 }) {
  agent.memories.push({ tick, type, subjectId: subjectId || null, summary, importance, strength: importance });
  if (agent.memories.length > MAX_MEMORIES) {
    agent.memories.sort((a, b) => b.strength - a.strength);
    agent.memories.length = MAX_MEMORIES;
  }
}

export function decayMemories(agent) {
  for (const m of agent.memories) {
    // Important memories resist decay; trivia fades quickly.
    m.strength = Math.max(0, m.strength - 0.02 * (1.2 - m.importance));
  }
  agent.memories = agent.memories.filter(m => m.strength > 0.05);
}

export function reinforce(agent, subjectId, amount = 0.15) {
  for (const m of agent.memories) {
    if (m.subjectId === subjectId) m.strength = Math.min(1, m.strength + amount);
  }
}

export function memoriesAbout(agent, subjectId) {
  return agent.memories.filter(m => m.subjectId === subjectId).sort((a, b) => b.strength - a.strength);
}