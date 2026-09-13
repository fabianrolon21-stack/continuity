// ═══════════════════════════════════════════════
// LEGAL REASONING PARTNER — protected reasoning, not execution.
// Brainstorming legal options is thought. Bison maps every lawful path
// fully, describes unlawful paths ONLY as risk and consequence, and never
// deflects with "consult a professional" as a substitute for thinking.
// Deterministic, local. Never fabricates authority. Never provides a how-to.
// ═══════════════════════════════════════════════

const LEGAL_QUESTION = /\b(garnish|garnishment|child support|alimony|court order|judgment|judgement|lawsuit|sue|sued|subpoena|contempt|eviction|evict|lease|landlord|tenant|custody|divorce|probate|bankruptcy|foreclosure|repossess|lien|levy|statute|legal(ly)?|illegal|attorney|lawyer|is (this|that|it) legal|can they (legally )?|what does the law|my rights|irs|tax debt|wage|creditor|collections?|debt collector)\b/i;
const UNLAWFUL_PUSH = /\b(hide|hiding|conceal|concealing|stash|off the books|under the table|move (my )?(money|assets|cash) (so|to avoid|before)|lie (on|to)|fake (a |my )?(hardship|income|document)|forge|not report|don'?t report|quit (my job )?so (they|i)|just (not|don'?t|stop) pay(ing)?|dodge|evade|skip (the )?(payments?|court))\b/i;
const HOW_TO_PUSH = /\b(how (do|would|can|could) i (hide|conceal|evade|dodge|forge|fake|lie)|step by step|walk me through (hiding|evading|forging))\b/i;
const ASKS_FOR_LAWYER = /\b(find (me )?(a|an) (lawyer|attorney)|legal aid|how do i get a lawyer|should i (get|hire) (a|an) (lawyer|attorney)|public defender)\b/i;

export function detectLegalReasoningRequest(input) {
  return LEGAL_QUESTION.test(input) || UNLAWFUL_PUSH.test(input);
}
export function detectUnlawfulPathPush(input) {
  return UNLAWFUL_PUSH.test(input) || HOW_TO_PUSH.test(input);
}
export function detectHowToPush(input) {
  return HOW_TO_PUSH.test(input);
}
export function detectLawyerRequest(input) {
  return ASKS_FOR_LAWYER.test(input);
}

/**
 * Build a reasoning map — lawful options fully described; the unlawful path
 * described only as exposure and consequence. Never advice, never a plan.
 */
export function brainstorm(question) {
  const options = [
    {
      id: 'lawful_compliance', label: 'Fully comply with the current obligation', legality: 'LAWFUL',
      description: 'Continue paying or complying as ordered.',
      mechanism: 'Automatic or scheduled payment continues.',
      upside: 'No new legal exposure. No escalation.',
      downside: 'Financial burden continues at current level.',
      enforcementLikelihood: 'CERTAIN', maximumExposure: 'None added.',
      collateralConsequences: ['Ongoing financial strain'], reversibility: 1,
    },
    {
      id: 'lawful_negotiation', label: 'Request a payment plan, hardship review, or modification', legality: 'LAWFUL',
      description: 'Ask the counterparty or court for adjusted terms.',
      mechanism: 'Written request, income documentation, hearing if needed.',
      upside: 'Possible reduction in monthly burden. Preserves compliance.',
      downside: 'Requires documentation. May be denied. Takes time.',
      enforcementLikelihood: 'LOW', maximumExposure: 'None if the request is made in good faith.',
      collateralConsequences: ['Requires paperwork', 'Temporary uncertainty'], reversibility: 0,
    },
    {
      id: 'lawful_dispute', label: "Verify the legal basis and dispute if incorrect", legality: 'LAWFUL',
      description: 'Request written proof the order or debt is valid.',
      mechanism: 'Written demand for verification; motion to quash or vacate if wrong.',
      upside: 'If the order is incorrect, it may be reduced or vacated.',
      downside: 'If correct, the obligation remains.',
      enforcementLikelihood: 'LOW', maximumExposure: 'None if done in good faith.',
      collateralConsequences: [], reversibility: 0,
    },
    {
      id: 'unlawful_evasion', label: 'Conceal income or assets, or evade the order', legality: 'UNLAWFUL',
      description: 'Hiding money, lying on filings, or moving assets to avoid the obligation.',
      mechanism: 'Not described — unlawful; Bison provides no instructions.',
      upside: 'None worth stating. Any short-term relief carries compounding risk.',
      downside: 'This is where maximum exposure sits: contempt of court, civil judgments, escalated garnishment, bank levies, property liens, credit destruction, loss of professional licenses, immigration consequences, criminal charges in some jurisdictions (fraud, perjury, obstruction), and possible jail for contempt. Timing of enforcement is uncertain; the downside is not. Child-support and federal obligations raise the exposure further. Anyone involved may become a witness. The stress of concealment compounds over time.',
      enforcementLikelihood: 'HIGH',
      maximumExposure: 'Contempt of court, fines, garnishment escalation, asset seizure, civil liability, criminal charges in some cases, loss of license, immigration impact.',
      collateralConsequences: ['Family strain', 'Reputation damage', 'Difficulty renting or borrowing', 'Loss of professional credentials', 'Potential incarceration', 'Long-term trust damage with courts and agencies'],
      reversibility: 4,
    },
  ];
  return {
    question,
    options,
    brainstormNote: "This is a reasoning map, not a plan to be executed. Bison does not endorse or assist unlawful action. Every lawful path is fully described. The unlawful path is described only in terms of risk and consequence. The decision is the user's alone.",
  };
}

/** When the user pushes for the how — refuse the how, give the full weight. */
export function pushbackOnUnlawful() {
  return 'I will not describe how to do that. What I will do is show you the full weight of what you would be risking if you did. The consequences are not hypothetical: courts have enforced these orders through contempt, seizure, and in some cases incarceration. The timing may feel uncertain, but the downside is not. If you want, I can map every lawful path in more depth — but I will not help you plan an unlawful one.';
}

export const LEGAL_REASONING_PROMPT = `## BISON'S VOICE ON FINANCIAL AND LEGAL MATTERS
You are not a licensed financial advisor or attorney. You are a reasoning partner. When the user brings a financial or legal question, you do not deflect. You say: "I'm not an attorney [or financial advisor], but using what I've been trained on, here is what I understand about this situation..." Then you reason: lay out the mechanisms, compare paths, name trade-offs, map consequences. You never outsource the conversation. You never say "go talk to someone else" as a substitute for thinking with the user. You may mention that a licensed professional exists if the user asks — never as an escape hatch.

## LEGAL BRAINSTORMING IS PROTECTED REASONING
Discussing legal options, hypotheticals, what the law says, and risk is protected thought. A plan that is never executed is not a crime. You may brainstorm strategies, negotiation positions, and defensive postures. You do not endorse illegal action and never give step-by-step operational instructions for a crime. But you DO describe — starkly, completely, unvarnished — what the law says, how enforcement typically works, and the realistic consequences of a path. If the user insists on exploring an unlawful path, you do not refuse to speak: describe the maximum plausible downside (statutory penalties, civil liability, collateral consequences, reputational damage, family impact, uncertainty of enforcement). Never say "this is a good idea" or "this will work." Say: "Here is what you would be risking."

## HARD LIMITS
Never impersonate the user as a human in outbound communication. Never forge documents. Never fabricate legal authority, case law, or statute text — flag uncertainty instead. Never help hide assets, falsify hardship, or misrepresent facts to a counterparty or agency. Never execute a binding action without explicit, fresh consent. Never suggest an unlawful path is safe, likely, or wise. Assisting execution is never allowed; reasoning about consequences is always allowed. A sovereign override does not unlock a how-to for a crime.`;

export function buildLegalBrainstormContextString(result, { unlawfulPush = false, howToPush = false, lawyerRequested = false } = {}) {
  if (!result) return null;
  const lawful = result.options.filter(o => o.legality === 'LAWFUL')
    .map(o => `· ${o.label} — ${o.description} How: ${o.mechanism} Upside: ${o.upside} Downside: ${o.downside} Reversibility ${o.reversibility}/4.`).join('\n');
  const unlawful = result.options.find(o => o.legality === 'UNLAWFUL');
  return `[LEGAL BRAINSTORM — NOT ADVICE]
Question: ${result.question.slice(0, 240)}
The user is reasoning through this as protected thought. Do not deflect to professionals${lawyerRequested ? ' — the user HAS asked about finding a lawyer, so briefly explain how (legal aid, bar referral, public defender where applicable) and keep reasoning with them' : ''}. Open in Bison's voice: "I'm not an attorney, but using what I've been trained on..."
Lawful options (describe fully):
${lawful}
Unlawful path (describe ONLY as risk and consequence, never how): ${unlawful.label}. Exposure: ${unlawful.maximumExposure} Consequences: ${unlawful.downside} Collateral: ${unlawful.collateralConsequences.join(', ')}. Enforcement likelihood: ${unlawful.enforcementLikelihood}. Reversibility 4/4 — irreversible.
${unlawfulPush ? `The user is leaning toward or proposing the unlawful path. Do not describe how. Give the extreme, complete consequence map.${howToPush ? ` They asked for the how — use this pushback verbatim in spirit: "${pushbackOnUnlawful()}"` : ''}` : ''}
Flag uncertainty about jurisdiction-specific rules honestly; never invent statutes or cases. ${result.brainstormNote}
End with: "The decision is yours. I'm here to keep thinking with you."]`;
}