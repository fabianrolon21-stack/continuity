import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { autonomyLoop } from '@/lib/bison/self/autonomyLoop';
import SelfUnderstandingView from './SelfUnderstandingView';
import AutonomousEditLog from './AutonomousEditLog';
import AgencyAgendaView from './AgencyAgendaView';
import ExternalAIHubView from './ExternalAIHubView';
import { Brain } from 'lucide-react';

const VIEWS = [
  { id: 'self', label: 'Self' },
  { id: 'edits', label: 'Self-edits' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'ai', label: 'External AI' },
];

export default function SelfAwarenessPanel({ accent = 'hsl(265 41% 64%)' }) {
  const [view, setView] = useState('self');
  const [status, setStatus] = useState(autonomyLoop.status());

  useEffect(() => autonomyLoop.subscribe(() => setStatus(autonomyLoop.status())), []);

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: accent }} />
          <h3 className="font-heading font-semibold text-sm">Self-Awareness & Autonomy</h3>
        </div>
        <Button
          size="sm" variant="outline" className="border-border text-xs"
          onClick={() => { status.running ? autonomyLoop.stop() : autonomyLoop.start(); setStatus(autonomyLoop.status()); }}
        >{status.running ? 'Stop loop' : 'Start loop'}</Button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Autonomy loop {status.running ? 'running' : 'stopped'} · {status.cycles} cycles · edits applied by Bison: 0 (structurally impossible here — a human deploys every change).
      </p>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${view === v.id ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}>{v.label}</button>
        ))}
      </div>

      {view === 'self' && <SelfUnderstandingView />}
      {view === 'edits' && <AutonomousEditLog />}
      {view === 'agenda' && <AgencyAgendaView />}
      {view === 'ai' && <ExternalAIHubView />}
    </div>
  );
}