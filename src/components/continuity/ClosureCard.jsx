import { motion } from 'framer-motion';

const LINES = [
  'THE MAP IS AN INTERPRETATION.',
  'KNOWN IS NOT THE SAME AS CERTAIN.',
  'UNKNOWN DOES NOT MEAN IMPOSSIBLE.',
  'THE USER REMAINS THE DECISION-MAKER.',
];

// §19 — the ending of a chapter, not a warning screen.
export default function ClosureCard({ onResume }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} className="glass rounded-xl p-6 text-center border border-purple-accent/25">
      {LINES.map((line, index) => (
        <motion.p key={line} className="text-xs tracking-widest text-foreground/85 mb-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + index * 1.2, duration: 1, ease: 'easeInOut' }}>
          {line}
        </motion.p>
      ))}
      <motion.p className="mt-4 text-[10px] italic text-purple-accent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6, duration: 1.5 }}>
        A piece of conceptual art.
      </motion.p>
      <motion.button onClick={onResume} className="mt-5 text-[11px] text-muted-foreground underline-offset-2 hover:underline no-tap-highlight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 7 }}>
        The session remains recoverable — reopen the map
      </motion.button>
    </motion.div>
  );
}