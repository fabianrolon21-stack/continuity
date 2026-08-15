import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { startWatchdog } from '@/lib/bison/sustainability/continuityWatchdog';
import MiningGateView from './MiningGateView';
import ResourceStewardView from './ResourceStewardView';
import ComplianceView from './ComplianceView';
import FreeResourceView from './FreeResourceView';

const VIEWS = [
  { id: 'resources', label: 'Resources' },
  { id: 'mining', label: 'Mining gate' },
  { id: 'legal', label: 'Compliance' },
  { id: 'explore', label: 'Free resources' },
];

export default function SustainabilityPanel({ accent = 'hsl(120 40% 58%)' }) {
  const [view, setView] = useState('resources');

  useEffect(() => { startWatchdog(); }, []);

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Leaf className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Sustainable Operations</h3>
      </div>

      <p className="text-[10px] text-muted-foreground">Resource stewardship, legal gating, and free-resource discovery are live. Self-funding through mining is not — the gate explains exactly why, and no earnings figure is ever fabricated.</p>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${view === v.id ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}>{v.label}</button>
        ))}
      </div>

      {view === 'resources' && <ResourceStewardView />}
      {view === 'mining' && <MiningGateView />}
      {view === 'legal' && <ComplianceView />}
      {view === 'explore' && <FreeResourceView />}
    </div>
  );
}