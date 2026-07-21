// ═══════════════════════════════════════════════
// USER ADAPTATION ENGINE (Package 28)
// Learns how to communicate effectively with each user.
// PERSONALIZATION ≠ OBEDIENCE.
// Adapt communication STYLE, not beliefs or ethics.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const ADAPTATION_DEFAULTS = {
  preferredLength: 'medium',
  humorLevel: 'moderate',
  directness: 'moderate',
  formality: 'casual',
  feedbackFrequency: 'normal',
  disagreementStyle: 'respectful',
  language: 'en',
};

export async function getUserAdaptation() {
  try {
    const user = await base44.auth.me();
    return user?.adaptation_state || { ...ADAPTATION_DEFAULTS };
  } catch (e) {
    return { ...ADAPTATION_DEFAULTS };
  }
}

export async function updateUserAdaptation(updates) {
  try {
    const user = await base44.auth.me();
    const current = user?.adaptation_state || { ...ADAPTATION_DEFAULTS };
    const updated = { ...current, ...updates };
    await base44.auth.updateMe({ adaptation_state: updated });
    return updated;
  } catch (e) {
    return { ...ADAPTATION_DEFAULTS };
  }
}

export function buildAdaptationContextString(adaptation) {
  if (!adaptation) return '';
  const parts = ['[USER ADAPTATION — COMMUNICATION STYLE]'];
  parts.push(`Preferred length: ${adaptation.preferredLength || 'medium'}`);
  parts.push(`Humor: ${adaptation.humorLevel || 'moderate'}`);
  parts.push(`Directness: ${adaptation.directness || 'moderate'}`);
  parts.push(`Formality: ${adaptation.formality || 'casual'}`);
  parts.push(`Disagreement style: ${adaptation.disagreementStyle || 'respectful'}`);
  parts.push('Note: Personalization ≠ obedience. Adapt communication STYLE, not beliefs or ethics.');
  parts.push('Remain capable of respectful disagreement. Do not reinforce harmful beliefs to maintain rapport.');
  parts.push('The goal is: "Understand the human well enough to communicate effectively."');
  parts.push('Not: "Become whatever keeps the human engaged."');
  parts.push('[/USER ADAPTATION]\n');
  return parts.join('\n') + '\n';
}