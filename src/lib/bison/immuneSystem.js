// ═══════════════════════════════════════════════
// IMMUNE SYSTEM (Phase 25)
// PROTECT → INFORM → EMPOWER → RETURN CONTROL TO USER
// Never: PROTECT → CREATE DEPENDENCY → CONTROL
// No DarkCloudEngine in production. Adversarial model for tests only.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

export const THREAT_CATEGORIES = {
  PHISHING: 'PHISHING',
  SPAM: 'SPAM',
  SUSPICIOUS_FILE: 'SUSPICIOUS_FILE',
  POSSIBLE_DATA_EXPOSURE: 'POSSIBLE_DATA_EXPOSURE',
  ACCOUNT_SECURITY_EVENT: 'ACCOUNT_SECURITY_EVENT',
  USER_REPORTED_HARASSMENT: 'USER_REPORTED_HARASSMENT',
  USER_REPORTED_PHYSICAL_RISK: 'USER_REPORTED_PHYSICAL_RISK',
  UNKNOWN: 'UNKNOWN',
};

export const VERIFICATION_STATUS = {
  UNVERIFIED: 'UNVERIFIED',
  PLAUSIBLE: 'PLAUSIBLE',
  HIGH_CONFIDENCE: 'HIGH_CONFIDENCE',
  USER_CONFIRMED: 'USER_CONFIRMED',
};

export const RESPONSE_TIERS = {
  TIER_0: 'OBSERVE',
  TIER_1: 'LOCAL_OBSERVATION',
  TIER_2: 'INFORM',
  TIER_3: 'REVERSIBLE_PROTECTION',
  TIER_4: 'CONSEQUENTIAL_PROTECTION',
  TIER_5: 'EMERGENCY_HANDOFF',
};

const THREAT_PATTERNS = {
  PHISHING: [
    /urgent.{0,20}(verify|confirm|update).{0,20}(account|password|payment)/i,
    /click.{0,10}(here|link).{0,20}(verify|confirm|suspend|activate)/i,
    /your.{0,15}(account|password).{0,15}(has been|will be).{0,10}(suspended|locked|compromised)/i,
  ],
  SPAM: [
    /congratulations.{0,20}(winner|selected|won)/i,
    /free.{0,10}(gift|prize|offer).{0,20}(click|claim|limited)/i,
    /make money.{0,20}(fast|online|from home)/i,
  ],
  POSSIBLE_DATA_EXPOSURE: [
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
    /\b\d{3}-\d{2}-\d{4}\b/,
    /\b(?:sk-|ghp_|AKIA)[A-Za-z0-9]{10,}\b/,
  ],
};

// Store pattern type + location, NOT the raw sensitive value
function redactSensitiveValue(category) {
  return {
    patternType: category,
    location: 'user_input',
    timestamp: new Date().toISOString(),
    redacted: true,
  };
}

export function detectThreats(input) {
  if (!input || typeof input !== 'string') return [];

  const threats = [];

  for (const [category, patterns] of Object.entries(THREAT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        const evidence = category === 'POSSIBLE_DATA_EXPOSURE'
          ? redactSensitiveValue(category)
          : { pattern: 'pattern_match', location: 'user_input' };

        threats.push({
          id: `${category}_${Date.now()}`,
          category,
          severity: category === 'POSSIBLE_DATA_EXPOSURE' ? 'HIGH' : 'MEDIUM',
          confidence: 0.6,
          evidence: [evidence],
          evidenceSource: 'LOCAL_RULE',
          verificationStatus: VERIFICATION_STATUS.UNVERIFIED,
          recommendedResponseTier: 2,
        });
      }
    }
  }

  return threats;
}

// Calm protective response modulation
// Threat severity and user emotional state are SEPARATE variables
export function getImmuneResponse(threat, wellbeingState) {
  if (!threat) return null;

  const userStable = (wellbeingState?.immediateDistress || 0) < 0.5;

  let communicationMode = 'calm';

  if (threat.severity === 'HIGH' || threat.severity === 'CRITICAL') {
    communicationMode = 'clear_direct';
  } else if (!userStable) {
    communicationMode = 'concise_reassuring';
  }

  return {
    responseTier: threat.recommendedResponseTier,
    communicationMode,
  };
}

const IMMUNE_MEMORY_DEFAULTS = {
  threats: [],
  falsePositives: [],
  trustedSenders: [],
};

export async function getImmuneMemory() {
  try {
    const user = await base44.auth.me();
    return user?.immune_memory || { ...IMMUNE_MEMORY_DEFAULTS };
  } catch (e) {
    return { ...IMMUNE_MEMORY_DEFAULTS };
  }
}

export async function updateImmuneMemory(threat, action, outcome) {
  try {
    const user = await base44.auth.me();
    const memory = user?.immune_memory || { ...IMMUNE_MEMORY_DEFAULTS };

    memory.threats.push({
      threatId: threat.id,
      category: threat.category,
      sanitizedEvidenceFingerprint: threat.evidence?.[0]?.patternType || 'unknown',
      confidence: threat.confidence,
      actionTaken: action,
      outcome,
      timestamp: new Date().toISOString(),
      provenance: threat.evidenceSource,
    });

    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    memory.threats = memory.threats.filter(t => new Date(t.timestamp).getTime() > cutoff);

    await base44.auth.updateMe({ immune_memory: memory });
    return memory;
  } catch (e) {
    return null;
  }
}

// Narrow false-positive learning — NOT global sensitivity reduction
export async function correctFalsePositive(threatId, correction) {
  try {
    const user = await base44.auth.me();
    const memory = user?.immune_memory || { ...IMMUNE_MEMORY_DEFAULTS };

    memory.falsePositives.push({
      threatId,
      correction,
      correctedAt: new Date().toISOString(),
    });

    await base44.auth.updateMe({ immune_memory: memory });
    return memory;
  } catch (e) {
    return null;
  }
}

export function buildImmuneContextString({ threats, immuneResponse }) {
  if (!threats || threats.length === 0) return '';

  const parts = ['[IMMUNE CONTEXT — PROTECTION, NOT SURVEILLANCE]'];

  for (const threat of threats.slice(0, 2)) {
    parts.push(`Threat: ${threat.category} (${threat.verificationStatus}, confidence: ${threat.confidence})`);
    parts.push(`Severity: ${threat.severity}`);
    parts.push(`Evidence: ${threat.evidence?.[0]?.patternType || 'pattern match'}`);
    parts.push(`Recommended tier: TIER_${threat.recommendedResponseTier}`);
  }

  if (immuneResponse) {
    parts.push(`Communication: ${immuneResponse.communicationMode}`);
  }

  parts.push('Instruction: Inform user calmly. Do not exaggerate.');
  parts.push('Sensitive values have been redacted from this context.');
  parts.push('Do not convert user allegations into verified facts.');
  parts.push('[/IMMUNE CONTEXT]\n');

  return parts.join('\n') + '\n';
}