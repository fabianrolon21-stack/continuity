import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EGGS } from '@/lib/bison/face/faceConfig';
import { selectEgg } from '@/lib/bison/face/faceEngine';
import { playFaceSfx } from '@/lib/bison/face/faceSfx';

export default function EggSelection({ onHatched }) {
  const [chosen, setChosen] = useState(null);
  const [hatching, setHatching] = useState(false);

  const confirm = async (egg) => {
    setHatching(true);
    playFaceSfx('hatch', true);
    const state = await selectEgg(egg.id);
    setTimeout(() => onHatched?.(state), 2200);
  };

  return (
    <div className="glass framed rounded-2xl p-6 text-center">
      <AnimatePresence mode="wait">
        {hatching ? (
          <motion.div key="hatch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
            <motion.div
              className="mx-auto w-20 h-24 rounded-[50%_50%_45%_45%/60%_60%_40%_40%]"
              style={{ background: chosen.color }}
              animate={{ rotate: [0, -8, 8, -6, 6, 0], scale: [1, 1.05, 1, 1.08, 1] }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
            <motion.p
              className="text-sm text-muted-foreground mt-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}
            >
              Something is waking up…
            </motion.p>
          </motion.div>
        ) : (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-heading text-lg font-semibold text-gold">Choose your Bison</h2>
            <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
              Four eggs, none better than another. The one you choose becomes yours, and grows as you spend time together.
            </p>
            <div className="grid grid-cols-4 gap-3">
              {EGGS.map(egg => (
                <button
                  key={egg.id}
                  onClick={() => setChosen(egg)}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl no-tap-highlight transition-colors"
                  style={{ background: chosen?.id === egg.id ? `${egg.color}1f` : 'transparent' }}
                >
                  <motion.div
                    className="w-10 h-12 rounded-[50%_50%_45%_45%/60%_60%_40%_40%]"
                    style={{ background: egg.color, boxShadow: `0 0 18px ${egg.color}55` }}
                    animate={chosen?.id === egg.id ? { scale: [1, 1.12, 1.06] } : { y: [0, -4, 0] }}
                    transition={{ duration: chosen?.id === egg.id ? 0.5 : 4, repeat: chosen?.id === egg.id ? 0 : Infinity, ease: 'easeInOut' }}
                  />
                  <span className="text-[10px] text-muted-foreground">{egg.label}</span>
                </button>
              ))}
            </div>
            <button
              disabled={!chosen}
              onClick={() => confirm(chosen)}
              className="mt-6 px-6 py-2.5 rounded-lg text-sm font-medium bg-gold/15 text-gold disabled:opacity-40 no-tap-highlight"
            >
              {chosen ? `Hatch the ${chosen.label} egg` : 'Pick an egg'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}