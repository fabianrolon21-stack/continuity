import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FRAMEWORKS } from '@/lib/bison/policy/frameworks';
import { defaultAssumptions } from '@/lib/bison/policy/assumptions';
import { simulatePolicy } from '@/lib/bison/policy/policySimulator';
import AssumptionSliders from './AssumptionSliders';
import PolicyResults from './PolicyResults';
import PolicyComparison from './PolicyComparison';
import EthicsTradeoffPanel from './EthicsTradeoffPanel';
import { FlaskConical, Pin } from 'lucide-react';

const VIEWS = [
  { id: 'results', label: 'Results' },
  { id: 'assumptions', label: 'Assumptions' },
  { id: 'compare', label: 'Compare' },
  { id: 'ethics', label: 'Ethics' },
];

export default function PolicyLab() {
  const [framework, setFramework] = useState('status_quo');
  const [assumptions, setAssumptions] = useState(defaultAssumptions());
  const [sim, setSim] = useState(null);
  const [pinned, setPinned] = useState([]);
  const [view, setView] = useState('results');

  const run = () => { setSim(simulatePolicy(framework, assumptions)); setView('results'); };
  const pin = () => { if (sim && pinned.length < 4) setPinned([...pinned, sim]); };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-sky-accent/25 bg-sky-accent/5 flex items-start gap-2">
        <FlaskConical className="w-4 h-4 text-sky-accent shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground">
          <span className="text-sky-accent font-medium">Policy simulation only.</span> This lab models public-policy approaches with explicit assumptions and honest uncertainty. It advocates no position, never presents projections as certainty, and never provides guidance for illegal activity.
        </p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Policy framework — none is the preferred default</p>
        <div className="flex gap-1.5 flex-wrap">
          {FRAMEWORKS.map(f => (
            <button
              key={f.id}
              onClick={() => setFramework(f.id)}
              title={f.note}
              className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${framework === f.id ? 'border-sky-accent text-sky-accent bg-sky-accent/10' : 'border-border text-muted-foreground'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">{FRAMEWORKS.find(f => f.id === framework)?.note}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={run} className="text-xs">Run Simulation</Button>
        {sim && pinned.length < 4 && (
          <Button size="sm" variant="outline" onClick={pin} className="text-xs border-border"><Pin className="w-3 h-3 mr-1" />Pin for comparison</Button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${view === v.id ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}>
            {v.label}{v.id === 'compare' && pinned.length ? ` (${pinned.length})` : ''}
          </button>
        ))}
      </div>

      {view === 'results' && (sim ? (
        <div className="space-y-3">
          <PolicyResults sim={sim} />
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-[11px] font-medium mb-1">Known limitations</p>
            {sim.limitations.map(l => <p key={l} className="text-[10px] text-muted-foreground">· {l}</p>)}
            <p className="text-[10px] text-muted-foreground/60 mt-1.5">{sim.simulation_type} · generated {new Date(sim.generated_at).toLocaleString()}</p>
          </div>
        </div>
      ) : <p className="text-xs text-muted-foreground">Choose a framework, adjust assumptions if you wish, and run the simulation.</p>)}

      {view === 'assumptions' && <AssumptionSliders values={assumptions} onChange={setAssumptions} />}
      {view === 'compare' && <PolicyComparison scenarios={pinned} onRemove={i => setPinned(pinned.filter((_, x) => x !== i))} />}
      {view === 'ethics' && <EthicsTradeoffPanel sim={sim} />}
    </div>
  );
}