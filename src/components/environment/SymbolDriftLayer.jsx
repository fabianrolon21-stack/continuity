import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sprout, Flower2, Droplet, Sun, Moon, Star, PawPrint, Mountain, Compass, Nut, TreePine } from 'lucide-react';

// Nintendo-style drifting symbol background — tiny,
// low-contrast Continuity symbols that slowly drift
// and fade behind every screen. Texture, not attention.

const SYMBOLS = [Leaf, Sprout, Flower2, Droplet, Sun, Moon, Star, PawPrint, Mountain, Compass, Nut, TreePine];

export default function SymbolDriftLayer({ disabled = false, reduceMotion = false }) {
  const items = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      Icon: SYMBOLS[i % SYMBOLS.length],
      left: ((i * 37 + 13) % 97) + 1,
      top: ((i * 53 + 29) % 93) + 2,
      size: 12 + (i % 3) * 4,
      duration: 18 + (i % 5) * 6,
      delay: (i % 7) * 2.5,
      drift: i % 2 ? 14 : -14,
    }));
  }, []);

  if (disabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {items.map((item, i) => {
        const { Icon } = item;
        if (reduceMotion) {
          return (
            <Icon
              key={i}
              className="absolute text-foreground"
              style={{ left: `${item.left}%`, top: `${item.top}%`, width: item.size, height: item.size, opacity: 0.04 }}
            />
          );
        }
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${item.left}%`, top: `${item.top}%` }}
            animate={{
              y: [0, item.drift, 0],
              x: [0, item.drift / 2, 0],
              opacity: [0, 0.06, 0.06, 0],
              rotate: [0, item.drift],
            }}
            transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
          >
            <Icon className="text-foreground" style={{ width: item.size, height: item.size }} />
          </motion.div>
        );
      })}
    </div>
  );
}