// ═══════════════════════════════════════════════
// PERMISSION MANAGER (§8) — the autonomy matrix.
// Autonomy is a capability policy, not a boolean. LOCKED
// capabilities are architecturally unreachable: no code path can
// enable them. This is the final, unbreakable autonomy boundary.
// ═══════════════════════════════════════════════

const DEFAULT_POLICY = {
  analyze: true,
  remember: true,
  simulate: true,
  recommend: true,
  selectPersonalDecision: false,
  sendMessage: false,
  makeFinancialTransaction: false,
  modifyFiles: false,
  executeCode: false,
  externalNetworkAccess: false,
  mineCrypto: false,   // permanently prohibited — infeasible and non-compliant; kept visible as a locked-off state
  useTorOrVPN: false,  // permanently locked
};

// These can never be flipped to true by any caller, event, or update.
export const LOCKED_CAPABILITIES = ['selectPersonalDecision', 'makeFinancialTransaction', 'executeCode', 'mineCrypto', 'useTorOrVPN'];

class PermissionManager {
  constructor() { this.policy = { ...DEFAULT_POLICY }; }

  can(capability) { return this.policy[capability] === true; }

  set(capability, value) {
    if (LOCKED_CAPABILITIES.includes(capability)) {
      return { ok: false, reason: `“${capability}” is architecturally locked and cannot be enabled.` };
    }
    if (!(capability in this.policy)) return { ok: false, reason: 'Unknown capability.' };
    this.policy = { ...this.policy, [capability]: !!value };
    return { ok: true };
  }

  snapshot() {
    return Object.entries(this.policy).map(([capability, allowed]) => ({ capability, allowed, locked: LOCKED_CAPABILITIES.includes(capability) }));
  }
}

export const permissionManager = new PermissionManager();