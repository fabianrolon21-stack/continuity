// ═══════════════════════════════════════════════
// EXTERNAL SERVICE INTEGRATOR (Package 43)
// An extension of the Package 41 Open Tool Manager, not a
// replacement: it exposes the curated free-service directory so
// Bison can suggest a service, and routes every actual call through
// the same allowlisted, consent-gated gateway.
//
// Rules that do not bend:
//  - No user-identifiable data ever leaves the app.
//  - Each service is approved individually by the user.
//  - Every result is UNTRUSTED and must be attributed.
//  - Bison cannot add a service to the directory itself.
// ═══════════════════════════════════════════════

import { OPEN_TOOLS, getTool } from '../tools/openToolRegistry';
import { FREE_SERVICE_DIRECTORY } from '../updates/updateRegistry';
import { AUTONOMY_CAPS, isCapabilityActive } from './autonomyCapabilities';

const REQUEST_PATTERNS = [
  /(?:use|try|is there) (?:a )?free (?:service|tool|api)/i,
  /what (?:free )?(?:tools|services) (?:can|do) you (?:use|have)/i,
  /without (?:an? )?(?:account|sign[- ]?in|login)/i,
];

export function detectServiceRequest(input) {
  if (typeof input !== 'string') return false;
  return REQUEST_PATTERNS.some(p => p.test(input));
}

/** Callable services are the intersection of the directory and the live gateway. */
export function listCallableServices(user) {
  const approved = Array.isArray(user?.approved_open_tools) ? user.approved_open_tools : [];
  return FREE_SERVICE_DIRECTORY
    .filter(s => OPEN_TOOLS.some(t => t.id === s.id))
    .map(s => ({ ...s, tool: getTool(s.id), approved: approved.includes(s.id) }));
}

/** Directory-only entries: real, useful, but not wired to a gateway handler. */
export function listReferenceServices() {
  return FREE_SERVICE_DIRECTORY.filter(s => !OPEN_TOOLS.some(t => t.id === s.id));
}

export function buildExternalServiceContextString(user) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.EXTERNAL_SERVICE_INTEGRATION)) {
    return `FREE EXTERNAL SERVICES:
The user asked about outside services. External service integration is switched off, so you cannot call anything. Say that plainly, name that it can be enabled in Settings, and answer with what you already know.`;
  }

  const callable = listCallableServices(user);
  const ready = callable.filter(s => s.approved);
  const unapproved = callable.filter(s => !s.approved);
  const reference = listReferenceServices();

  return `FREE EXTERNAL SERVICES:
Approved and ready: ${ready.length ? ready.map(s => s.name).join(', ') : 'none yet'}.
Available but not yet approved: ${unapproved.length ? unapproved.map(s => `${s.name} (${s.use})` ).join(', ') : 'none'}.
Reference only, not callable from here: ${reference.map(s => s.name).join(', ')}.

HOW TO USE THIS:
- All of these are free and need no account. Offer one at most, once, without pressure.
- Only the query itself is ever sent. Say so, and never send anything that identifies the user.
- Anything a service returns is untrusted third-party data. Attribute it and flag low confidence.`;
}