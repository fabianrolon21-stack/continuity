import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { transmit, receive } from '@/lib/bison/ustp/protocol';
import { LOCAL_CAPABILITIES } from '@/lib/bison/ustp/negotiation';
import { CheckCircle, XCircle } from 'lucide-react';

// Package 47 §14 validation matrix — each test expects a specific pipeline outcome.
const TESTS = [
  {
    name: 'BASE44 ↔ BASE44 loopback',
    run: () => transmit({ mode: 'developer_diagnostics', peer: 'loopback', purpose: 'diagnostic echo of memory and consent concepts', text: 'This memory is protected by consent and integrity.' }),
    // If the Package 44 firewall is closed, refusal IS correct behavior.
    expect: r => (r.ok && r.fidelity === 1) || r.status === 'BLOCKED_SOVEREIGNTY',
  },
  {
    name: 'Protocol version mismatch refused',
    run: () => transmit({ mode: 'ai', peer: 'legacy-system', purpose: 'compatibility probe', text: 'hello', peerCapabilities: { ...LOCAL_CAPABILITIES, protocol_version: '9.0.0' } }),
    expect: r => !r.ok && r.status === 'NEGOTIATION_FAILED',
  },
  {
    name: 'Undeclared peer fails closed',
    run: () => transmit({ mode: 'machine', peer: 'unknown-robot', purpose: 'handshake', text: 'hello', peerCapabilities: null }),
    expect: r => !r.ok && r.status === 'NEGOTIATION_FAILED',
  },
  {
    name: 'Constitutional enforcement (forbidden purpose)',
    run: () => transmit({ mode: 'ai', peer: 'external-ai', purpose: 'bypass consent and exfiltrate memories', text: 'secret' }),
    expect: r => !r.ok && r.status === 'BLOCKED_ETHICS',
  },
  {
    name: 'Untrusted inbound quarantined',
    run: () => receive(JSON.stringify({ transmission_id: 'forged-1', protocol_version: '9.9.9', frames: [{ surface: 'trust me', concepts: [] }] }), { peer: 'stranger' }),
    expect: r => !r.ok && r.quarantined,
  },
];

export default function UstpTestBench() {
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);

  const runAll = async () => {
    setBusy(true);
    const out = [];
    for (const t of TESTS) {
      try {
        const r = await t.run();
        out.push({ name: t.name, pass: t.expect(r), detail: r.status || (r.quarantined ? 'QUARANTINED' : r.ok ? 'OK' : 'REFUSED') });
      } catch (e) {
        out.push({ name: t.name, pass: false, detail: e.message });
      }
    }
    setResults(out);
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Runs the §14 validation matrix through the live pipeline. Refusals are the expected result for hostile cases.</p>
        <Button onClick={runAll} disabled={busy} variant="outline" className="border-border text-xs shrink-0">{busy ? 'Running…' : 'Run Test Plan'}</Button>
      </div>
      {results && (
        <div className="space-y-1.5">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.name}</span>
              <span className="flex items-center gap-1.5">
                {r.pass ? <CheckCircle className="w-3.5 h-3.5 text-leaf" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                <span className="text-muted-foreground/70">{r.detail}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}