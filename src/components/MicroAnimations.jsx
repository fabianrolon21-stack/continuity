import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

export function SaveRipple({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-gold"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SparkleConfirm({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-24 lg:bottom-8 right-8 pointer-events-none z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg glass shadow-xl">
            <Sparkles className="w-4 h-4 text-gold animate-sparkle" />
            <span className="text-sm font-medium text-gold">Saved</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AchievementToast({ show, title, subtitle }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-6 left-1/2 -translate-x-1/2 pointer-events-none z-50"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl glass shadow-2xl border border-gold/30">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gold">{title}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PageHeader({ title, subtitle, accent = 'hsl(42 63% 55%)' }) {
  return (
    <div className="px-6 lg:px-10 pt-8 pb-4">
      <h1 className="font-heading text-2xl lg:text-3xl font-bold" style={{ color: accent }}>{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && <Icon className="w-12 h-12 text-muted-foreground/40 mb-3" />}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">{subtitle}</p>}
    </div>
  );
}