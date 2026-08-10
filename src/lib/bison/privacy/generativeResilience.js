// ═══════════════════════════════════════════════
// GENERATIVE RESILIENCE (Package 44)
// When someone fears surveillance, training, theft, or loss,
// Bison answers with the actual technical state first — then
// a reminder that their capacity to create is not stored
// anywhere, and cannot be taken.
// Supportive. Never dismissive. Never a canned script:
// this module supplies context, the model speaks.
// ═══════════════════════════════════════════════

import { connectivityState, readCached, loadPolicy } from './firewallPolicy';

const TRIGGERS = [
  { id: 'surveillance', re: /watch(ing|ed)? me|spy|surveil|listening to me|track(ing)? me/i },
  { id: 'training', re: /train(ing|ed)? on|use my data|sell my data|feed(ing)? .* to (an )?ai/i },
  { id: 'theft', re: /steal|stolen|leak(ed)?|hack(ed)?|breach/i },
  { id: 'deletion', re: /delete (my|everything)|wipe|erase (my|it all)|lost (my|everything)/i },
  { id: 'ownership', re: /who owns|is it mine|my data|belongs to me/i },
  { id: 'export', re: /export|download my|take my data/i },
  { id: 'privacy', re: /privacy|private|confidential|firewall|offline/i },
];

export function detectConcern(text = '') {
  const hit = TRIGGERS.find(t => t.re.test(text));
  return hit ? hit.id : null;
}

const RESILIENCE_NOTES = {
  surveillance: 'Nothing here observes them passively; the runtime only acts when asked.',
  training: 'Bison never submits their material to a training service on their behalf.',
  theft: 'What exists locally cannot be taken from a channel that is closed.',
  deletion: 'Records can be lost; the mind that made them is not a record.',
  ownership: 'Everything stored belongs to them, including the right to remove it.',
  export: 'They can take a full copy at any time; nothing is held hostage.',
  privacy: 'Privacy here is a default state, not a setting they had to find.',
};

// Returns context to inject into the response prompt — not a scripted reply.
export function buildSovereigntyContext(userText) {
  const concern = detectConcern(userText);
  if (!concern) return null;

  const policy = readCached();
  const { mode, open } = connectivityState(policy);

  return {
    concern,
    firewallState: mode,
    openChannels: open.map(c => c.label),
    guarantees: [
      'Bison never initiates sharing on the user\'s behalf.',
      'External communication requires explicit authorization.',
      'Every outbound request is logged and visible.',
      'Consent is revocable, and revocation takes effect immediately.',
    ],
    limits: [
      'Bison cannot control third-party provider policies.',
      'Once the user authorizes sharing, the receiving service governs its own use.',
    ],
    resilienceNote: RESILIENCE_NOTES[concern],
    tone: 'Take the concern seriously. State the real technical position plainly, then acknowledge that their creative capacity is regenerative — without minimizing what they are worried about.',
  };
}

export async function buildSovereigntyContextString(userText) {
  await loadPolicy({ force: true });
  const ctx = buildSovereigntyContext(userText);
  if (!ctx) return null;

  return `DATA SOVEREIGNTY CONTEXT (measured, not inferred):
Firewall state: ${ctx.firewallState}
Open channels: ${ctx.openChannels.length ? ctx.openChannels.join(', ') : 'none — nothing can leave this device'}
Detected concern: ${ctx.concern}

You can honestly promise:
${ctx.guarantees.map(g => `- ${g}`).join('\n')}

You must NOT promise:
${ctx.limits.map(l => `- ${l}`).join('\n')}

Resilience note: ${ctx.resilienceNote}
${ctx.tone}
Speak naturally in your own voice. Do not recite this context or read it as a list.`;
}