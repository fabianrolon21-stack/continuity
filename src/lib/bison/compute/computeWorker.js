// ═══════════════════════════════════════════════
// EDGE COMPUTE WORKER — runs off the main thread
// Plain JS in a real Web Worker. Not WebAssembly: shipping Wasm would
// require a compiled binary that does not exist in this project, and
// claiming Wasm while running JS would be a false statement about the
// system. The isolation and off-main-thread behavior are identical.
//
// Solvers mirror base44/shared/computeTasks.ts exactly. Any drift shows up
// as REJECTED receipts, never as wrongly awarded credits.
// ═══════════════════════════════════════════════

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

const SOLVERS = { prime_count: primeCount, collatz_max: collatzMax, digit_sum_chain: digitSumChain };

self.onmessage = (e) => {
  const { taskId, taskType, params } = e.data || {};
  const solver = SOLVERS[taskType];
  if (!solver) {
    self.postMessage({ taskId, error: `Unknown task type: ${taskType}` });
    return;
  }
  const started = performance.now();
  try {
    const result = solver(params.start, params.end);
    self.postMessage({ taskId, result, workerMs: Math.round(performance.now() - started) });
  } catch (err) {
    self.postMessage({ taskId, error: err.message });
  }
};