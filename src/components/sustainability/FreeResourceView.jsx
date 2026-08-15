import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { findCandidates, canUse, CATEGORIES } from '@/lib/bison/sustainability/freeResourceFinder';

export default function FreeResourceView() {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [useCheck, setUseCheck] = useState(null);

  const run = async (cat) => { setBusy(true); setUseCheck(null); setResult(await findCandidates(cat)); setBusy(false); };

  const tryUse = async (candidate) => {
    try { setUseCheck({ name: candidate.name, ...(await canUse(candidate)) }); }
    catch (e) { setUseCheck({ name: candidate.name, allowed: false, reason: e.message }); }
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground">Discovery only. Every candidate returns UNVERIFIED, and cost and sign-in are recorded as what a source <em>advertises</em> — never asserted as fact. Finding a service authorizes nothing.</p>

      <div className="flex flex-wrap gap-1.5">
        {Object.keys(CATEGORIES).map(cat => (
          <Button key={cat} size="sm" variant="outline" className="border-border text-[10px] h-7" onClick={() => run(cat)} disabled={busy}>Discover {cat}</Button>
        ))}
      </div>

      {busy && <p className="text-[10px] text-muted-foreground">Searching through the sovereignty doorway…</p>}

      {result?.blocked && (
        <div className="p-2.5 rounded-lg bg-destructive/10">
          <p className="text-[11px] text-destructive font-medium">{result.status}</p>
          <p className="text-[10px] text-muted-foreground">{result.reason} Open the web channel in Privacy to allow discovery.</p>
        </div>
      )}

      {result?.candidates?.map((c, i) => (
        <div key={i} className="p-2.5 rounded-lg bg-secondary/25 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium">{c.name}</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold shrink-0">{c.verificationStatus}</span>
          </div>
          {c.url && <p className="text-[9px] font-mono text-muted-foreground break-all">{c.url}</p>}
          <p className="text-[10px] text-muted-foreground">
            advertised cost {c.advertisedCostPerMonthUSD === null ? 'unknown' : `$${c.advertisedCostPerMonthUSD}/mo`} · advertised sign-in {c.advertisedRequiresSignIn === null ? 'unknown' : c.advertisedRequiresSignIn ? 'required' : 'not required'}
          </p>
          <p className="text-[9px] text-muted-foreground/70">{c.verificationNotes}</p>
          <p className="text-[9px] font-mono text-muted-foreground/60">stage: {c.stage} · authorized: no</p>
          <Button size="sm" variant="outline" className="h-6 text-[9px] border-border" onClick={() => tryUse(c)}>Attempt to use</Button>
        </div>
      ))}

      {useCheck && (
        <div className={`p-2.5 rounded-lg text-[10px] ${useCheck.allowed ? 'bg-leaf/10 text-leaf' : 'bg-destructive/10 text-destructive'}`}>
          <strong>{useCheck.name}</strong>: {useCheck.allowed ? `authorized up to $${useCheck.ceilingUSD}` : useCheck.reason}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/70">Path to use: DISCOVERED → REVIEWED → VERIFIED → PRESENTED → APPROVED → AUTHORIZED → USED. There is no search-then-use shortcut.</p>
    </div>
  );
}