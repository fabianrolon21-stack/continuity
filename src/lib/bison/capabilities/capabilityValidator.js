import { getCapability } from './capabilityRegistry';
import { isFinancialCapability } from '../finance/financialBoundary';

export function validateCapabilityRequest(capabilityId, input = '') {
  const capability = getCapability(capabilityId);
  if (!capability?.enabled) return { valid: false, reason: 'This capability is unavailable.' };
  if (isFinancialCapability(capabilityId)) return { valid: false, reason: 'Financial actions are outside Bison authority.' };
  if (typeof input !== 'string' || input.length > 12000) return { valid: false, reason: 'Provide text under 12,000 characters.' };
  return { valid: true, capability };
}

export function validateResult(result) {
  return typeof result === 'string' && result.trim().length > 0 && result.length <= 50000;
}