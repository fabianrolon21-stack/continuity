import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { startWatchdog, watchdogStatus } from '@/lib/bison/sustainability/continuityWatchdog';
import { start } from '@/lib/bison/sustainability/resourceSteward';
import ResourceDashboardView from './ResourceDashboardView';
import DegradationView from './DegradationView';
import ApprovalsView from './ApprovalsView';
import FreeResourceView from './FreeResourceView';
import CapabilitiesView from './CapabilitiesView';

const VIEWS = [
  { id: 'dashboard', label: 'Usage' },
  { id: 'degradation', label: 'Degradation' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'capabilities', label: 'Capabilities' },
];

export default function SustainabilityPanel({ accent = 'hsl(120 40% 58%)' }) {
  const [view, setView] = useState('dashboard');
  const wd = watchdogStatus();

  useEffect(() => { startWatchdog(); start(); }, []);

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Leaf className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Resource Stewardship</h3>
      </div>

      <p className="text-[10px] text-muted-foreground">Default behavior: use fewer resources, spend nothing unless explicitly authorized, remain functional, and say what is happening. Bison runs indefinitely with no external revenue and no autonomous income of any kind.</p>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${view === v.id ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}>{v.label}</button>
        ))}
      </div>

      {view === 'dashboard' && <ResourceDashboardView />}
      {view === 'degradation' && <DegradationView />}
      {view === 'approvals' && <ApprovalsView />}
      {view === 'discovery' && <FreeResourceView />}
      {view === 'capabilities' && <CapabilitiesView />}

      {wd.startupReport && !wd.startupReport.firstRun && (
        <p className="text-[9px] text-muted-foreground/60">{wd.startupReport.detail}</p>
      )}
    </div>
  );
}