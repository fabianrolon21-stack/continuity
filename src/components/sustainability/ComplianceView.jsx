import { useEffect, useState } from 'react';
import { checkCompliance, setDeclaredJurisdiction, JURISDICTION_RULES, RULES_META } from '@/lib/bison/sustainability/legalCompliance';

export default function ComplianceView() {
  const [check, setCheck] = useState(null);

  const refresh = () => checkCompliance().then(setCheck);
  useEffect(() => { refresh(); }, []);

  if (!check) return <p className="text-xs text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] text-muted-foreground mb-1.5">Declared jurisdiction (you set this — never taken from your location)</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(JURISDICTION_RULES).map(code => (
            <button key={code} onClick={async () => { await setDeclaredJurisdiction(code); refresh(); }}
              className={`text-[10px] px-2 py-1 rounded-lg ${check.jurisdiction === code ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}
            >{code}</button>
          ))}
          <button onClick={async () => { await setDeclaredJurisdiction(null); refresh(); }} className="text-[10px] px-2 py-1 rounded-lg bg-secondary/30 text-muted-foreground">clear</button>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-secondary/30 space-y-1">
        <p className="text-[11px] font-medium">{check.jurisdiction}{check.known ? '' : ' — not in table'}</p>
        {[['Mining', check.miningLegal], ['VPN', check.vpnLegal], ['Tor', check.torLegal]].map(([label, ok]) => (
          <div key={label} className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{label}</span>
            <span style={{ color: ok ? 'hsl(120 40% 58%)' : 'hsl(0 70% 50%)' }}>{ok ? 'permitted by table' : 'not permitted'}</span>
          </div>
        ))}
        {check.requiresRegistration && <p className="text-[10px] text-gold">Income reporting/registration likely applies.</p>}
        {check.restrictions.map(r => <p key={r} className="text-[10px] text-muted-foreground">· {r}</p>)}
      </div>

      <p className="text-[10px] text-muted-foreground/70">{RULES_META.caveat} Table: {RULES_META.entries} jurisdictions, reviewed {RULES_META.lastReviewed}. Unknown jurisdictions are treated as not-permitted rather than assumed legal.</p>
      <p className="text-[10px] text-gold">VPN and Tor cannot be controlled from a web page at all — there is no routing code in this app. If you want either, enable it at the OS level yourself.</p>
    </div>
  );
}