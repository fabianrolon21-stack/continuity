// ═══════════════════════════════════════════════
// USTP — RECOVERY LAYER (Package 47, Layer 6)
// Minimal seeds sufficient to reconstruct knowledge
// without ambiguity. Recovery never bypasses
// constitutional validation.
// ═══════════════════════════════════════════════

import { sha256, PROTOCOL_VERSION } from './trust';
import { REGISTRY_VERSION, registrySummary } from './conceptRegistry';
import { LOCAL_CAPABILITIES } from './negotiation';
import { HARD_INVARIANTS, LIVING_CONSTITUTION } from '@/lib/bison/constitutionalKernel';

// Build the Minimal Recovery Seed.
export async function buildRecoverySeed() {
  const constitutionText = [...HARD_INVARIANTS, ...LIVING_CONSTITUTION].join('\n');
  const seed = {
    kind: 'ustp_minimal_recovery_seed',
    protocol_version: PROTOCOL_VERSION,
    bootloader: { entry: 'continuity/bison', runtime: 'web' },
    constitution_hash: await sha256(constitutionText),
    runtime_manifest: { app: 'Continuity', core: 'Bison v1.0.0' },
    capability_registry: LOCAL_CAPABILITIES,
    memory_schema_version: '1',
    semantic_registry: registrySummary(),
    expansion_manifest: ['constitution', 'concept_registry', 'capabilities', 'memory_schema'],
    created_at: new Date().toISOString(),
  };
  seed.integrity_signature = await sha256(JSON.stringify({ ...seed, integrity_signature: undefined }));
  return seed;
}

// Verify a seed's integrity and constitutional continuity.
export async function verifyRecoverySeed(seed) {
  const checks = [];
  const expected = await sha256(JSON.stringify({ ...seed, integrity_signature: undefined }));
  checks.push({ check: 'Integrity signature', pass: expected === seed?.integrity_signature });

  const constitutionText = [...HARD_INVARIANTS, ...LIVING_CONSTITUTION].join('\n');
  const constitutionHash = await sha256(constitutionText);
  checks.push({ check: 'Constitution hash matches living constitution', pass: seed?.constitution_hash === constitutionHash });

  checks.push({ check: 'Protocol version compatible', pass: String(seed?.protocol_version || '').split('.')[0] === PROTOCOL_VERSION.split('.')[0] });
  checks.push({ check: 'Semantic registry version present', pass: !!seed?.semantic_registry?.version });
  checks.push({ check: 'Registry version current', pass: seed?.semantic_registry?.version === REGISTRY_VERSION });
  checks.push({ check: 'Expansion manifest complete', pass: Array.isArray(seed?.expansion_manifest) && seed.expansion_manifest.length >= 4 });

  return { valid: checks.every(c => c.pass), checks };
}

// Incremental reconstruction plan — ordered, each stage verifiable.
export function reconstructionPlan(seed) {
  return (seed?.expansion_manifest || []).map((stage, i) => ({
    order: i + 1,
    stage,
    verification: stage === 'constitution' ? 'hash against living constitution' : 'integrity signature',
  }));
}