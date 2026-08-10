import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { wakeAndTick, performCareAction } from '@/lib/bison/companionEngine';
import { emit } from '@/lib/events/eventBus';
import { Hand, Apple, Droplets, Moon, Heart, Compass, Sprout, Palette, MessageCircle, ChevronLeft } from 'lucide-react';

const FOODS = [
  { id: 'apple', label: 'Apple', emoji: '🍎' },
  { id: 'watermelon', label: 'Watermelon', emoji: '🍉' },
  { id: 'carrot', label: 'Carrot', emoji: '🥕' },
  { id: 'berries', label: 'Berries', emoji: '🫐' },
];
const TOYS = [
  { id: 'ball', label: 'Ball', emoji: '⚽' },
  { id: 'stick', label: 'Stick', emoji: '🪵' },
  { id: 'frisbee', label: 'Frisbee', emoji: '🥏' },
];

export default function InteractMenu({ onSceneStart }) {
  const [folder, setFolder] = useState(null); // null | root | care | food | play | explore
  const [needs, setNeeds] = useState(null);

  useEffect(() => {
    wakeAndTick().then(c => setNeeds(c.needsState)).catch(() => {});
  }, []);

  const act = (action, prop) => {
    setFolder(null);
    onSceneStart?.();
    emit('BISON_CARE_ACTION', { action, prop }, 'InteractMenu');
    performCareAction(action).then(setNeeds).catch(() => {});
  };

  const Item = ({ icon: Icon, emoji, label, color, onClick, to }) => {
    const inner = (
      <>
        {Icon ? <Icon className="w-4 h-4" style={{ color }} /> : <span className="text-base leading-none">{emoji}</span>}
        <span className="text-xs font-medium text-white/85">{label}</span>
      </>
    );
    const cls = "flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] transition-colors no-tap-highlight w-full";
    return to
      ? <Link to={to} className={cls}>{inner}</Link>
      : <button onClick={onClick} className={cls}>{inner}</button>;
  };

  const NeedBar = ({ label, value }) => (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-white/50 w-14 capitalize">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-gold transition-all duration-700" style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence>
        {folder && (
          <motion.div
            key={folder}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="mb-2 w-56 rounded-xl p-2 space-y-1.5 border border-white/10"
            style={{ background: 'hsl(268 14% 10% / 0.85)', backdropFilter: 'blur(12px)' }}
          >
            {folder !== 'root' && (
              <button onClick={() => setFolder(folder === 'food' ? 'care' : 'root')} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 px-1 no-tap-highlight">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            )}

            {folder === 'root' && (
              <>
                <Item icon={Heart} label="Care" color="hsl(120 40% 58%)" onClick={() => setFolder('care')} />
                <Item icon={Hand} label="Play" color="hsl(21 73% 69%)" onClick={() => setFolder('play')} />
                <Item icon={Compass} label="Explore" color="hsl(199 56% 64%)" onClick={() => setFolder('explore')} />
              </>
            )}

            {folder === 'care' && (
              <>
                {needs && (
                  <div className="px-1 pb-1 space-y-1">
                    {Object.entries(needs).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
                      <NeedBar key={k} label={k.replace(/_/g, ' ')} value={v} />
                    ))}
                  </div>
                )}
                <Item icon={Apple} label="Food" color="hsl(120 40% 58%)" onClick={() => setFolder('food')} />
                <Item icon={Droplets} label="Water" color="hsl(199 56% 64%)" onClick={() => act('water', 'bucket')} />
                <Item icon={Moon} label="Rest" color="hsl(265 41% 64%)" onClick={() => act('rest', null)} />
              </>
            )}

            {folder === 'food' && FOODS.map(f => (
              <Item key={f.id} emoji={f.emoji} label={f.label} onClick={() => act('feed', f.id)} />
            ))}

            {folder === 'play' && TOYS.map(t => (
              <Item key={t.id} emoji={t.emoji} label={t.label} onClick={() => act('play', t.id)} />
            ))}

            {folder === 'explore' && (
              <>
                <Item icon={Sprout} label="Garden" color="hsl(120 40% 58%)" to="/garden" />
                <Item icon={Palette} label="Store" color="hsl(42 63% 55%)" to="/settings" />
                <Item icon={MessageCircle} label="Talk to Bison" color="hsl(42 63% 55%)" to="/bison" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setFolder(folder ? null : 'root')}
        whileTap={{ scale: 0.92 }}
        className="px-4 py-2 rounded-full border border-white/15 flex items-center gap-2 no-tap-highlight touch-target"
        style={{ background: 'hsl(268 14% 10% / 0.7)', backdropFilter: 'blur(8px)' }}
      >
        <Hand className="w-3.5 h-3.5 text-gold" />
        <span className="text-xs font-medium text-white/90">{folder ? 'Close' : 'Interact'}</span>
      </motion.button>
    </div>
  );
}