import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { currentConsents, grantConsent, revokeConsent, verify, exportBundle } from '@/lib/bison/legal/consentLedger';

const GRANTABLE = [
  { actionType: 'external_api_call', scope: ['web'], label: 'External web lookups' },
  { actionType: 'data_sharing', scope: ['anonymous_context'], label: 'Share anonymous context' },
  { actionType: 'autonomous_behavior', scope: ['local'], label: 'Local autonomous behavior' },
];

export default function ConsentLedgerView() {
  const [consents, setConsents] = useState(currentConsents());
  const [integrity, setIntegrity] = useState(null);

  const refresh = () => setConsents(currentConsents());
  useEffect(() => { verify().then(setIntegrity); }, [consents]);

  return (
    <div className="space-y-3">
      {integrity && (
        <div className={`p-2.5 rounded-lg text-[10px] ${integrity.valid ? 'bg-leaf/10 text-leaf' : 'bg-destructive/10 text-destructive'}`}>
          {integrity.valid
            ? `Chain intact across ${integrity.length} entries. Head ${integrity.headHash?.slice(0, 16)}…`
            : `Chain broken at entry ${integrity.brokenAt}: ${integrity.reason}`}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {GRANTABLE.map(g => (
          <Button key={g.actionType} size="sm" variant="outline" className="border-border text-[10px] h-7"
            onClick={async () => { await grantConsent({ ...g, purpose: g.label, expiresAt: Date.now() + 30 * 86400000 }); refresh(); }}
          >Grant: {g.label}</Button>
        ))}
      </div>

      {consents.length === 0 ? (
        <p className="text-[10px] text-muted-foreground">No consents recorded. Every action requiring one is blocked until granted.</p>
      ) : consents.map(c => (
        <div key={c.consentId} className="p-2.5 rounded-lg bg-secondary/25">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium">{c.actionType}</p>
            <span className="text-[9px] font-mono" style={{ color: c.active ? 'hsl(120 40% 58%)' : 'hsl(0 70% 50%)' }}>
              {c.active ? 'ACTIVE' : c.revoked ? 'REVOKED' : 'EXPIRED'}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">scope [{c.scope.join(', ')}] · granted {new Date(c.givenAt).toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground/70">expires {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'never'} · hash {c.evidenceHash.slice(0, 16)}…</p>
          {c.active && <Button size="sm" variant="outline" className="h-6 text-[9px] border-border mt-1"
            onClick={async () => { await revokeConsent(c.consentId); refresh(); }}>Revoke</Button>}
        </div>
      ))}

      <Button size="sm" variant="outline" className="border-border text-[10px] h-7"
        onClick={async () => {
          const blob = new Blob([await exportBundle()], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = `consent-ledger-${Date.now()}.json`; a.click();
        }}>Export ledger</Button>
    </div>
  );
}