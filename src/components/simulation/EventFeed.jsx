import { motion } from 'framer-motion';

export default function EventFeed({ events }) {
  if (!events.length) {
    return <p className="text-xs text-muted-foreground px-1">Run a tick to see the world move.</p>;
  }
  return (
    <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-hide">
      {[...events].reverse().map((e, i) => (
        <motion.div
          key={`${e.tick}-${e.agentId}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="glass rounded-lg px-3 py-2 text-xs flex items-start gap-2"
        >
          <span className="text-[10px] text-muted-foreground font-mono shrink-0 pt-0.5">t{e.tick}</span>
          <span className="text-foreground/90">
            <span className="text-gold">{e.agentName}</span> {e.summary}
          </span>
        </motion.div>
      ))}
    </div>
  );
}