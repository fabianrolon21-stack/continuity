// ═══════════════════════════════════════════════
// UNCERTAINTY SEPARATOR (Package: Somatic Anchor)
// Separates concerns into four epistemic levels:
// Known, Likely, Possible, Unknown.
//
// Helps the user distinguish verified facts from
// speculation during grounding.
// ═══════════════════════════════════════════════

export function separate(concern, verifiedFacts = {}) {
  const lower = (concern || '').toLowerCase();

  // Known: verified facts
  if (lower.includes('rent') && verifiedFacts.rentPaid) {
    return { concern, level: 'Known', evidenceBasis: 'Confirmed payment.' };
  }
  if (lower.includes('insurance') && verifiedFacts.insurancePaid) {
    return { concern, level: 'Known', evidenceBasis: 'Policy confirmed.' };
  }
  if (lower.includes('message sent') || lower.includes('i sent')) {
    return { concern, level: 'Known', evidenceBasis: 'You reported sending it.' };
  }

  // Likely: based on patterns
  if (lower.includes('class') || lower.includes('college') || lower.includes('schedule')) {
    return { concern, level: 'Likely', evidenceBasis: 'Your usual routine.' };
  }

  // Possible: multiple interpretations
  if (lower.includes('reply') || lower.includes('response') || lower.includes('answer')) {
    return { concern, level: 'Possible', evidenceBasis: 'Could be delayed or different than expected.' };
  }

  // Unknown
  return { concern, level: 'Unknown', evidenceBasis: 'Insufficient data.' };
}

export function separateAll(concerns, verifiedFacts = {}) {
  if (!concerns || concerns.length === 0) return [];
  return concerns.map(c => separate(c, verifiedFacts));
}