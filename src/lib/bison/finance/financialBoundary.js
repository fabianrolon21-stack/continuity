const BLOCKED = ['PAYMENT', 'PURCHASE', 'TRANSFER', 'WITHDRAW', 'WALLET', 'BANK', 'SUBSCRIPTION_CHANGE'];
export const isFinancialCapability = id => BLOCKED.some(term => String(id).toUpperCase().includes(term));
export function assertFinancialBoundary(capabilityId) {
  if (isFinancialCapability(capabilityId)) throw new Error('Financial authority belongs to the separate, user-authorized business layer.');
}