// ═══════════════════════════════════════════════
// RISK GATE (Base 44.4)
// Before executing significant actions, run:
// Constitution → Permissions → Safety → Risk.
// Only proceed if all pass.
// ═══════════════════════════════════════════════

import { validateAction } from '../constitutionalKernel';
import { audit } from './auditLog';

export async function evaluateRisk(action) {
  const failures = [];
  let passed = true;

  // 1. Constitution check
  try {
    const constitutionalResult = validateAction(action);
    if (constitutionalResult === 'DENY') {
      failures.push('constitutional_violation');
      passed = false;
    }
  } catch (e) {
    failures.push('constitution_check_error');
    passed = false;
  }

  // 2. Permission check
  if (action.requiresPermission && !action.permissionGranted) {
    failures.push('missing_permission');
    passed = false;
  }

  // 3. Safety check
  if (action.safetyLevel === 'high' && !action.userConfirmed) {
    failures.push('requires_user_confirmation');
    passed = false;
  }

  // 4. Resource check
  if (
    action.estimatedResources?.network === 'required' &&
    !navigator.onLine
  ) {
    failures.push('network_required_offline');
    passed = false;
  }

  audit({
    module: 'risk_gate',
    action: action.type || 'unknown',
    outcome: passed ? 'PASS' : 'DENY',
    reason: failures.length > 0 ? failures.join('; ') : 'all_checks_passed',
    priority: 0,
  });

  return {
    passed,
    failures,
    recommendation: passed ? 'proceed' : 'deny',
  };
}

export function buildRiskGateContextString() {
  return '\nRISK GATE: All significant actions are validated against constitution, permissions, safety, and resource checks before execution.\n';
}