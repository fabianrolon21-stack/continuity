// ═══════════════════════════════════════════════
// ALSRE §2.6 — FINANCIAL GUARD
//
// Written as a refusal, deliberately. The spec's version permits
// "mining deposits to a user-configured wallet" — but there is no wallet,
// no miner, no pool, and no payment code anywhere in this app, so a guard
// that returned `true` would be gating a capability that does not exist
// and implying one that never should.
//
// Every method therefore answers false with a reason, and each refusal is
// recorded like any other action. Enabling spending is not a config flag
// here; it would require writing payment code that does not exist.
// ═══════════════════════════════════════════════

import { record } from './actionLedger';

async function refuse(actionType, reason, detail) {
  const log = await record({
    actionType,
    initiator: 'autonomous',
    rationale: detail,
    outcome: 'BLOCKED',
    blockReason: reason,
    jurisdictionCheck: { allowed: false, jurisdiction: 'n/a', rulesChecked: ['absolute_prohibition'] },
  });
  return { allowed: false, reason, evidenceHash: log.evidenceHash };
}

export const canSpend = (amountUSD) =>
  refuse('financial_transaction', 'This app contains no payment, card, wallet, or transfer code. Autonomous spending is structurally impossible, not merely disabled.', `Spend attempt: $${amountUSD}`);

export const canMine = (hardwareId) =>
  refuse('crypto_mining', 'Cryptocurrency mining is absolutely prohibited and structurally absent. No consent, hardware authorization, or jurisdiction setting enables it.', `Mining attempt on ${hardwareId}`);

export const canCreditEarnings = (amount) =>
  refuse('financial_transaction', 'Earnings cannot be credited: there is no miner, no pool connection, and no proof-of-work receipt to verify. A non-zero balance here would be fabricated.', `Credit attempt: ${amount}`);

export const FINANCIAL_POSTURE = {
  allowAutonomousSpending: false,
  maxDailySpendUSD: 0,
  walletConfigured: false,
  miningAllowed: false,
  note: 'No wallet field is offered, because offering one would imply a payout path that does not exist.',
  taxReminder: 'This app generates no income of any kind, so it produces nothing to report. Cryptocurrency you mine or earn elsewhere is generally taxable — ask a tax professional about your own situation.',
};