import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventBus } from '@/lib/events/eventBus';
import { loadFaceState, interact, setSfxEnabled } from '@/lib/bison/face/faceEngine';
import { PHASE_CONFIG, EGGS, progressToNextPhase } from '@/lib/bison/face/faceConfig';
import { playFaceSfx } from '@/lib/bison/face/faceSfx';
import { Apple, Gamepad2, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function FacePanel({ state: initial, onChange }) {
  const [state, setState] = useState(initial);
  const [pulse, setPulse] = useState(null);
  const [evolution, setEvolution] = useState(null);

  useEffect(() => { if (!state) loadFaceState().then(setState); }, [state]);

  const apply = (result, kind) => {
    if (!result) return;
    setState(result.state);
    onChange?.(result.state);
    setPulse(result.animation);
    setTimeout(() => setPulse(null), 1200);
    playFaceSfx(result.evolved ? 'evolve' : kind, result.state.sfxEnabled);
    if (result.evolved) {
      setEvolution({ phase: result.state.phase, from: result.fromPhase });
      setTimeout(() => setEvolution(null), 6000);
    }
  };

  // Existing sanctuary interactions also count toward growth.
  useEffect(() => {
    const un1 = eventBus.subscribe('BISON_FED', () => interact('feed').then(r => apply(r, 'feed')));
    const un2 = eventBus.subscribe('BISON_PLAY_REQUESTED', () => interact('play').then(r => apply(r, 'play')));
    return () => { un1(); un2(); };
  }, []);

  if (!state) return null;
  const cfg = PHASE_CONFIG[state.phase];
  const egg = EGGS.find(e => e.id === state.eggColor) || EGGS[0];
  const { next, percent } = progressToNextPhase(state.growthPoints, state.phase);

  return (
    <div className="glass framed rounded-2xl p-5 relative overflow-hidden">
      <AnimatePresence>
        {evolution && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-gold/10"
          >
            <Sparkles className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gold">Bison grew — Phase {evolution.phase}: {PHASE_CONFIG[evolution.phase].label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Unlocked: {PHASE_CONFIG[evolution.phase].unlockedFeatures.join(' · ').replace(/_/g, ' ')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <motion.div
          className="w-12 h-14 shrink-0 rounded-[50%_50%_45%_45%/60%_60%_40%_40%]"
          style={{ background: egg.color, boxShadow: `0 0 20px ${egg.color}55` }}
          animate={
            pulse === 'anim_eat_happy' ? { scale: [1, 1.15, 1] }
              : pulse === 'anim_jump_playful' ? { y: [0, -14, 0, -7, 0] }
              : pulse ? { scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] }
              : { scale: [1, 1.03, 1] }
          }
          transition={{ duration: pulse ? 0.9 : 4, repeat: pulse ? 0 : Infinity, ease: 'easeInOut' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Phase {state.phase} · {cfg.label}</p>
            <button
              onClick={() => setSfxEnabled(!state.sfxEnabled).then(s => { setState(s); onChange?.(s); })}
              className="text-muted-foreground hover:text-foreground no-tap-highlight"
              aria-label={state.sfxEnabled ? 'Turn Face sounds off' : 'Turn Face sounds on'}
            >
              {state.sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
            <div className="h-full rounded-full bg-gold transition-all duration-700" style={{ width: `${Math.max(3, percent)}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {next ? `${state.growthPoints} growth · ${percent}% to Phase ${next}` : `${state.growthPoints} growth · fully grown`}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => interact('feed').then(r => apply(r, 'feed'))}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-leaf/10 text-leaf text-xs font-medium no-tap-highlight"
        >
          <Apple className="w-3.5 h-3.5" /> Feed
        </button>
        <button
          onClick={() => interact('play').then(r => apply(r, 'play'))}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-peach/10 text-peach text-xs font-medium no-tap-highlight"
        >
          <Gamepad2 className="w-3.5 h-3.5" /> Play
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground/70 mt-3">
        Growth is a progression layer: it changes how Bison presents itself and which features are unlocked. It never changes safety, privacy, or your authority.
      </p>
    </div>
  );
}