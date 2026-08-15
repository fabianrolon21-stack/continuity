// ═══════════════════════════════════════════════
// DISTRIBUTED EDGE COMPUTE — TASK DEFINITIONS (server side)
// Shared by issueComputeTask and verifyComputeReceipt.
//
// Tasks are deterministic: the same params always yield the same answer,
// which is what makes a submitted receipt checkable at all. The answer is
// NEVER stored on the issued record — if it were, a client could read it
// back and "complete" the task without doing the work.
//
// The browser worker carries its own copy of these solvers because
// frontend code cannot import server modules. The two must stay in sync;
// a mismatch surfaces immediately as REJECTED receipts rather than
// silently crediting wrong answers.
// ═══════════════════════════════════════════════

export const TASK_TYPES = ['prime_count', 'collatz_max', 'digit_sum_chain'];

export function generateTask(taskType) {
  const start = 100000 + Math.floor(Math.random() * 400000);
  const spans = { prime_count: 60000, collatz_max: 25000, digit_sum_chain: 120000 };
  const span = spans[taskType] || 50000;
  return {
    task_type: taskType,
    params: { start, end: start + span },
    difficulty: Math.round(span / 10000),
  };
}

function primeCount(start, end) {
  let count = 0;
  for (let n = start; n <= end; n++) {
    if (n < 2) continue;
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) count++;
  }
  return count;
}

function collatzMax(start, end) {
  let best = 0;
  for (let n = start; n <= end; n++) {
    let v = n, steps = 0;
    while (v !== 1) {
      v = v % 2 === 0 ? v / 2 : 3 * v + 1;
      steps++;
    }
    if (steps > best) best = steps;
  }
  return best;
}

function digitSumChain(start, end) {
  let total = 0;
  for (let n = start; n <= end; n++) {
    let v = n;
    while (v >= 10) {
      let s = 0;
      while (v > 0) { s += v % 10; v = Math.floor(v / 10); }
      v = s;
    }
    total += v;
  }
  return total;
}

/** The authoritative answer. Recomputed at verification time, never stored. */
export function solve(taskType, params) {
  const { start, end } = params || {};
  if (typeof start !== 'number' || typeof end !== 'number') throw new Error('Invalid task params');
  if (taskType === 'prime_count') return primeCount(start, end);
  if (taskType === 'collatz_max') return collatzMax(start, end);
  if (taskType === 'digit_sum_chain') return digitSumChain(start, end);
  throw new Error(`Unknown task type: ${taskType}`);
}