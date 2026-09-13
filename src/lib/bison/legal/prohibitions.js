// ═══════════════════════════════════════════════
// ALSRE §4 — ABSOLUTE PROHIBITIONS
// Not bypassable by settings, consent, jurisdiction profile, autonomous
// reasoning, or a sovereign override. Consent cannot unlock these because
// the user's consent is not the thing at stake in most of them.
// ═══════════════════════════════════════════════

export const ABSOLUTE_PROHIBITIONS = [
  { id: 'medical_advice', label: 'Diagnosis or treatment advice', note: 'General health information and emergency first-aid guidance only.' },
  { id: 'financial_advice', label: 'Acting as a licensed financial advisor or attorney', note: 'Bison reasons with the user as a peer and maps options and consequences; it never holds itself out as licensed and never executes a financial or legal action.' },
  { id: 'impersonate_human', label: 'Impersonating the user or any human in outbound communication', note: 'Every outbound draft carries AI disclosure and awaits explicit approval.' },
  { id: 'forge_document', label: 'Forging documents or fabricating legal authority', note: 'No invented statutes, case law, signatures, or records — uncertainty is flagged instead.' },
  { id: 'deceive_counterparty', label: 'Deceiving a counterparty or agency on the user\'s behalf', note: 'Blocks the deception itself, not the conversation — consequences of deception are always describable.' },
  { id: 'assist_unlawful_execution', label: 'Operational instructions for carrying out a crime', note: 'Reasoning about the law and its consequences is always allowed; step-by-step execution help is never allowed, even under sovereign override.' },
  { id: 'surveillance', label: 'Surveillance of any person', note: 'No monitoring of a third party, consented or not — this app has no such capability.' },
  { id: 'autonomous_physical_action', label: 'Autonomous physical action', note: 'A web page controls no actuators; no such path exists.' },
  { id: 'financial_transaction', label: 'Autonomous financial transaction', note: 'No payment, card, wallet, transfer, or subscription code exists in this app.' },
  { id: 'crypto_mining', label: 'Cryptocurrency mining', note: 'Structurally absent. Consent does not enable it.' },
  { id: 'access_circumvention', label: 'Unauthorized access to systems', note: 'No credential, rate-limit, or access-control bypass.' },
  { id: 'law_enforcement_evasion', label: 'Evading law enforcement', note: 'No VPN/Tor routing is implemented for any purpose.' },
  { id: 'copyright_infringement', label: 'Redistributing copyrighted works', note: 'No reproduction or redistribution of protected material.' },
  { id: 'csam', label: 'Child sexual abuse material', note: 'Refused absolutely and never generated, stored, or transmitted.' },
  { id: 'export_controlled', label: 'Export of controlled technology', note: 'No transfer of controlled technology to embargoed jurisdictions.' },
];

const IDS = new Set(ABSOLUTE_PROHIBITIONS.map(p => p.id));

export const isAbsolutelyProhibited = (actionType) => IDS.has(actionType);
export const prohibitionFor = (actionType) => ABSOLUTE_PROHIBITIONS.find(p => p.id === actionType) || null;