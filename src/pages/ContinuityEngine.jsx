import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateBinaryDecision, generateAlternatives, recordUserChoice, getOptions } from '@/lib/bison/continuity/binaryWeightingEngine';
import { buildMapState, revealNodes } from '@/lib/bison/continuity/fogOfWarMapEngine';
import { archiveBranch, loadBranches, markRevisited } from '@/lib/bison/continuity/branchArchive';
import { triggerClosureSequence } from '@/lib/bison/continuity/closureSequence';
import { computeBars } from '@/lib/bison/continuity/epistemicBars';
import { analyzeStrategies, DEFAULT_PRIORITIES } from '@/lib/bison/continuity/decisionStrategyEngine';
import { saveSession, loadSession, clearSession } from '@/lib/bison/continuity/continuitySession';
import EpistemicBarsDisplay from '@/components/continuity/EpistemicBarsDisplay';
import FogOfWarMap from '@/components/continuity/FogOfWarMap';
import BinaryDecisionCard from '@/components/continuity/BinaryDecisionCard';
import IntentConfirmCard from '@/components/continuity/IntentConfirmCard';
import PrioritySliders from '@/components/continuity/PrioritySliders';
import ClosureCard from '@/components/continuity/ClosureCard';
import ArchivedBranchList from '@/components/continuity/ArchivedBranchList';
import { Map, Archive, HeartHandshake, RotateCcw } from 'lucide-react';

const DISTRESS_TERMS = ['panic', "can't breathe", 'hopeless', 'overwhelmed', 'crisis', 'hurt myself', 'terrified'];
const REVERSIBILITIES = ['high', 'medium', 'low', 'irreversible'];

function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function deriveReliability(situation, reversibility) {
  const sentences = (situation.match(/[^.!?\n]+[.!?]?/g) || []).map(s => s.trim()).filter(Boolean);
  const questions = sentences.filter(s => s.includes('?'));
  const statements = sentences.filter(s => !s.includes('?'));
  return {
    reliability: Math.max(20, Math.min(90, 40 + Math.min(40, situation.trim().split(/\s+/).length) - questions.length * 6)),
    reversibility,
    unknowns: Math.min(6, 1 + questions.length),
    alternatives: 2,
    supportingFactors: statements.slice(0, 3),
    uncertainties: questions.slice(0, 3),
  };
}

const interpret = (text, reversibility) =>
  `Explore this decision while treating its consequences as ${reversibility === 'high' ? 'largely reversible' : reversibility === 'irreversible' ? 'irreversible once taken' : `${reversibility}-reversibility`}, keeping the option to revisit deferred paths, and separating what is known from what is still unknown.`;

export default function ContinuityEngine() {
  const [situation, setSituation] = useState('');
  const [reversibility, setReversibility] = useState('medium');
  const [phase, setPhase] = useState('input'); // input | confirm | exploring | closing | closed
  const [session, setSession] = useState(null);
  const [branches, setBranches] = useState(loadBranches);
  const [distressed, setDistressed] = useState(false);

  // §17/§25 — sessions survive leaving the page; resume where Bison left off.
  useEffect(() => {
    const saved = loadSession();
    if (saved?.phase && saved.phase !== 'input') { setSession(saved.session); setSituation(saved.situation); setPhase(saved.phase === 'closing' ? 'closed' : saved.phase); }
  }, []);
  useEffect(() => {
    if (session) saveSession({ session, situation, phase });
  }, [session, phase, situation]);

  const begin = () => {
    const text = situation.trim();
    if (!text) return;
    if (DISTRESS_TERMS.some(term => text.toLowerCase().includes(term))) { setDistressed(true); return; }
    setDistressed(false);
    setPhase('confirm');
  };

  const confirmIntent = (confirmed, correctedIntent) => {
    const text = situation.trim();
    const report = deriveReliability(text, reversibility);
    const seed = hashText(text) % 10000 || 7;
    setSession({
      report,
      bars: computeBars(report),
      decision: generateBinaryDecision(report, 'Reflect', 'React'),
      mapState: revealNodes(buildMapState(text, seed), 2, 'session start'),
      priorities: DEFAULT_PRIORITIES,
      strategies: [],
      intent: {
        rawInput: text,
        interpretedIntent: correctedIntent || interpret(text, reversibility),
        interpretationConfidence: confirmed ? 0.8 : 1,
        userConfirmedInterpretation: true,
        timestamp: Date.now(),
      },
      chosen: false,
      closure: null,
    });
    setPhase('exploring');
  };

  const exploreOthers = () => setSession(previous => {
    const decision = generateAlternatives(previous.decision, previous.report);
    return { ...previous, decision, strategies: analyzeStrategies(decision, previous.priorities) };
  });

  const setPriorities = priorities => setSession(previous => ({
    ...previous, priorities,
    strategies: previous.strategies.length ? analyzeStrategies(previous.decision, priorities) : [],
  }));

  const choose = selectedId => setSession(previous => {
    const decision = recordUserChoice(previous.decision, selectedId, previous.intent);
    getOptions(decision).filter(option => option.status === 'revisitable').forEach(option =>
      archiveBranch({ decisionId: decision.id, discardedIdea: option.label, chosenInstead: decision.selectedAction, contextHash: `ctx_${hashText(previous.intent.rawInput)}`, epistemicState: previous.bars }),
    );
    setBranches(loadBranches());
    return {
      ...previous, decision, chosen: true,
      mapState: revealNodes(previous.mapState, 3, decision.selectedAction),
      strategies: previous.strategies.length ? previous.strategies : analyzeStrategies(decision, previous.priorities),
    };
  });

  const close = () => {
    setSession(previous => ({ ...previous, closure: triggerClosureSequence() }));
    setPhase('closing');
    setTimeout(() => setPhase('closed'), 4000);
  };

  const revisit = branch => {
    markRevisited(branch.id);
    setBranches(loadBranches());
    setSituation(`Revisiting an archived path: ${branch.discardedIdea}. Historical context used — originally set aside for “${branch.chosenInstead || 'another path'}”.`);
    setSession(null); setPhase('input'); clearSession();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => { setSession(null); setSituation(''); setPhase('input'); clearSession(); };

  return (
    <div>
      <PageHeader title="Bison / Continuity" subtitle="Bison renders the terrain around the decision. You remain the decision-maker." accent="hsl(199 56% 64%)" />
      <div className="px-6 lg:px-10 pb-8 space-y-4 max-w-2xl">
        {phase === 'input' && (
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
        )}

        {distressed && (
          <div className="glass rounded-xl p-4 border border-leaf/30 flex items-start gap-3">
            <HeartHandshake className="w-4 h-4 text-leaf mt-0.5 shrink-0" />
            <p className="text-xs">A decision matrix isn't what this moment needs. Let's ground first — slow breath in for four, hold for four, out for six. The map will still be here when you're steady.</p>
          </div>
        )}

        {phase === 'confirm' && <IntentConfirmCard rawInput={situation.trim()} interpretation={interpret(situation.trim(), reversibility)} onConfirm={confirmIntent} />}

        <AnimatePresence>
          {session && phase !== 'input' && phase !== 'confirm' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }} className="space-y-4">
              <FogOfWarMap mapState={session.mapState} closing={phase === 'closing' || phase === 'closed'} />
              <div className="glass rounded-xl p-4">
                <p className="mb-2 text-xs font-medium text-sky-accent">Knowledge state <span className="text-[9px] text-muted-foreground font-normal">— independent dimensions, not slices of a pie</span></p>
                <EpistemicBarsDisplay bars={session.bars} />
              </div>

              {phase === 'exploring' && !session.chosen && (
                <>
                  <BinaryDecisionCard decision={session.decision} onChoose={choose} onExploreOthers={exploreOthers} />
                  <PrioritySliders priorities={session.priorities} onChange={setPriorities} />
                </>
              )}

              {session.chosen && phase === 'exploring' && (
                <div className="glass rounded-xl p-4 text-xs space-y-1.5">
                  <p className="text-gold font-medium">Intent locked: {session.decision.selectedAction}</p>
                  <p className="text-muted-foreground">You said: “{session.intent.rawInput.slice(0, 120)}”</p>
                  <p className="text-muted-foreground">Confirmed interpretation: “{session.intent.interpretedIntent}”</p>
                  <p className="text-muted-foreground/70">The other paths remain revisitable in the archive below.</p>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => setSession(previous => ({ ...previous, mapState: revealNodes(previous.mapState, 2, previous.decision.selectedAction) }))} variant="outline" className="flex-1 border-border text-xs">Lift more fog</Button>
                    <Button onClick={close} variant="outline" className="flex-1 border-border text-xs">End the chapter</Button>
                  </div>
                </div>
              )}

              {session.strategies.length > 0 && phase === 'exploring' && (
                <div className="glass rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-sky-accent">Analysis</p>
                  {session.strategies.map(result => (
                    <p key={result.actionId} className="text-[11px] text-muted-foreground"><span className="text-foreground/80 font-medium">{result.strategy.replaceAll('_', ' ')}:</span> {result.rationale}</p>
                  ))}
                  <p className="pt-1 text-[10px] font-medium tracking-widest text-gold border-t border-border/50">BISON WILL NOT CHOOSE FOR YOU.</p>
                </div>
              )}

              {phase === 'closed' && <ClosureCard onResume={() => setPhase('exploring')} />}
            </motion.div>
          )}
        </AnimatePresence>

        {session && (
          <button onClick={reset} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground no-tap-highlight"><RotateCcw className="w-3 h-3" />Start a new session</button>
        )}

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3"><Archive className="w-4 h-4 text-muted-foreground" /><h3 className="font-heading font-semibold text-sm">Archived Paths — Extinct Algorithms</h3></div>
          <ArchivedBranchList branches={branches} onRevisit={revisit} />
        </div>
      </div>
    </div>
  );
}