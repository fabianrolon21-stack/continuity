import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Globe, ShieldAlert } from 'lucide-react';
import { loadPolicy, connectivityState } from '@/lib/bison/privacy/firewallPolicy';

// The user should never have to wonder what the privacy state is.
export default function LocalFirstBadge() {
  const [state, setState] = useState({ mode: 'LOCAL', open: [] });

  useEffect(() => {
    const read = () => loadPolicy({ force: true }).then(p => setState(connectivityState(p)));
    read();
    const t = setInterval(read, 20000);
    return () => clearInterval(t);
  }, []);

  const config = {
    LOCAL: { Icon: Lock, color: 'hsl(120 40% 58%)', label: 'LOCAL', note: 'Nothing leaves your device' },
    ONLINE: { Icon: Globe, color: 'hsl(42 63% 55%)', label: 'ONLINE', note: state.open.map(c => c.label).join(' · ') },
    LOCKDOWN: { Icon: ShieldAlert, color: 'hsl(0 70% 55%)', label: 'LOCKDOWN', note: 'All external activity halted' },
  }[state.mode];

  const { Icon } = config;

  return (
    <Link
      to="/privacy"
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border no-tap-highlight"
      style={{ borderColor: `${config.color.replace(')', ' / 0.3)')}`, background: `${config.color.replace(')', ' / 0.08)')}` }}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: config.color }} />
      <span className="text-[10px] font-semibold tracking-wide" style={{ color: config.color }}>{config.label}</span>
      <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{config.note}</span>
    </Link>
  );
}