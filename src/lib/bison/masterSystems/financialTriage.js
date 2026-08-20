// ═══════════════════════════════════════════════
// FINANCIAL TRIAGE ALLOCATOR — survival first, infrastructure second,
// goodwill settlements third. Advisory only — never financial advice,
// never a decision made for the user. All data is user-supplied and local.
// ═══════════════════════════════════════════════

const DEFAULT_SURVIVAL = {
  primaryShelter: 400.00,
  dependentSupport: 200.00,
  operationalFuel: 140.00,
  techAndComms: 120.00,
};

const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;

export function executeTriageAllocation({ netIncome, debts = {}, survivalBaseline = {} }) {
  let available = netIncome;

  const shelter = survivalBaseline.primaryShelter ?? DEFAULT_SURVIVAL.primaryShelter;
  const dependent = survivalBaseline.dependentSupport ?? DEFAULT_SURVIVAL.dependentSupport;
  const fuel = survivalBaseline.operationalFuel ?? DEFAULT_SURVIVAL.operationalFuel;
  const tech = survivalBaseline.techAndComms ?? DEFAULT_SURVIVAL.techAndComms;

  const tier1Survival = { primaryShelter: shelter, dependentSupport: dependent, operationalFuel: fuel };
  available -= (shelter + dependent + fuel);

  const tier2Infrastructure = { techAndComms: tech };
  available -= tech;

  const tier3GoodwillSplit = {};
  for (const [debtName, debtAmount] of Object.entries(debts)) {
    tier3GoodwillSplit[`${debtName}_split`] = round2(debtAmount * 0.5);
    available -= tier3GoodwillSplit[`${debtName}_split`];
  }

  const bufferReserve = Math.max(0, round2(available));
  return {
    tier1Survival,
    tier2Infrastructure,
    tier3GoodwillSplit,
    bufferReserve,
    totalAllocated: round2(netIncome - bufferReserve),
    shortfall: available < 0 ? round2(-available) : 0,
    advisoryNote: 'This allocation ensures survival and infrastructure first. Debt settlement is partial and strategic. Always verify with a human advisor before making binding commitments.',
  };
}

/** Parse structured financial input, e.g. "income 1340 debt informal 600 debt service 218". */
export function parseFinancialInput(text) {
  const incomeMatch = text.match(/(?:income|salary|paycheck|net|make|earn(?:ed)?)\D{0,12}\$?([\d,]+(?:\.\d+)?)/i);
  if (!incomeMatch) return null;
  const netIncome = parseFloat(incomeMatch[1].replace(/,/g, ''));
  if (!Number.isFinite(netIncome) || netIncome <= 0) return null;

  const debts = {};
  const debtRegex = /(?:debt|owe(?:s)?)\s+(?:to\s+)?([a-z_]+)?\D{0,8}\$?([\d,]+(?:\.\d+)?)/gi;
  let match; let index = 1;
  while ((match = debtRegex.exec(text)) !== null) {
    const name = (match[1] && match[1].toLowerCase() !== 'of') ? match[1].toLowerCase() : `debt_${index}`;
    debts[name] = parseFloat(match[2].replace(/,/g, ''));
    index++;
  }
  return { netIncome, debts };
}