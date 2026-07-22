// ═══════════════════════════════════════════════
// COMMUNICATION ENGINE (Voice Studio)
// Orchestrates the full communication fingerprinting
// and authentic draft generation pipeline.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const PATTERN_SCHEMA = {
  type: 'object',
  properties: {
    vocabulary: { type: 'string', description: 'Distinctive word choices, frequent phrases' },
    sentence_structure: { type: 'string', description: 'Avg length, fragments, complexity' },
    punctuation: { type: 'string', description: 'Punctuation habits' },
    emoji: { type: 'string', description: 'Emoji/symbol usage patterns' },
    humor: { type: 'string', description: 'Humor/sarcasm style' },
    code_switching: { type: 'string', description: 'Language switching patterns' },
    slang: { type: 'string', description: 'Slang/regional expressions' },
    rhythm: { type: 'string', description: 'Response timing/rhythm patterns' },
    emotional: { type: 'string', description: 'Emotional communication style' },
    context_refs: { type: 'string', description: 'Inside references/shared context' },
  },
};

const FINGERPRINT_SCHEMA = {
  type: 'object',
  properties: {
    vocabulary_patterns: { type: 'string' },
    sentence_structure: { type: 'string' },
    punctuation_habits: { type: 'string' },
    emoji_usage: { type: 'string' },
    humor_style: { type: 'string' },
    code_switching: { type: 'string' },
    slang_regional: { type: 'string' },
    response_rhythm: { type: 'string' },
    emotional_patterns: { type: 'string' },
    context_references: { type: 'string' },
    confidence_score: { type: 'number' },
  },
};

const PROFILE_SCHEMA = {
  type: 'object',
  properties: {
    communication_style: { type: 'string' },
    formality_level: { type: 'number' },
    warmth_level: { type: 'number' },
    humor_frequency: { type: 'string', enum: ['never', 'rare', 'occasional', 'frequent', 'constant'] },
    vocabulary_distinctive: { type: 'array', items: { type: 'string' } },
    confidence_level: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
  },
};

const AUTHENTICITY_SCHEMA = {
  type: 'object',
  properties: {
    scores: {
      type: 'object',
      properties: {
        relationship: { type: 'number' },
        context: { type: 'number' },
        style: { type: 'number' },
        emotional: { type: 'number' },
        intent: { type: 'number' },
        overall: { type: 'number' },
      },
    },
    flags: { type: 'array', items: { type: 'string', enum: ['generic_ai_phrase', 'corporate_tone', 'tv_dialogue', 'personality_drift', 'relationship_mismatch', 'over_formalization'] } },
    notes: { type: 'string' },
  },
};

const DIFFERENCE_SCHEMA = {
  type: 'object',
  properties: {
    vocabulary_changes: { type: 'string' },
    tone_changes: { type: 'string' },
    structure_changes: { type: 'string' },
    removed_phrases: { type: 'array', items: { type: 'string' } },
    added_phrases: { type: 'array', items: { type: 'string' } },
    insight: { type: 'string' },
  },
};

// ── Pattern Extraction ──
export async function analyzeCorpus(text, sourceType, relationshipName, relationshipCategory) {
  const prompt = `Analyze this communication sample and extract the author's communication patterns. 
Source type: ${sourceType}
Relationship: ${relationshipName || 'unknown'} (${relationshipCategory || 'unknown'})

Communication sample:
"${text}"

Extract distinctive patterns across vocabulary, sentence structure, punctuation, emoji usage, humor, code-switching, slang/regional expressions, response rhythm, emotional communication, and context references. Be specific and concrete.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: PATTERN_SCHEMA,
    add_context_from_internet: false,
  });

  return result;
}

// ── Fingerprint Building ──
export async function buildFingerprint(corpusEntries) {
  const samples = corpusEntries.map((e, i) => `Sample ${i + 1} (${e.source_type}, to ${e.relationship_name || 'unknown'}):\n${e.text}`).join('\n\n');

  const prompt = `Based on these communication samples from one person, synthesize a unified "communication fingerprint" — the core patterns that define how this person writes across all contexts. Find the through-line.

Samples:
${samples}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: FINGERPRINT_SCHEMA,
    add_context_from_internet: false,
  });

  return result;
}

// ── Relationship Profile Building ──
export async function buildRelationshipProfile(corpusEntries, relationshipName, relationshipCategory) {
  const samples = corpusEntries
    .filter(e => (e.relationship_name || '').toLowerCase() === relationshipName.toLowerCase())
    .map(e => e.text).join('\n\n');

  const prompt = `Analyze these communications specifically directed at "${relationshipName}" (category: ${relationshipCategory}). 
Build a relationship-specific communication profile.

Samples:
${samples}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: PROFILE_SCHEMA,
    add_context_from_internet: false,
  });

  return result;
}

// ── Draft Generation ──
export async function generateDraft(context, intent, relationshipName, relationshipCategory, fingerprint, profile) {
  const fp = fingerprint ? `\nUser's communication fingerprint:\n${JSON.stringify(fingerprint, null, 2)}` : '';
  const rp = profile ? `\nRelationship-specific profile for ${relationshipName}:\n${JSON.stringify(profile, null, 2)}` : '';

  const prompt = `Write a message from the user to "${relationshipName}" (${relationshipCategory}).

Context: ${context}
User's intent: ${intent}

${fp}
${rp}

Write this message AS this person. Use their actual vocabulary, sentence structure, punctuation habits, humor style, and emotional patterns. Do NOT write generic AI text. Do NOT be overly formal unless their profile shows formality. Write naturally as they would write. Output ONLY the message text, no meta-commentary.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: false,
  });

  return typeof result === 'string' ? result : result.text || String(result);
}

// ── Authenticity Verification ──
export async function verifyAuthenticity(generatedText, fingerprint, profile, relationshipName, relationshipCategory) {
  const fp = fingerprint ? `\nFingerprint:\n${JSON.stringify(fingerprint, null, 2)}` : '';
  const rp = profile ? `\nRelationship profile (${relationshipName}):\n${JSON.stringify(profile, null, 2)}` : '';

  const prompt = `Verify the authenticity of this generated message. Check for:
- generic_ai_phrase: Generic AI-sounding phrases ("I hope this message finds you well", "delve into", "it's important to note")
- corporate_tone: Unwanted corporate/formal tone mismatch
- tv_dialogue: Unrealistic "TV dialogue" phrasing
- personality_drift: Drift from the user's actual personality
- relationship_mismatch: Tone wrong for this relationship type
- over_formalization: More formal than the user would be

Relationship: ${relationshipName} (${relationshipCategory})
${fp}
${rp}

Generated message:
"${generatedText}"

Score each confidence dimension (0-100) and flag any issues found.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: AUTHENTICITY_SCHEMA,
    add_context_from_internet: false,
  });

  return result;
}

// ── Difference Analysis (accepted vs edited) ──
export async function analyzeDifference(generatedText, editedText) {
  const prompt = `Compare the AI-generated draft with the user's edited version. Analyze what the user changed and why.

Generated draft:
"${generatedText}"

User's edited version:
"${editedText}"

Identify vocabulary changes, tone changes, structure changes, phrases removed, phrases added, and the key insight about what the user prefers.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: DIFFERENCE_SCHEMA,
    add_context_from_internet: false,
  });

  return result;
}