import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listConnections, setProvider, queryProvider, NEVER_SHARED } from '@/lib/bison/self/externalAIHub';

export default function ExternalAIHubView() {
  const [connections, setConnections] = useState([]);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { listConnections().then(setConnections); }, []);

  const ask = async (id) => {
    if (!query.trim()) return;
    setBusy(true);
    setResult(await queryProvider({ providerId: id, query, task: 'oracle' }));
    setBusy(false);
    setConnections(await listConnections());
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground">Every consultation passes the Package 44 doorway: firewall, consent, sanitization, audit. If the firewall is closed or consent is missing, the query is blocked and the block is logged.</p>

      {connections.map(c => (
        <div key={c.id} className="p-2.5 rounded-lg bg-secondary/25 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium">{c.provider}</p>
              <p className="text-[9px] text-muted-foreground">{c.tasks.join(' · ')}</p>
            </div>
            <button
              onClick={async () => setConnections(await setProvider(c.id, c.status !== 'connected', c.tasks))}
              className={`text-[10px] px-2 py-1 rounded-full border ${c.status === 'connected' ? 'border-leaf text-leaf' : 'border-border text-muted-foreground'}`}
            >{c.status}</button>
          </div>
          {c.status === 'connected' && (
            <div className="flex gap-1.5">
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Question to consult on…" className="h-7 text-[11px] bg-secondary/40 border-border" />
              <Button size="sm" className="h-7 text-[10px]" onClick={() => ask(c.id)} disabled={busy}>Ask</Button>
            </div>
          )}
          <p className="text-[9px] text-muted-foreground/60">last query: {c.lastQueryTimestamp ? new Date(c.lastQueryTimestamp).toLocaleString() : 'never'} · personal data shared: no</p>
        </div>
      ))}

      {result && (
        <div className={`p-2.5 rounded-lg text-[10px] ${result.blocked ? 'bg-destructive/10 text-destructive' : 'bg-secondary/30'}`}>
          <p className="font-medium mb-1">{result.status}</p>
          <p className="text-muted-foreground">{result.blocked ? result.reason : String(result.data).slice(0, 600)}</p>
          {result.sanitizationApplied?.length > 0 && <p className="text-muted-foreground/70 mt-1">sanitized: {result.sanitizationApplied.join(', ')}</p>}
        </div>
      )}

      <p className="text-[9px] text-muted-foreground/60">Never sent to an external AI, whatever consent exists: {NEVER_SHARED.join(', ')}.</p>
    </div>
  );
}