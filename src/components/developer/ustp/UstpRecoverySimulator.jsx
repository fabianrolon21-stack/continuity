import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { buildRecoverySeed, verifyRecoverySeed, reconstructionPlan } from '@/lib/bison/ustp/recovery';
import { CheckCircle, XCircle } from 'lucide-react';

export default function UstpRecoverySimulator() {
  const [seed, setSeed] = useState(null);
  const [verification, setVerification] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const s = await buildRecoverySeed();
    setSeed(s);
    setVerification(await verifyRecoverySeed(s));
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Builds a minimal recovery seed and verifies it can reconstruct the runtime without ambiguity.</p>
        <Button onClick={run} disabled={busy} variant="outline" className="border-border text-xs shrink-0">{busy ? 'Running…' : 'Simulate Recovery'}</Button>
      </div>
      {verification && (
        <div className="space-y-1.5">
          {verification.checks.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{c.check}</span>
              {c.pass ? <CheckCircle className="w-3.5 h-3.5 text-leaf" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
            </div>
          ))}
          <p className={`text-xs font-medium ${verification.valid ? 'text-leaf' : 'text-destructive'}`}>
            {verification.valid ? 'Seed valid — full reconstruction possible.' : 'Seed invalid — reconstruction refused.'}
          </p>
        </div>
      )}
      {seed && (
        <div className="text-xs space-y-1">
          <p className="text-muted-foreground">Reconstruction plan:</p>
          {reconstructionPlan(seed).map(step => (
            <p key={step.order} className="text-muted-foreground/70">{step.order}. {step.stage} — verified by {step.verification}</p>
          ))}
          <p className="text-muted-foreground/60 font-mono truncate">signature: {seed.integrity_signature}</p>
        </div>
      )}
    </div>
  );
}