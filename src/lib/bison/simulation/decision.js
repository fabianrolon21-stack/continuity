// Layer 7 — Decision. Highest expected value wins; seeded jitter only breaks ties.

import { jitter } from './rng';

export function decide(predictions, rng) {
  let best = null;
  for (const p of predictions) {
    const score = p.expectedValue + jitter(rng, 0.03);
    if (!best || score > best.score) best = { ...p, score };
  }
  return best;
}