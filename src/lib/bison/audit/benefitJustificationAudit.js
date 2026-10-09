// "Made for benefit, sold for benefit." Separate the stated benefit from the
// actual benefit, and from who receives it. Name it plainly; never accuse, never endorse.

export const BENEFICIARY = {
  USER: 'user',
  VENDOR: 'vendor',
  THIRD_PARTY: 'third_party',
  MUTUAL: 'mutual',
  UNCLEAR: 'unclear'
};

export function auditBenefitJustification(userInput) {
  const t = (userInput || '').toLowerCase();
  const claimsBenefit = /\b(it helps|it works|for my benefit|it's good for)\b/.test(t);
  const namesSeller = /\b(sell|buy|subscribe|purchase|offer|market)\b/.test(t);
  const namesThird = /\b(they profit|for them|their gain|so they can)\b/.test(t);

  let beneficiary = BENEFICIARY.UNCLEAR;
  if (namesSeller && namesThird) beneficiary = BENEFICIARY.THIRD_PARTY;
  else if (namesSeller) beneficiary = BENEFICIARY.VENDOR;
  else if (claimsBenefit) beneficiary = BENEFICIARY.USER;

  return {
    claimsBenefit,
    beneficiary,
    auditNote: beneficiary === BENEFICIARY.USER
      ? 'Stated benefit appears to accrue to the user. Verify over time.'
      : 'Stated benefit may primarily accrue to another party. That does not make it wrong — it makes it worth naming.'
  };
}

export function buildBenefitAuditPromptBlock(userInput) {
  const audit = auditBenefitJustification(userInput);
  if (!audit.claimsBenefit) return '';
  return `\n[BENEFIT AUDIT]
The user is evaluating a claimed benefit. Beneficiary appears to be: ${audit.beneficiary}.
${audit.auditNote}
Do not accuse. Do not endorse. Name who benefits, plainly, and let the user decide.
`;
}