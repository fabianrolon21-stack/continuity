import { useState } from 'react';
import ArchitectureGraphView from './ArchitectureGraphView';
import EventStreamView from './EventStreamView';
import ReplayInspector from './ReplayInspector';
import CalibrationView from './CalibrationView';
import SynthesisReport from './SynthesisReport';
import { Telescope } from 'lucide-react';

const VIEWS = [
  { id: 'graph', label: 'Architecture' },
  { id: 'events', label: 'Events' },
  { id: 'replay', label: 'Replay' },
  { id: 'validation', label: 'Validation' },
  { id: 'synthesis', label: 'Synthesis' },
];

export default function ObservabilityPanel({ accent = 'hsl(199 56% 64%)' }) {
  const [view, setView] = useState('graph');

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Telescope className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Observability & Architectural Reasoning</h3>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Observability is not surveillance. This layer exposes system state and reasoning — never user content — and stays local-first: nothing here is transmitted anywhere.
      </p>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${view === v.id ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}>{v.label}</button>
        ))}
      </div>

      {view === 'graph' && <ArchitectureGraphView />}
      {view === 'events' && <EventStreamView />}
      {view === 'replay' && <ReplayInspector />}
      {view === 'validation' && <CalibrationView />}
      {view === 'synthesis' && <SynthesisReport />}
    </div>
  );
}