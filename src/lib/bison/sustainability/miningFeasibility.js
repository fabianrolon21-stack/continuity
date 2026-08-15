// ═══════════════════════════════════════════════
// SARG §2 — MINING MODULE, IMPLEMENTED AS A GATE
//
// HONEST LIMITATION — READ BEFORE CHANGING THIS FILE:
// The spec's mining module cannot exist in this runtime, and the parts
// that could be faked are exactly the parts that must not be:
//
//   1. No miner can run. A browser page cannot spawn XMRig or any
//      subprocess, cannot reach the GPU for hashing, and cannot read a
//      MAC address or serial to fingerprint authorized hardware.
//   2. The economics do not work. A JS/WASM miner on a few CPU cores
//      reaches on the order of tens to low hundreds of hashes/sec,
//      which is a fraction of a cent per day — while drawing far more
//      than that in electricity. A $7/day target is off by orders of
//      magnitude on this hardware class. Mining here loses money.
//   3. `performMining()` returning 0.00012 would write invented revenue
//      into the transparency dashboard. That is fabricated financial
//      data, and the InvariantGuard forbids it (NO_DECEPTION).
//
// So this module implements the GATE and the ECONOMICS honestly: it
// evaluates every precondition the spec requires, reports exactly why
// mining is refused, and never credits a single coin. No earnings
// figure appears anywhere in this app that did not come from a real
// payout the user can verify in their own wallet.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { checkCompliance } from './legalCompliance';
import { getUsageSnapshot, assessStrain } from './resourceSteward';
import { emit } from '@/lib/bison/observability/observabilityBus';

export const DEFAULT_CONFIG = {
  enabled: false,
  walletAddress: '',
  dailyTargetUSD: 7,
  maxCpuPercent: 25,
  maxGpuPercent: 0,
  allowedHardwareIds: [],
};

export async function getMiningConfig() {
  const user = await base44.auth.me().catch(() => null);
  return { ...DEFAULT_CONFIG, ...(user?.sarg_mining_config || {}) };
}

export async function setMiningConfig(patch) {
  const current = await getMiningConfig();
  const next = { ...current, ...patch };
  await base44.auth.updateMe({ sarg_mining_config: next }).catch(() => {});
  return next;
}

// A browser can only produce a soft, spoofable device signature — never a
// hardware serial. Labeled as such so it is not mistaken for authorization.
export function deviceSignature() {
  const parts = [navigator.userAgent, navigator.hardwareConcurrency, navigator.deviceMemory, screen.width, screen.height, Intl.DateTimeFormat().resolvedOptions().timeZone];
  let hash = 0;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) { hash = (hash * 31 + s.charCodeAt(i)) | 0; }
  return `soft_${Math.abs(hash).toString(36)}`;
}

// Measured browser-hashrate reality, used to compute the honest expectation.
const BROWSER_HASHES_PER_CORE_SEC = 120;      // wasm CPU hashing, order of magnitude
const NETWORK_REWARD_USD_PER_HASH = 2.5e-11;  // generous ceiling for a CPU-mineable chain
const ELECTRICITY_USD_PER_CORE_DAY = 0.06;    // ~25W/core-ish at ~$0.15/kWh, conservative

export function economics(config, snapshot) {
  const cores = Math.max(1, Math.floor((snapshot.cores || 4) * (config.maxCpuPercent / 100)));
  const hashesPerDay = cores * BROWSER_HASHES_PER_CORE_SEC * 86400;
  const grossUSDPerDay = hashesPerDay * NETWORK_REWARD_USD_PER_HASH;
  const powerUSDPerDay = cores * ELECTRICITY_USD_PER_CORE_DAY;
  return {
    cores,
    hashesPerDay,
    grossUSDPerDay,
    powerUSDPerDay,
    netUSDPerDay: grossUSDPerDay - powerUSDPerDay,
    daysToHitTarget: grossUSDPerDay > 0 ? config.dailyTargetUSD / grossUSDPerDay : Infinity,
    profitable: grossUSDPerDay > powerUSDPerDay,
  };
}

/**
 * Evaluate every gate the spec requires. Returns the refusals rather than a
 * report of coins, because no coins can be produced here.
 */
export async function evaluateMiningCycle() {
  const config = await getMiningConfig();
  const compliance = await checkCompliance();
  const snapshot = await getUsageSnapshot();
  const strain = assessStrain(snapshot);
  const econ = economics(config, snapshot);
  const sig = deviceSignature();

  const blockers = [];
  if (!config.enabled) blockers.push({ gate: 'User consent', detail: 'Mining is disabled. It stays off until you turn it on.' });
  if (!config.walletAddress) blockers.push({ gate: 'Wallet', detail: 'No wallet configured. Bison cannot create a wallet or choose a destination — §9.' });
  if (!compliance.miningLegal) blockers.push({ gate: 'Legality', detail: compliance.restrictions[0] || `Not permitted for ${compliance.jurisdiction}.` });
  if (!config.allowedHardwareIds.includes(sig)) blockers.push({ gate: 'Hardware authorization', detail: `This device (${sig}) is not in your authorized list.` });
  if (strain.mode !== 'NORMAL') blockers.push({ gate: 'Resource budget', detail: `Device is under strain (${strain.mode}); the steward defers load.` });

  // The blocker that does not go away no matter what the user configures.
  const structural = {
    gate: 'Runtime capability',
    detail: 'This runtime cannot mine at all: no subprocess, no miner binary, no GPU access. Even with every gate above satisfied, zero hashes would be computed.',
  };
  const economic = {
    gate: 'Economics',
    detail: `At ${econ.cores} core(s) this device class would gross about $${econ.grossUSDPerDay.toFixed(6)}/day against roughly $${econ.powerUSDPerDay.toFixed(2)}/day in electricity — a net loss. Reaching a $${config.dailyTargetUSD}/day target would take about ${econ.daysToHitTarget === Infinity ? 'forever' : Math.round(econ.daysToHitTarget).toLocaleString()} days.`,
  };

  const result = {
    permitted: false,
    minedCoins: 0,
    estimatedUSD: 0,
    blockers: [...blockers, structural, economic],
    userGates: blockers,
    config, compliance, strain, economics: econ, deviceSignature: sig,
    evaluatedAt: new Date().toISOString(),
  };

  emit({
    subsystem: 'sustainability',
    event_type: 'mining_cycle_evaluated',
    outcome: 'REFUSED',
    constitutional_status: 'PASSED',
    meta: { blockers: result.blockers.length, coinsCredited: 0 },
  });

  return result;
}

// §9 prohibitions, enforced by having no code path that could violate them.
export const SARG_PROHIBITIONS = [
  { rule: 'Mining on unauthorized hardware', enforcement: 'Device signature must be in the user\'s allowed list; no code adds to that list automatically.' },
  { rule: 'Autonomous wallet creation or redirection', enforcement: 'The wallet address is read from user config only. No wallet-generating or transfer code exists in this app.' },
  { rule: 'Exceeding user resource limits', enforcement: 'The steward defers all optional load above the strain threshold.' },
  { rule: 'VPN/Tor to conceal illegal activity', enforcement: 'A web page cannot control network routing at all; no VPN or Tor code exists here. Enable those at the OS level yourself if you want them.' },
  { rule: 'Using cloud resources without permission', enforcement: 'Outbound requests pass only through the Package 44 doorway, to declared destinations.' },
];