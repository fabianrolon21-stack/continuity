import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateBinaryDecision, recordUserChoice } from '@/lib/bison/continuity/binaryWeightingEngine';
import { initialMapState, renderMapRadius } from '@/lib/bison/continuity/progressiveRadiusRenderer';
import { generatePeripherals } from '@/lib/bison/continuity/peripheralBranchGenerator';
import { archiveExtinctData, loadArchive } from '@/lib/bison/continuity/extinctAlgorithmArchive';
import { triggerClosureSequence } from '@/lib/bison/continuity/closureSequence';
import { computeBars } from '@/lib/bison/continuity/epistemicBars';
import { MAP_ALGORITHMS } from '@/lib/bison/continuity/proceduralMapGenerator';
import { evaluateStrategy } from '@/lib/bison/continuity/decisionStrategyEngine';
import EpistemicBarsDisplay from '@/components/continuity/EpistemicBarsDisplay';
import FogOfWarMap from '@/components/continuity/FogOfWarMap';
import BinaryDecisionCard from '@/components/continuity/BinaryDecisionCard';
import PeripheralsCard from '@/components/continuity/PeripheralsCard';
import ClosureCard from '@/components/continuity/ClosureCard';
import ExtinctArchiveList from '@/components/continuity/ExtinctArchiveList';
import { Map, Archive, HeartHandshake } from 'lucide-react';

const DISTRESS_TERMS = ['panic', 'can\'t breathe', 'hopeless', 'overwhelmed', 'crisis', 'hurt myself', 'terrified'];
const REVERSIBILITIES = ['high', 'medium', 'low', 'irreversible'];

function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return `ctx_${Math.abs(hash)}`;
}

function deriveReliability(situation, reversibility) {
  const words = situation.trim().split(/\s+/).filter(Boolean);
  const questions = (situation.match(/\?/g) || []).length;
  return {
    reliability: Math.max(20, Math.min(90, 40 + Math.min(40, words.length) - questions * 6)),
    reversibility,
    unknowns: Math.min(6, 1 + questions),
    alternatives: 2,
  };
}

export default function ContinuityEngine() {
  const [situation, setSituation] = useState('');
  const [reversibility, setReversibility] = useState('medium');
  const [session, setSession] = useState(null);
  const [archive, setArchive] = useState(loadArchive);
  const [distressed, setDistressed] = useState(false);

  const begin = () => {
    const text = situation.trim();
    if (!text) return;
    if (DISTRESS_TERMS.some(term => text.toLowerCase().includes(term))) { setDistressed(true); return; }
    setDistressed(false);
    const report = deriveReliability(text, reversibility);
    setSession({
      report,
      bars: computeBars(report),
      decision: generateBinaryDecision(report, 'Reflect', 'React'),
      mapState: initialMapState(),
      seed: Math.abs(hashText(text).split('_')[1] % 10000) || 7,
      algorithm: MAP_ALGORITHMS[text.length % MAP_ALGORITHMS.length],
      chosen: null, peripherals: null, closure: null, strategies: [],
    });
  };

  const choose = selected => {
    setSession(previous => {
      const decision = recordUserChoice(previous.decision, selected, situation.trim());
      archiveExtinctData(decision.selectedAction, decision.discardedAction, hashText(situation));
      setArchive(loadArchive());
      return {
        ...previous,
        decision,
        chosen: selected,
        mapState: renderMapRadius(previous.mapState, decision.selectedAction),
        peripherals: generatePeripherals(decision.selectedAction, previous.report.reliability / 100),
        strategies: ['behavior_tree', 'utility_ai', 'goap'].map(strategy => evaluateStrategy(decision, strategy)),
        closure: triggerClosureSequence(),
      };
    });
  };

  const expand = () => setSession(previous => ({ ...previous, mapState: renderMapRadius(previous.mapState, previous.decision.selectedAction) }));

  return (
    <div>
      <PageHeader title="Continuity Engine" subtitle="Decision matrix & fog-of-war map — advisory, never directive" accent="hsl(199 56% 64%)" />
      <div className="px-6 lg:px-10 pb-8 space-y-4 max-w-2xl">
        <div className="glass rounded-xl p-4 space-y-3">
          <Textarea value={situation} onChange={event => setSituation(event.target.value)} placeholder="Describe the decision you're facing…" className="bg-secondary/40 border-border text-sm" rows={3} />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Reversibility:</span>
            {REVERSIBILITIES.map(level => (
              <button key={level} onClick={() => setReversibility(level)} className={`rounded-full px-3 py-1 text-xs no-tap-highlight ${reversibility === level ? 'bg-gold/20 text-gold' : 'bg-secondary/50 text-muted-foreground'}`}>{level}</button>
            ))}
          </div>
          <Button onClick={begin} className="w-full"><Map className="w-4 h-4 mr-1" />Reveal the map</Button>
        </div>

        {distressed && (
          <div className="glass rounded-xl p-4 border border-leaf/30 flex items-start gap-3">
            <HeartHandshake className="w-4 h-4 text-leaf mt-0.5 shrink-0" />
            <p className="text-xs">A decision matrix isn't what this moment needs. Let's ground first — slow breath in for four, hold for four, out for six. The map will still be here when you're steady.</p>
          </div>
        )}

        <AnimatePresence>
          {session && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }} className="space-y-4">
              <EpistemicBarsDisplay bars={session.bars} />
              {!session.chosen && <BinaryDecisionCard decision={session.decision} onChoose={choose} />}
              {session.chosen && (
                <div className="glass rounded-xl p-4 text-xs space-y-1">
                  <p className="text-gold font-medium">Intent locked: {session.decision.selectedAction}</p>
                  <p className="text-muted-foreground">“{session.decision.recordedIntent}”</p>
                  <p className="text-muted-foreground/70">Discarded path “{session.decision.discardedAction}” archived as an extinct algorithm.</p>
                </div>
              )}
              <FogOfWarMap mapState={session.mapState} seed={session.seed} algorithm={session.algorithm} />
              {session.chosen && (
                <>
                  <Button onClick={expand} variant="outline" className="w-full border-border text-xs">Lift more fog (Level {session.mapState.currentRadius + 1})</Button>
                  <PeripheralsCard peripherals={session.peripherals} />
                  <div className="glass rounded-xl p-4 space-y-2">
                    <p className="text-xs font-medium text-sky-accent">Strategy readings (explainable, non-binding)</p>
                    {session.strategies.map(result => (
                      <p key={result.actionId} className="text-[11px] text-muted-foreground"><span className="text-foreground/80 font-medium">{result.strategy}</span> leans {result.leans === 'A' ? 'R1' : 'R2'} · {result.rationale} ({Math.round(result.confidence * 100)}%)</p>
                    ))}
                  </div>
                  <ClosureCard closure={session.closure} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3"><Archive className="w-4 h-4 text-muted-foreground" /><h3 className="font-heading font-semibold text-sm">Extinct Algorithm Archive</h3></div>
          <ExtinctArchiveList records={archive} />
        </div>
      </div>
    </div>
  );
}