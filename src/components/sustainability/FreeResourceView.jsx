import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { explore, QUERY_SETS, EXPLORER_CAVEAT } from '@/lib/bison/sustainability/freeResourceExplorer';

export default function FreeResourceView() {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (cat) => { setBusy(true); setResult(await explore(cat)); setBusy(false); };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(QUERY_SETS).map(cat => (
          <Button key={cat} size="sm" variant="outline" className="border-border text-[10px] h-7" onClick={() => run(cat)} disabled={busy}>Search {cat}</Button>
        ))}
      </div>

      {busy && <p className="text-[10px] text-muted-foreground">Searching through the sovereignty doorway…</p>}

      {result?.blocked && (
        <div className="p-2.5 rounded-lg bg-destructive/10">
          <p className="text-[11px] text-destructive font-medium">{result.status}</p>
          <p className="text-[10px] text-muted-foreground">{result.reason} Open the web channel in Privacy to allow this search.</p>
        </div>
      )}

      {result?.resources?.map((r, i) => (
        <div key={i} className="p-2.5 rounded-lg bg-secondary/25">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium">{r.name}</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold shrink-0">unverified</span>
          </div>
          {r.url && <p className="text-[9px] font-mono text-muted-foreground break-all">{r.url}</p>}
          <p className="text-[10px] text-muted-foreground">${r.costPerMonth}/mo · sign-in {r.requiresSignIn ? 'required' : 'not required'}</p>
          {r.caveat && <p className="text-[10px] text-muted-foreground/70">{r.caveat}</p>}
        </div>
      ))}

      {result?.resources?.length === 0 && <p className="text-[10px] text-muted-foreground">Nothing returned.</p>}

      <p className="text-[10px] text-muted-foreground/70">{EXPLORER_CAVEAT}</p>
    </div>
  );
}