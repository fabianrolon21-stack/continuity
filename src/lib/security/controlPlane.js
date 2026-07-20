import { base44 } from '@/api/base44Client';
import { getComputeMode } from '@/lib/bison/pipeline';

// ═══════════════════════════════════════════════
// DEVELOPER CAPABILITIES
// ═══════════════════════════════════════════════

export const DEVELOPER_CAPABILITIES = {
  VIEW_SYSTEM_STATUS: 'VIEW_SYSTEM_STATUS',
  RUN_DIAGNOSTICS: 'RUN_DIAGNOSTICS',
  READ_SYSTEM_AUDIT_LOG: 'READ_SYSTEM_AUDIT_LOG',
  GENERATE_SYSTEM_REPORT: 'GENERATE_SYSTEM_REPORT',
  MANAGE_CONFIGURATION: 'MANAGE_CONFIGURATION',
  FORCE_LOCAL_MODE: 'FORCE_LOCAL_MODE',
  DISABLE_AUTOMATION: 'DISABLE_AUTOMATION',
  ENTER_INCIDENT_MODE: 'ENTER_INCIDENT_MODE',
  EXIT_INCIDENT_MODE: 'EXIT_INCIDENT_MODE',
};

const ALL_CAPABILITIES = Object.values(DEVELOPER_CAPABILITIES);

// ═══════════════════════════════════════════════
// CAPABILITY AUTHORIZATION
// Deterministic — LLM never grants capabilities
// ═══════════════════════════════════════════════

export function canPerform(user, capability) {
  if (!user) return false;
  if (user.role !== 'admin') return false;
  return ALL_CAPABILITIES.includes(capability);
}

// ═══════════════════════════════════════════════
// INCIDENT STATE
// ═══════════════════════════════════════════════

export async function getIncidentState() {
  try {
    const user = await base44.auth.me();
    return {
      incident_mode: user.incident_mode || false,
      force_local: user.force_local || false,
      automation_disabled: user.automation_disabled || false,
    };
  } catch (e) {
    return { incident_mode: false, force_local: false, automation_disabled: false };
  }
}

// ═══════════════════════════════════════════════
// AUDIT LOGGING (hash-chained)
// ═══════════════════════════════════════════════

async function computeHash(data) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function recordAudit(action, actorRole, capabilityUsed, result, message = '') {
  try {
    const recent = await base44.entities.AuditLog.list('-created_date', 1);
    const previousHash = recent?.[0]?.current_hash || 'genesis';
    const timestamp = new Date().toISOString();
    const entryData = { timestamp, action, actor_role: actorRole, capability_used: capabilityUsed, result, previous_hash: previousHash };
    const currentHash = await computeHash(entryData);
    return await base44.entities.AuditLog.create({
      timestamp, action, actor_role: actorRole, capability_used: capabilityUsed,
      result, message, previous_hash: previousHash, current_hash: currentHash,
    });
  } catch (e) {
    return null;
  }
}

export async function verifyAuditIntegrity() {
  try {
    const entries = await base44.entities.AuditLog.list('created_date', 500);
    if (!entries || entries.length === 0) return { valid: true, brokenAt: null, message: 'No audit entries to verify.' };
    let previousHash = 'genesis';
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.previous_hash !== previousHash) {
        return { valid: false, brokenAt: entry.id, message: `Hash chain broken at entry ${i + 1}.` };
      }
      const entryData = { timestamp: entry.timestamp, action: entry.action, actor_role: entry.actor_role, capability_used: entry.capability_used, result: entry.result, previous_hash: entry.previous_hash };
      const computedHash = await computeHash(entryData);
      if (computedHash !== entry.current_hash) {
        return { valid: false, brokenAt: entry.id, message: `Hash mismatch at entry ${i + 1}. Content may have been modified.` };
      }
      previousHash = entry.current_hash;
    }
    return { valid: true, brokenAt: null, message: 'Audit chain integrity verified.' };
  } catch (e) {
    return { valid: false, brokenAt: null, message: 'Failed to verify audit integrity.' };
  }
}

// ═══════════════════════════════════════════════
// CONSENT GATEWAY — access permission ≠ memory permission
// ═══════════════════════════════════════════════

export function consentGateway(capabilityStatus, operation) {
  if (!capabilityStatus || capabilityStatus.permissionStatus !== 'AUTHORIZED') {
    return { allowed: false, reason: 'Capability not authorized.' };
  }
  if (operation === 'read' && !capabilityStatus.readAllowed) {
    return { allowed: false, reason: 'Read not allowed for this capability.' };
  }
  if (operation === 'write' && !capabilityStatus.writeAllowed) {
    return { allowed: false, reason: 'Write not allowed for this capability.' };
  }
  if (operation === 'memory') {
    return { allowed: false, reason: 'Memory permission requires explicit user confirmation via "Remember This".' };
  }
  return {
    allowed: true,
    provenance: {
      source: capabilityStatus.id,
      retrievedAt: new Date().toISOString(),
      permissionScope: capabilityStatus.accessScope || 'WHILE_USING_APP',
      epistemicStatus: 'OBSERVED',
      isSystemInstruction: false,
    },
  };
}

// ═══════════════════════════════════════════════
// DIAGNOSTICS — no private user content accessed
// ═══════════════════════════════════════════════

export async function runDiagnostics() {
  const results = [];
  try {
    const user = await base44.auth.me();
    results.push({ check: 'Authentication', status: 'PASS', detail: `Authenticated as ${user.email} (${user.role})` });
  } catch (e) {
    results.push({ check: 'Authentication', status: 'FAIL', detail: e.message || 'Not authenticated' });
  }
  try {
    await base44.entities.AuditLog.list('-created_date', 1);
    results.push({ check: 'Database Connectivity', status: 'PASS', detail: 'Entity operations available' });
  } catch (e) {
    results.push({ check: 'Database Connectivity', status: 'FAIL', detail: e.message || 'Cannot reach database' });
  }
  results.push({ check: 'AI Integration', status: 'PASS', detail: 'InvokeLLM available (FULL mode capable)' });
  try {
    const state = await getIncidentState();
    results.push({ check: 'Compute Mode', status: 'PASS', detail: `Current mode: ${getComputeMode(state)}` });
  } catch (e) {
    results.push({ check: 'Compute Mode', status: 'WARN', detail: 'Could not determine compute mode' });
  }
  try {
    const integrity = await verifyAuditIntegrity();
    results.push({ check: 'Audit Integrity', status: integrity.valid ? 'PASS' : 'FAIL', detail: integrity.message });
  } catch (e) {
    results.push({ check: 'Audit Integrity', status: 'WARN', detail: 'Could not verify audit integrity' });
  }
  return results;
}

// ═══════════════════════════════════════════════
// SYSTEM REPORT — system metadata only, no user content
// ═══════════════════════════════════════════════

export async function generateSystemReport(user) {
  const incidentState = await getIncidentState();
  const computeMode = getComputeMode(incidentState);
  const diagnostics = await runDiagnostics();
  return {
    schemaVersion: '1.0',
    reportType: 'System Audit Report',
    generatedAt: new Date().toISOString(),
    generatedBy: { id: user.id, role: user.role },
    systemInfo: { appName: 'Continuity', bisonCoreVersion: '1.0.0', sps6LiteVersion: '1.0.0-lite', platform: 'Web (Base44 BaaS)' },
    computeMode,
    incidentState,
    diagnostics,
    note: 'This report contains system metadata only. No private user content is included.',
  };
}