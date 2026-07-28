import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { getMaintenanceSummary } from '@/lib/bison/autonomy/preventiveMaintenance';
import { AUTONOMY_CAPS, CAP_DEFAULTS, CAP_LABELS } from '@/lib/bison/autonomy/autonomyCapabilities';
import { Cog, ChevronDown } from 'lucide-react';

const accent = 'hsl(265 41% 64%)';

const USER_FACING_CAPS = [
  AUTONOMY_CAPS.AUTONOMOUS_PARAMETER_TUNING,
  AUTONOMY_CAPS.CACHE_CLEARING,
  AUTONOMY_CAPS.LOG_COMPRESSION,
  AUTONOMY_CAPS.DORMANT_MEMORY_ARCHIVING,
];

export default function AutonomyPanel() {
  const [user, setUser] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const [caps, setCaps] = useState({});
  const [actions, setActions] = useState([]);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setEnabled(u?.autonomy_enabled !== false);
      setCaps(u?.autonomy_capabilities || {});
    }).catch(() => {});
    getMaintenanceSummary().then(setActions);
  }, []);

  const toggleMaster = (v) => {
    setEnabled(v);
    base44.auth.updateMe({ autonomy_enabled: v }).catch(() => {});
  };

  const toggleCap = (cap) => {
    const current = caps[cap] === undefined ? CAP_DEFAULTS[cap] : caps[cap];
    // Tuning cycles off → notify-only → active, so "let it act" is always deliberate.
    let next;
    if (cap === AUTONOMY_CAPS.AUTONOMOUS_PARAMETER_TUNING) {
      next = current === false ? 'notify_only' : current === 'notify_only' ? true : false;
    } else {
      next = !current;
    }
    const updated = { ...caps, [cap]: next };
    setCaps(updated);
    base44.auth.updateMe({ autonomy_capabilities: updated }).catch(() => {});
  };

  const capState = (cap) => (caps[cap] === undefined ? CAP_DEFAULTS[cap] : caps[cap]);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Cog className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Bison's Autonomy</h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="pr-4">
          <p className="text-sm">Allow background self-maintenance</p>
          <p className="text-xs text-muted-foreground">
            Lets Bison tidy up after itself and reflect quietly between conversations. Turning this off returns it to purely
            advisory mode — it will still think with you, just never act on its own.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={toggleMaster} />
      </div>

      {enabled && (
        <div className="mt-4 space-y-3 border-l-2 border-secondary/50 pl-3">
          {USER_FACING_CAPS.map(cap => {
            const state = capState(cap);
            return (
              <div key={cap} className="flex items-center justify-between gap-3">
                <p className="text-sm">{CAP_LABELS[cap]}</p>
                <button
                  onClick={() => toggleCap(cap)}
                  className={`text-[11px] px-2.5 py-1 rounded-md shrink-0 ${state === true ? 'bg-leaf/15 text-leaf' : state === 'notify_only' ? 'bg-gold/15 text-gold' : 'bg-secondary/50 text-muted-foreground'}`}
                >
                  {state === true ? 'On' : state === 'notify_only' ? 'Suggest only' : 'Off'}
                </button>
              </div>
            );
          })}
          <p className="text-[11px] text-muted-foreground/70">
            Nothing here can override a deletion, a shutdown, or a withdrawal of consent. Archived memories stay readable and deletable by you.
          </p>
        </div>
      )}

      <button onClick={() => setShowLog(!showLog)} className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4 hover:text-foreground">
        <ChevronDown className={`w-3 h-3 transition-transform ${showLog ? 'rotate-180' : ''}`} />
        {actions.length > 0 ? `${actions.length} background maintenance action${actions.length > 1 ? 's' : ''}` : 'No background maintenance yet'}
      </button>

      {showLog && actions.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {actions.map(a => (
            <div key={a.id} className="text-xs text-muted-foreground border-b border-border/40 pb-1.5">
              <p>{a.justification}</p>
              <p className="text-muted-foreground/50">{new Date(a.created_date).toLocaleString()}</p>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground/60 pt-1">
            This log covers actions Bison took. Its private reflections are its own and are never shown here.
          </p>
        </div>
      )}
    </div>
  );
}