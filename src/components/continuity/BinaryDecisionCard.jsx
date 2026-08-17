import { useState } from 'react';
import { motion } from 'framer-motion';
import { getOptions } from '@/lib/bison/continuity/binaryWeightingEngine';
import ReversibilityIndicator from '@/components/continuity/ReversibilityIndicator';
import { Button } from '@/components/ui/button';

const ACCENTS = ['hsl(120 40% 58%)', 'hsl(21 73% 69%)', 'hsl(199 56% 64%)', 'hsl(265 41% 64%)'];

// §2, §4 — COMPARATIVE WEIGHT (never "probability"); the user explores
// a branch's factors and uncertainties before anything is selected.
export default function BinaryDecisionCard({ decision, onChoose, onExploreOthers }) {
  const [inspecting, setInspecting] = useState(null);
  const options = getOptions(decision);
  const inspected = options.find(option => option.id === inspecting);

  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs font-medium text-gold">What do you want to explore?</p>
      <p className="mb-3 text-[10px] text-muted-foreground">Status: AWAITING_USER_SELECTION — no option is ever chosen for you.</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => setInspecting(option.id === inspecting ? null : option.id)}
            className={`rounded-xl border p-3 text-left no-tap-highlight transition-colors ${inspecting === option.id ? 'border-gold/60' : 'border-border/70'}`}
            style={{ background: 'hsl(268 14% 12% / 0.6)' }}
          >
            <p className="text-xs font-semibold">{option.label}</p>
            <p className="mt-1 text-lg font-heading font-bold" style={{ color: ACCENTS[index % ACCENTS.length] }}>{option.decisionWeight}</p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Comparative weight</p>
          </motion.button>
        ))}
      </div>
      {inspected && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2 rounded-lg bg-secondary/30 p-3">
          <ReversibilityIndicator reversibility={inspected.reversibility} />
          {inspected.supportingFactors.length > 0 && <div><p className="text-[10px] font-medium text-leaf">Supporting factors</p>{inspected.supportingFactors.slice(0, 3).map((factor, index) => <p key={index} className="text-[11px] text-muted-foreground">· {factor}</p>)}</div>}
          {inspected.uncertainties.length > 0 && <div><p className="text-[10px] font-medium text-peach">Uncertainties</p>{inspected.uncertainties.slice(0, 3).map((item, index) => <p key={index} className="text-[11px] text-muted-foreground">· {item}</p>)}</div>}
          <Button onClick={() => onChoose(inspected.id)} className="w-full text-xs">Choose this path</Button>
        </motion.div>
      )}
      {decision.alternatives.length === 0 && (
        <Button onClick={onExploreOthers} variant="outline" className="mt-3 w-full border-border text-xs">Explore other paths</Button>
      )}
    </div>
  );
}