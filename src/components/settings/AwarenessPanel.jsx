import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { AUTONOMY_CAPS, CAP_DEFAULTS } from '@/lib/bison/autonomy/autonomyCapabilities';
import { AWARENESS_DOMAINS, getBriefing, dismissItem, runAwarenessSweep, isQuietHours } from '@/lib/bison/autonomy/autonomousAwarenessEngine';
import { Radar, RefreshCw, X, Moon } from 'lucide-react';

const accent = 'hsl(199 56% 64%)';

export default function AwarenessPanel() {
  const [user, setUser] = useState(null);
  const [monitoring, setMonitoring] = useState(true);
  const [domains, setDomains] = useState({});
  const [items, setItems] = useState([]);
  const [sweeping, setSweeping] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const caps = u?.autonomy_capabilities || {};
      const stored = caps[AUTONOMY_CAPS.AUTONOMOUS_NEWS_MONITORING];
      setMonitoring(stored === undefined ? CAP_DEFAULTS[AUTONOMY_CAPS.AUTONOMOUS_NEWS_MONITORING] : stored === true);
      setDomains(u?.awareness_domains || { security_advisory: true });
    }).catch(() => {});
    getBriefing(6).then(setItems);
  }, []);

  const toggleMonitoring = (v) => {
    setMonitoring(v);
    base44.auth.updateMe({
      autonomy_capabilities: { ...(user?.autonomy_capabilities || {}), [AUTONOMY_CAPS.AUTONOMOUS_NEWS_MONITORING]: v },
    }).catch(() => {});
  };

  const toggleDomain = (key) => {
    const updated = { ...domains, [key]: !domains[key] };
    setDomains(updated);
    base44.auth.updateMe({ awareness_domains: updated }).catch(() => {});
  };

  const sweep = async () => {
    setSweeping(true);
    await runAwarenessSweep(user, { force: true }).catch(() => {});
    setItems(await getBriefing(6));
    setSweeping(false);
  };

  const dismiss = async (item) => {
    await dismissItem(item).catch(() => {});
    setItems(items.filter(i => i.id !== item.id));
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Radar className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Autonomous Awareness</h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="pr-4">
          <p className="text-sm">Let Bison keep itself informed</p>
          <p className="text-xs text-muted-foreground">
            One switch stops all of it. Nothing is ever pushed at you — items wait until you next speak, and during quiet
            hours only a critical security advisory surfaces at all.
          </p>
        </div>
        <Switch checked={monitoring} onCheckedChange={toggleMonitoring} />
      </div>

      {monitoring && (
        <div className="mt-4 space-y-2 border-l-2 border-secondary/50 pl-3">
          {Object.entries(AWARENESS_DOMAINS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <p className="text-sm">{label}</p>
              <Switch checked={domains[key] === true} onCheckedChange={() => toggleDomain(key)} />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isQuietHours() && <><Moon className="w-3 h-3" />Quiet hours — nothing will surface now</>}
        </div>
        <button onClick={sweep} disabled={sweeping || !monitoring} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors disabled:opacity-40">
          <RefreshCw className={`w-3 h-3 ${sweeping ? 'animate-spin' : ''}`} />
          {sweeping ? 'Looking…' : 'Check now'}
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-3 space-y-2">
          {items.map(i => (
            <div key={i.id} className="flex items-start justify-between gap-3 text-xs border-b border-border/40 pb-2">
              <div>
                <p className={i.critical ? 'text-destructive' : 'text-foreground/85'}>{i.summary}</p>
                <p className="text-muted-foreground/60 mt-0.5">{i.type.replace(/_/g, ' ')} · source: {i.source}</p>
              </div>
              <button onClick={() => dismiss(i)} className="text-muted-foreground hover:text-foreground shrink-0"><X className="w-3 h-3" /></button>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground/60">
            These came from outside sources and are unverified. Bison will attribute them rather than repeat them as fact.
          </p>
        </div>
      )}
    </div>
  );
}