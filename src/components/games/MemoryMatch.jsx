import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Flower2, TreePine, Feather, Shell, Gem, Moon, Sun } from 'lucide-react';

// Phase 6 — a quiet card game played with the sanctuary's own symbols.
// No timers, no failure state; just pairs, turns, and a gentle finish.

const SYMBOLS = [
  { id: 'sprout', Icon: Sprout, color: 'hsl(120 40% 58%)' },
  { id: 'flower', Icon: Flower2, color: 'hsl(21 73% 69%)' },
  { id: 'pine', Icon: TreePine, color: 'hsl(120 30% 45%)' },
  { id: 'feather', Icon: Feather, color: 'hsl(199 56% 64%)' },
  { id: 'shell', Icon: Shell, color: 'hsl(48 67% 74%)' },
  { id: 'gem', Icon: Gem, color: 'hsl(265 41% 64%)' },
  { id: 'moon', Icon: Moon, color: 'hsl(230 40% 70%)' },
  { id: 'sun', Icon: Sun, color: 'hsl(42 63% 55%)' },
];

function buildDeck(pairCount) {
  const chosen = SYMBOLS.slice(0, pairCount);
  const deck = [...chosen, ...chosen].map((s, i) => ({ ...s, key: `${s.id}-${i}` }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MemoryMatch({ pairCount = 6, onComplete }) {
  const [deck, setDeck] = useState(() => buildDeck(pairCount));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const done = matched.length === deck.length && deck.length > 0;

  useEffect(() => {
    if (flipped.length !== 2) return;
    setLocked(true);
    setMoves(m => m + 1);
    const [a, b] = flipped;
    const isPair = deck[a].id === deck[b].id;
    const t = setTimeout(() => {
      if (isPair) setMatched(prev => [...prev, a, b]);
      setFlipped([]);
      setLocked(false);
    }, isPair ? 480 : 900);
    return () => clearTimeout(t);
  }, [flipped, deck]);

  useEffect(() => {
    if (done) onComplete?.(moves);
  }, [done]);

  const reset = () => {
    setDeck(buildDeck(pairCount));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLocked(false);
  };

  const flip = (i) => {
    if (locked || flipped.includes(i) || matched.includes(i)) return;
    setFlipped(prev => [...prev, i]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">Moves: <span className="text-gold font-medium">{moves}</span></p>
        <button onClick={reset} className="text-xs text-muted-foreground hover:text-gold transition-colors">Shuffle</button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {deck.map((card, i) => {
          const open = flipped.includes(i) || matched.includes(i);
          const { Icon } = card;
          return (
            <motion.button
              key={card.key}
              onClick={() => flip(i)}
              whileTap={{ scale: 0.94 }}
              animate={{ rotateY: open ? 180 : 0, opacity: matched.includes(i) ? 0.55 : 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="aspect-square rounded-xl flex items-center justify-center framed no-tap-highlight"
              style={{ background: open ? 'hsl(268 14% 18%)' : 'hsl(268 10% 14%)' }}
            >
              <div style={{ transform: 'rotateY(180deg)' }}>
                {open
                  ? <Icon className="w-6 h-6" style={{ color: card.color }} />
                  : <span className="block w-2 h-2 rounded-full bg-white/15" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {done && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-center text-leaf mt-4"
        >
          All pairs found in {moves} moves.
        </motion.p>
      )}
    </div>
  );
}