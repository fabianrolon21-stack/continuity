import { motion } from 'framer-motion';

function OptionPortrait({ tag, option, onSelect, accent }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onSelect}
      className="flex-1 rounded-xl border border-border/70 p-4 text-left transition-colors hover:border-gold/40 no-tap-highlight"
      style={{ background: 'hsl(268 14% 12% / 0.6)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${accent}22`, color: accent }}>{tag}</span>
        <span className="text-sm font-semibold">{option.label}</span>
      </div>
      <p className="text-2xl font-heading font-bold" style={{ color: accent }}>{option.probability}%</p>
      <p className="mt-1 text-[10px] text-muted-foreground">decision weight · reversibility: {option.reversibility}</p>
    </motion.button>
  );
}

export default function BinaryDecisionCard({ decision, onChoose }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="mb-1 text-xs font-medium text-gold">Binary Interface — R1 / R2</p>
      <p className="mb-3 text-[10px] text-muted-foreground">These are decision weights, not advice. You alone decide.</p>
      <div className="flex gap-3">
        <OptionPortrait tag="R1" option={decision.optionA} accent="hsl(120 40% 58%)" onSelect={() => onChoose('A')} />
        <OptionPortrait tag="R2" option={decision.optionB} accent="hsl(21 73% 69%)" onSelect={() => onChoose('B')} />
      </div>
    </div>
  );
}