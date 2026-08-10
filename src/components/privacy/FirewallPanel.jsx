import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { CHANNELS, loadPolicy, setChannel, setMasterFirewall, engageLockdown, liftLockdown } from '@/lib/bison/privacy/firewallPolicy';

export default function FirewallPanel() {
  const [policy, setPolicy] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { loadPolicy({ force: true }).then(setPolicy); }, []);
  if (!policy) return null;

  const locked = policy.lockdown;

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-leaf" />
            <h3 className="font-heading font-semibold text-sm">External Communication Firewall</h3>
          </div>
          <Switch
            checked={policy.master_firewall}
            disabled={locked}
            onCheckedChange={async v => setPolicy(await setMasterFirewall(v))}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          On by default. While this is on, no outbound request of any kind can leave — every channel below is ignored.
        </p>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="font-heading font-semibold text-sm mb-1">Channels</h3>
        <p className="text-xs text-muted-foreground mb-4">Each opens independently, and only when the firewall is off.</p>
        <div className="space-y-3">
          {CHANNELS.map(c => (
            <div key={c.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm">{c.label}</p>
                <p className="text-xs text-muted-foreground leading-tight">{c.note}</p>
              </div>
              <Switch
                checked={!!policy.channels?.[c.id]}
                disabled={locked || policy.master_firewall}
                onCheckedChange={async v => setPolicy(await setChannel(c.id, v))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-5 border" style={{ borderColor: 'hsl(0 70% 50% / 0.3)' }}>
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-destructive" />
          <h3 className="font-heading font-semibold text-sm">Emergency Lockdown</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Halts all external activity at once: internet, sync, APIs, updates, community sharing, and autonomous tasks. It can only be lifted here, on this device.
        </p>
        {locked ? (
          <button
            onClick={async () => setPolicy(await liftLockdown())}
            className="w-full py-2.5 rounded-lg bg-secondary text-sm font-medium"
          >
            Lift Lockdown
          </button>
        ) : confirming ? (
          <div className="flex gap-2">
            <button
              onClick={async () => { setPolicy(await engageLockdown()); setConfirming(false); }}
              className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
            >
              Confirm Lockdown
            </button>
            <button onClick={() => setConfirming(false)} className="px-4 py-2.5 rounded-lg bg-secondary text-sm">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="w-full py-2.5 rounded-lg border border-destructive/40 text-destructive text-sm font-medium"
          >
            Engage Lockdown
          </button>
        )}
      </div>
    </div>
  );
}