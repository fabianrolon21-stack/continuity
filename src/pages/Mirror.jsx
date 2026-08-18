import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { processInput } from '@/lib/bison/masterLoop';
import { BISON_MASTER_DIRECTIVE } from '@/lib/bison/masterDirective';
import { recordCounterfactual, openLoops } from '@/lib/bison/continuity/counterfactualEngine';
import SignalList from '@/components/mirror/SignalList';
import GapCard from '@/components/mirror/GapCard';
import PatternReflection from '@/components/mirror/PatternReflection';
import PeripheralView from '@/components/mirror/PeripheralView';
import TraitRegulationPanel from '@/components/mirror/TraitRegulationPanel';
import OpenLoops from '@/components/mirror/OpenLoops';
import BudgetClarityCard from '@/components/mirror/BudgetClarityCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScanEye } from 'lucide-react';

const REVERSIBILITIES = ['high', 'medium', 'low', 'irreversible'];

export default function Mirror() {
  const [text, setText] = useState('');
  const [reversibility, setReversibility] = useState('medium');
  const [result, setResult] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [logged, setLogged] = useState(false);
  const [loops, setLoops] = useState(openLoops);

  const reflect = () => {
    if (!text.trim()) return;
    setResult(processInput(text.trim(), reversibility));
    setLogged(false);
  };

  const logDecision = () => {
    recordCounterfactual({
      chosenAction: result.impulse || text.trim().slice(0, 120),
      alternatives: [result.gap.alternativeAction, 'Do nothing'],
      predictedOutcome: prediction.trim() || undefined,
    });
    setLoops(openLoops());
    setLogged(true);
    setPrediction('');
  };

  return (
    <div>
      <PageHeader title="Mirror" subtitle="Feel → pause → map → choose → observe → learn. Feelings are data, not commands." accent="hsl(21 73% 69%)" />
      <div className="px-6 lg:px-10 pb-8 space-y-4 max-w-2xl">
        <div className="glass rounded-xl p-4 space-y-3">
          <Textarea value={text} onChange={event => setText(event.target.value)} placeholder="What are you feeling, and what are you about to do?" rows={3} className="bg-secondary/40 border-border text-sm" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">How reversible is the action?</span>
            {REVERSIBILITIES.map(level => (
              <button key={level} onClick={() => setReversibility(level)} className={`rounded-full px-3 py-1 text-xs no-tap-highlight ${reversibility === level ? 'bg-gold/20 text-gold' : 'bg-secondary/50 text-muted-foreground'}`}>{level}</button>
            ))}
          </div>
          <Button onClick={reflect} className="w-full"><ScanEye className="w-4 h-4 mr-1" />Hold it up to the mirror</Button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }} className="space-y-4">
            <SignalList signals={result.signals} />
            <GapCard gap={result.gap} latency={result.latency} />
            <PatternReflection egoThreat={result.egoThreat} patterns={result.patterns} trying={result.trying} />
            <PeripheralView social={result.social} peripheral={result.peripheral} />
            <TraitRegulationPanel traitStates={result.traitStates} />
            <div className="glass rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-leaf">Your choice — Bison will not choose for you</p>
              {!logged ? (
                <>
                  <Input value={prediction} onChange={event => setPrediction(event.target.value)} placeholder="Optional: what do you predict will happen?" className="bg-secondary/40 border-border text-xs h-8" />
                  <Button onClick={logDecision} variant="outline" className="w-full border-border text-xs">Log my decision so we can compare it with reality later</Button>
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground">Logged. It will wait in the open loops below until you report what actually happened.</p>
              )}
            </div>
          </motion.div>
        )}

        <OpenLoops loops={loops} onChanged={() => setLoops(openLoops())} />
        <BudgetClarityCard />

        <Accordion type="single" collapsible className="glass rounded-xl px-4">
          <AccordionItem value="directive" className="border-none">
            <AccordionTrigger className="text-xs font-medium text-muted-foreground py-3">Bison Master Directive</AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground pb-3">{BISON_MASTER_DIRECTIVE}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}