import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

export default function ClosureCard({ closure }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="glass rounded-xl p-4 border border-purple-accent/30"
    >
      <div className="flex items-start gap-3">
        <Palette className="w-4 h-4 text-purple-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-xs">{closure.message}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">System status: {closure.systemStatus}</p>
        </div>
      </div>
    </motion.div>
  );
}