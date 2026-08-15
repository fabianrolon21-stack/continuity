import { Button } from '@/components/ui/button';
import { grantConsent, revokeConsent } from '@/lib/bison/legal/consentLedger';
import { consentStatus } from '@/lib/bison/compute/computeClient';

export default function ComputeConsentGate({ onChange }) {
  const consent = consentStatus();

  const grant = async () => {
    await grantConsent({
      actionType: 'distributed_compute',
      scope: ['cpu'],
      purpose: 'Run verifiable compute tasks in a background worker on this device',
      expiresAt: Date.now() + 7 * 86400000,
    });
    onChange?.();
  };

  if (consent.valid) {
    return (
      <div className="p-3 rounded-lg border border-leaf/25 bg-leaf/5 space-y-1.5">
        <p className="text-[11px] font-medium text-leaf">Compute sharing consented</p>
        <p className="text-[10px] text-muted-foreground">Expires {new Date(consent.expiresAt).toLocaleDateString()}. Revoking stops the worker within one task.</p>
        <Button size="sm" variant="outline" className="h-6 text-[9px] border-border"
          onClick={async () => { await revokeConsent(consent.consentId); onChange?.(); }}>Revoke consent</Button>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg border border-gold/30 bg-gold/5 space-y-2">
      <p className="text-[11px] font-medium text-gold">Consent required before any compute runs</p>
      <ul className="text-[10px] text-muted-foreground space-y-0.5">
        <li>· Uses roughly a quarter of one background thread on this device, and stops when the device is under load.</li>
        <li>· Runs deterministic math tasks (prime counts, Collatz chains, digit sums) that a server re-checks.</li>
        <li>· Earns internal compute credits on verified receipts. It earns no money — nothing pays for this compute.</li>
        <li>· Sends no personal data: a task is a pair of numbers, and a receipt is one number.</li>
        <li>· Nothing starts until you click below, and it stops the moment you revoke.</li>
      </ul>
      <Button size="sm" className="h-7 text-[10px]" onClick={grant}>I consent to share compute for 7 days</Button>
    </div>
  );
}