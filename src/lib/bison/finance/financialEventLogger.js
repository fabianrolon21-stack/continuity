export function recordFinancialBoundaryEvent(capabilityId) {
  return { capabilityId, timestamp: Date.now(), outcome: 'BLOCKED_FINANCIAL_BOUNDARY' };
}