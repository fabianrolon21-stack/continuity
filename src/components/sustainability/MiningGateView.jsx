import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { getMiningConfig, setMiningConfig, evaluateMiningCycle, deviceSignature, SARG_PROHIBITIONS } from '@/lib/bison/sustainability/miningFeasibility';

export default function MiningGateView() {
  const [config, setConfig] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const sig = deviceSignature();

  useEffect(() => { getMiningConfig().then(setConfig); }, []);
  if (!config) return <p className="text-xs text-muted-foreground">Loading…</p>;

  const patch = async (p) => setConfig(await setMiningConfig(p));

  const run = async () => { setBusy(true); setResult(await evaluateMiningCycle()); setBusy(false); };

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/5">
        <p className="text-[11px] font-medium text-destructive mb-1">Mining cannot run in this app</p>
        <p className="text-[10px] text-muted-foreground">A web page cannot launch a miner, reach the GPU, or read hardware serials — and on this hardware class CPU mining grosses fractions of a cent per day while costing far more in electricity. Every gate below is real and enforced, but no coins will ever be produced or credited here. Nothing in this app will ever show earnings that did not come from a payout you can verify in your own wallet.</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px]">Mining enabled</p>
          <p className="text-[9px] text-muted-foreground">Off by default; only you can turn it on.</p>
        </div>
        <Switch checked={config.enabled} onCheckedChange={v => patch({ enabled: v })} />
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] text-muted-foreground">Payout wallet (yours only — Bison cannot create or change one)</p>
        <Input value={config.walletAddress} onChange={e => patch({ walletAddress: e.target.value })} placeholder="wallet address" className="h-7 text-[11px] bg-secondary/40 border-border font-mono" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground">Daily target (USD)</p>
          <Input type="number" value={config.dailyTargetUSD} onChange={e => patch({ dailyTargetUSD: Number(e.target.value) })} className="h-7 text-[11px] bg-secondary/40 border-border" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Max CPU %</p>
          <Input type="number" value={config.maxCpuPercent} onChange={e => patch({ maxCpuPercent: Number(e.target.value) })} className="h-7 text-[11px] bg-secondary/40 border-border" />
        </div>
      </div>

      <div className="p-2 rounded-lg bg-secondary/25">
        <p className="text-[10px] text-muted-foreground mb-1">This device: <span className="font-mono">{sig}</span> — a soft, spoofable browser signature, not a hardware ID.</p>
        <Button size="sm" variant="outline" className="border-border text-[10px] h-7"
          onClick={() => patch({ allowedHardwareIds: config.allowedHardwareIds.includes(sig) ? config.allowedHardwareIds.filter(h => h !== sig) : [...config.allowedHardwareIds, sig] })}
        >{config.allowedHardwareIds.includes(sig) ? 'Revoke this device' : 'Authorize this device'}</Button>
      </div>

      <Button size="sm" variant="outline" className="border-border text-xs" onClick={run} disabled={busy}>Evaluate mining cycle</Button>

      {result && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium">Verdict: <span className="text-destructive">REFUSED</span> · coins credited: 0</p>
          {result.blockers.map((b, i) => (
            <div key={i} className="p-2 rounded-lg bg-secondary/25">
              <p className="text-[10px] font-medium">{b.gate}</p>
              <p className="text-[10px] text-muted-foreground">{b.detail}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Prohibitions & how they're enforced</p>
        {SARG_PROHIBITIONS.map(p => (
          <p key={p.rule} className="text-[10px] text-muted-foreground">· <span className="text-foreground">{p.rule}</span> — {p.enforcement}</p>
        ))}
      </div>
    </div>
  );
}