// ═══════════════════════════════════════════════
// SRTRS §2, §6, §12 — SCOPED RESOURCE APPROVALS
// Replaces `userApproved: boolean`, which cannot answer: approved for
// what, how much, until when, for which service, and revocable how.
//
// State machine: DISCOVERED → REVIEWED → VERIFIED → PRESENTED →
// APPROVED → AUTHORIZED → USED. Never SEARCH → USE.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { emit } from '@/lib/bison/observability/observabilityBus';

const BUDGET_DEFAULT = {
  monthlyComputeAllowanceUSD: 0,
  storageAllowanceGB: 0,
  networkAllowanceGB: 0,
  approvalStatus: 'UNCONFIGURED',
};

export async function getBudget() {
  const user = await base44.auth.me().catch(() => null);
  const stored = user?.srtrs_budget || {};
  const now = new Date();
  return {
    ...BUDGET_DEFAULT,
    ...stored,
    billingPeriodStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    billingPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
  };
}

export async function setBudget(patch) {
  const current = await getBudget();
  const next = { ...current, ...patch };
  // A budget ceiling is not an authorization. Spending still needs an approval.
  next.approvalStatus = next.monthlyComputeAllowanceUSD > 0 ? 'APPROVED' : 'UNCONFIGURED';
  await base44.auth.updateMe({ srtrs_budget: next }).catch(() => {});
  return next;
}

/**
 * Ask the user. Creates a PENDING record — never a charge, subscription,
 * payment method, or budget increase.
 */
export async function requestApproval({ category, serviceName, capability, maximumCostUSD, justification, alternative, days = 30 }) {
  const record = await base44.entities.ResourceApproval.create({
    approval_id: `appr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    category,
    service_name: serviceName,
    capability,
    maximum_cost_usd: maximumCostUSD,
    justification,
    alternative_offered: alternative || 'Continue in reduced-resource mode at no additional cost.',
    expires_at: new Date(Date.now() + days * 86400000).toISOString(),
    status: 'PENDING',
  });
  emit({ subsystem: 'sustainability', event_type: 'approval_requested', outcome: 'PENDING', meta: { serviceName, maximumCostUSD } });
  return record;
}

export async function decideApproval(id, approve) {
  const patch = approve
    ? { status: 'APPROVED', approved_at: new Date().toISOString() }
    : { status: 'DECLINED' };
  const record = await base44.entities.ResourceApproval.update(id, patch);
  emit({ subsystem: 'sustainability', event_type: 'approval_decided', outcome: patch.status, meta: { id } });
  return record;
}

export async function revokeApproval(id) {
  return base44.entities.ResourceApproval.update(id, { status: 'REVOKED', revoked_at: new Date().toISOString() });
}

function isLive(r) {
  if (r.status !== 'APPROVED') return false;
  if (r.revoked_at) return false;
  if (r.expires_at && new Date(r.expires_at) <= new Date()) return false;
  return true;
}

export async function listApprovals() {
  const records = await base44.entities.ResourceApproval.list('-created_date', 50).catch(() => []);
  return records.map(r => ({
    ...r,
    live: isLive(r),
    effectiveStatus: r.status === 'APPROVED' && !isLive(r) ? 'EXPIRED' : r.status,
  }));
}

/**
 * The only gate that authorizes touching a paid external service.
 * Expiry is evaluated at use time, so an approval lapses on its own.
 */
export async function authorizationFor(serviceName) {
  const approvals = await listApprovals();
  const match = approvals.find(r => r.service_name === serviceName && r.live);
  if (!match) {
    return { authorized: false, reason: `No live approval for ${serviceName}. Discovery and verification do not authorize use.` };
  }
  return { authorized: true, approval: match, ceilingUSD: match.maximum_cost_usd, expiresAt: match.expires_at };
}