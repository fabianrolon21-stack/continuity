// ═══════════════════════════════════════════════
// MEMORY COMPRESSION (Package 46.4)
// Summarizes older interaction history into structured
// semantic memories while preserving provenance.
// Originals are never deleted — compression only adds
// higher-level semantic records marked is_compressed.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { buildMemoryProvenance, VERIFICATION_STATES } from './memoryVerification';
import { detectNonEvidentiaryText } from '../provenance/nonEvidentiaryFirewall';

const COMPRESSION_AGE_DAYS = 30;
const MIN_MESSAGES = 10;
const MAX_MESSAGES_PER_RUN = 200;

export async function compressOldHistory() {
  const cutoff = new Date(Date.now() - COMPRESSION_AGE_DAYS * 24 * 60 * 60 * 1000);

  const [user, allMessages] = await Promise.all([
    base44.auth.me().catch(() => null),
    base44.entities.BisonMessage.list('-created_date', 500).catch(() => []),
  ]);

  const lastCompressed = user?.last_memory_compression ? new Date(user.last_memory_compression) : null;

  let old = (allMessages || []).filter(m => {
    const d = new Date(m.created_date);
    if (d >= cutoff) return false;
    if (lastCompressed && d <= lastCompressed) return false;
    // Example isolation (46.5): non-evidentiary text never enters semantic memory
    if (detectNonEvidentiaryText(m.text)) return false;
    return true;
  }).slice(0, MAX_MESSAGES_PER_RUN);

  if (old.length < MIN_MESSAGES) {
    return { compressed: 0, reason: `Not enough uncompressed history older than ${COMPRESSION_AGE_DAYS} days (found ${old.length}, need ${MIN_MESSAGES}).` };
  }

  const oldest = old[old.length - 1].created_date;
  const newest = old[0].created_date;
  const period = `${oldest?.substring(0, 10)} to ${newest?.substring(0, 10)}`;

  const transcript = old.slice().reverse().map(m => `${m.role === 'user' ? 'User' : 'Bison'}: ${m.text}`).join('\n');

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Summarize this conversation history into 3-7 structured semantic memories about the user. Each memory must be a single factual statement grounded ONLY in what the user actually said — no speculation, no diagnosis. Mark each with a theme (relationships, work, health, identity, emotion, daily_life, goals).\n\nCONVERSATION HISTORY (${period}):\n${transcript.substring(0, 12000)}`,
    response_json_schema: {
      type: 'object',
      properties: {
        memories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              theme: { type: 'string' },
            },
          },
        },
      },
    },
  });

  const summaries = (result?.memories || []).filter(m => m.text && !detectNonEvidentiaryText(m.text));
  if (summaries.length === 0) {
    return { compressed: 0, reason: 'No semantic memories could be derived.' };
  }

  const records = summaries.map(s => ({
    text: s.text,
    tags: s.theme ? [s.theme] : [],
    source: 'compressed_history',
    epistemic_status: 'INFERRED',
    is_compressed: true,
    compression_period: period,
    ...buildMemoryProvenance({
      origin: `Compressed from ${old.length} conversation messages (${period}).`,
      confidence: 'medium',
      permissionScope: 'PERSISTENT',
      initialState: VERIFICATION_STATES.OBSERVED,
      reason: 'Semantic summary derived from older conversation history. Awaiting user confirmation.',
    }),
  }));

  const created = await base44.entities.SavedMemory.bulkCreate(records);

  try {
    await base44.auth.updateMe({ last_memory_compression: newest });
  } catch (e) {}

  return { compressed: records.length, period, messageCount: old.length, records: created };
}