import { motion } from 'framer-motion';
import { generateMap } from '@/lib/bison/continuity/proceduralMapGenerator';

const SIZE = 15;
const CENTER = Math.floor(SIZE / 2);
const CELL_COLORS = ['hsl(268 10% 22%)', 'hsl(120 40% 58%)'];

export default function FogOfWarMap({ mapState, seed, algorithm }) {
  const grid = generateMap({ algorithm, seed, mapSize: SIZE });
  return (
    <div className="glass rounded-xl p-4">
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}>
        {grid.map((row, y) => row.map((value, x) => {
          const distance = Math.abs(x - CENTER) + Math.abs(y - CENTER);
          const revealed = distance <= mapState.currentRadius;
          const isUser = x === CENTER && y === CENTER;
          return (
            <motion.div
              key={`${x}_${y}`}
              className="aspect-square rounded-[2px]"
              animate={{
                opacity: revealed ? 1 : 0.12,
                backgroundColor: isUser ? 'hsl(42 63% 55%)'
                  : revealed
                    ? (typeof value === 'number' && value < 1 ? `hsl(199 56% ${25 + value * 35}%)` : CELL_COLORS[value] || CELL_COLORS[0])
                    : 'hsl(268 14% 12%)',
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          );
        }))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Fog of War · Radius Level {mapState.currentRadius}</span>
        <span>{mapState.visibleVariables} variables understandable</span>
      </div>
    </div>
  );
}