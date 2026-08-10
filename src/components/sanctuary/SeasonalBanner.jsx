import { motion } from 'framer-motion';
import { currentSeason, activeEvent, nextEvent, SEASON_LABEL } from '@/lib/world/seasonalEvents';

// A quiet marker of where the year is — no notification, no demand.
export default function SeasonalBanner() {
  const season = currentSeason();
  const event = activeEvent();
  const upcoming = event ? null : nextEvent();

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="px-2.5 py-1.5 rounded-lg border border-white/10 max-w-[150px]"
      style={{ background: 'hsl(268 14% 10% / 0.6)', backdropFilter: 'blur(8px)' }}
    >
      <p className="text-[9px] uppercase tracking-wide text-white/40">{SEASON_LABEL[season]}</p>
      {event ? (
        <>
          <p className="text-[11px] font-medium leading-tight" style={{ color: event.tint }}>{event.label}</p>
          <p className="text-[9px] text-white/45 leading-tight mt-0.5">{event.note}</p>
        </>
      ) : (
        <p className="text-[9px] text-white/45 leading-tight">Next: {upcoming.label}</p>
      )}
    </motion.div>
  );
}