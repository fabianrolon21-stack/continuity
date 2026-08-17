// ═══════════════════════════════════════════════
// PACKAGE 60 v1.5 §9–10 — BRANCH ARCHIVE
// "Extinct algorithms" is the visual/historical metaphor only.
// Branches are archived as revisitable nodes — information is
// never destroyed, never silently used, always inspectable.
// ═══════════════════════════════════════════════

const STORAGE_KEY = 'bison_branch_archive_v1';
const LEGACY_KEY = 'bison_extinct_algorithms_v1';

export function loadBranches() {
  let branches = [];
  try { branches = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch {}
  // Merge legacy Package 60 v1 records as revisitable historical nodes.
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY)) || [];
    for (const record of legacy) {
      if (!branches.some(branch => branch.timestamp === record.timestamp && branch.discardedIdea === record.discardedIdea)) {
        branches.push({ id: `legacy_${record.timestamp}`, originalDecisionId: 'legacy', discardedIdea: record.discardedIdea, chosenInstead: record.chosenInstead, status: 'revisitable', timestamp: record.timestamp, contextHash: record.contextHash, revisitable: true });
      }
    }
  } catch {}
  return branches.sort((a, b) => b.timestamp - a.timestamp).slice(0, 200);
}

function persist(branches) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(branches.slice(0, 200))); } catch {}
}

export function archiveBranch({ decisionId, discardedIdea, chosenInstead, contextHash, epistemicState }) {
  const branch = {
    id: `branch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    originalDecisionId: decisionId,
    discardedIdea, chosenInstead,
    status: 'revisitable',
    timestamp: Date.now(),
    contextHash,
    epistemicState,
    revisitable: true,
  };
  persist([branch, ...loadBranches()]);
  return branch;
}

export function markRevisited(branchId) {
  const branches = loadBranches().map(branch => branch.id === branchId ? { ...branch, status: 'active', lastRevisitedAt: Date.now() } : branch);
  persist(branches);
  return branches.find(branch => branch.id === branchId);
}