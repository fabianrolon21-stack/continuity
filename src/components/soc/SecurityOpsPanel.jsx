import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { searchForImprovements, learningEngineGuarantee } from '@/lib/bison/soc/evolutionEngine';
import { verifyAndDeploy } from '@/lib/bison/soc/verificationPipeline';
import { NEVER_REDUCE, MAY_IMPROVE } from '@/lib/bison/soc/invariants';
import DecisionBoardView from './DecisionBoardView';
import RiskMatrixView from './RiskMatrixView';
import SecurityPostureView from './SecurityPostureView';
import DeploymentTimeline from './DeploymentTimeline';
import { ShieldCheck, Sparkles } from 'lucide-react';

const VIEWS = [
  { id: 'proposals', label: 'Proposals' },
  { id: 'board', label: 'Decision Board' },
  { id: 'risk', label: 'Risk' },
  { id: 'security', label: 'Security' },
  { id: 'timeline', label: 'Timeline' },
];

export default function SecurityOpsPanel({ accent = 'hsl(0 70% 50%)' }) {
  const [proposals] = useState(() => searchForImprovements());
  const [selected, setSelected] = useState(proposals[0]);
  const [view, setView] = useState('proposals');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [version, setVersion] = useState(0);

  const run = async (learningOnly) => {
    setRunning(true);
    const r = await verifyAndDeploy(selected, { learningOnly });
    setResult(r);
    setRunning(false);
    setVersion(v => v + 1);
    setView('timeline');
  };

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Security Operations & Autonomous Optimization</h3>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Deployment requires no human approval — it requires constitutional verification: Package 44 → Package 46 → safety → privacy → performance → rollback → simulation → deployment. {learningEngineGuarantee}
      </p>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)} className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${view === v.id ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}>{v.label}</button>
        ))}
      </div>

      {view === 'proposals' && (
        <div className="space-y-2">
          <div className="p-2.5 rounded-lg bg-secondary/30 text-[10px] text-muted-foreground">
            <p><span className="text-leaf">May improve:</span> {MAY_IMPROVE.join(', ')}</p>
            <p className="mt-0.5"><span className="text-destructive">May never autonomously reduce:</span> {NEVER_REDUCE.join(', ').replace(/_/g, ' ')}</p>
          </div>
          {proposals.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left p-2.5 rounded-lg border transition-colors ${selected.id === p.id ? 'border-gold/50 bg-gold/5' : 'border-border bg-secondary/20'}`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold shrink-0" />
                <span className="text-[11px]">{p.title}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{p.domain} · expected gain {p.expected_gain} · {p.rationale}</p>
            </button>
          ))}
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="text-xs" disabled={running} onClick={() => run(false)}>{running ? 'Verifying…' : 'Run verification pipeline'}</Button>
            <Button size="sm" variant="outline" className="border-border text-xs" disabled={running} onClick={() => run(true)}>Learn only</Button>
          </div>
          {result && (
            <div className="p-2.5 rounded-lg bg-secondary/30 text-[10px]">
              <p className="font-medium">{result.title} → {result.outcome.replace(/_/g, ' ')}</p>
              {result.trace.map((t, i) => <p key={i} style={{ color: t.pass ? 'hsl(120 40% 58%)' : 'hsl(0 70% 50%)' }}>· {t.stage}: {t.detail}</p>)}
            </div>
          )}
        </div>
      )}

      {view === 'board' && <DecisionBoardView proposal={selected} />}
      {view === 'risk' && <RiskMatrixView proposal={selected} />}
      {view === 'security' && <SecurityPostureView />}
      {view === 'timeline' && <DeploymentTimeline version={version} />}
    </div>
  );
}