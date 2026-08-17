import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { terrainShapes } from '@/lib/bison/continuity/fogOfWarMapEngine';
import BisonMapMarker from '@/components/continuity/BisonMapMarker';

const CATEGORY_COLORS = { known: 'hsl(120 40% 58%)', inferred: 'hsl(199 56% 64%)', speculative: 'hsl(42 63% 55%)', unknown: 'hsl(0 40% 55%)' };
const IDLE_STATES = ['idle', 'observing', 'uncertain'];

// §6–7, §15–17 — rendered SVG terrain, fog layers, epistemic nodes, and a
// living Bison that keeps acting on the map without user interaction.
export default function FogOfWarMap({ mapState, closing = false, onNodeTap }) {
  const [bisonState, setBisonState] = useState('idle');
  const [focus, setFocus] = useState(null);
  const explored = mapState.nodes.filter(node => node.explored);

  // §16–18 — idle life at a modest update rate, paused when tab is hidden.
  useEffect(() => {
    if (closing) { setBisonState('walking_away'); return; }
    const wander = () => {
      if (document.visibilityState !== 'visible') return;
      const next = IDLE_STATES[Math.floor(Math.random() * IDLE_STATES.length)];
      const target = explored[Math.floor(Math.random() * explored.length)];
      if (target && Math.random() > 0.5) { setBisonState('thinking'); setFocus(target); } else { setBisonState(next); setFocus(null); }
    };
    const timer = setInterval(wander, 6000);
    return () => clearInterval(timer);
  }, [closing, explored.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!closing && mapState.exploredTiles.length) { setBisonState('discovering'); setFocus(explored[explored.length - 1] || null); }
  }, [mapState.exploredTiles.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div className="glass rounded-xl p-3 relative overflow-hidden" animate={{ opacity: closing ? 0.35 : 1 }} transition={{ duration: 3, ease: 'easeInOut' }}>
      <svg viewBox="0 0 320 220" className="w-full">
        <rect width="320" height="220" rx="8" fill="hsl(268 14% 9%)" />
        {/* terrain */}
        {terrainShapes(mapState.seed).map(shape => (
          <ellipse key={shape.id} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill={`hsl(${shape.hue} 40% 40% / 0.09)`} />
        ))}
        {/* branch connections */}
        {explored.map(node => (
          <motion.line key={`path_${node.id}`} x1="160" y1="110" x2={node.x} y2={node.y} stroke="hsl(42 63% 55% / 0.25)" strokeWidth="1" strokeDasharray="3 3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
        ))}
        {/* nodes */}
        {mapState.nodes.map(node => (
          <g key={node.id} onClick={() => node.explored && onNodeTap?.(node)} style={{ cursor: node.explored ? 'pointer' : 'default' }}>
            <motion.circle cx={node.x} cy={node.y} r={node.explored ? 6 : 4} fill={CATEGORY_COLORS[node.category]} animate={{ opacity: node.explored ? 0.95 : 0.18, scale: node.explored ? 1 : 0.8 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
            {node.category === 'unknown' && node.explored && <circle cx={node.x} cy={node.y} r="9" fill="none" stroke={CATEGORY_COLORS.unknown} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />}
            {node.explored && <text x={node.x} y={node.y + 15} textAnchor="middle" fontSize="6.5" fill="hsl(40 20% 92% / 0.65)">{node.label.slice(0, 22)}</text>}
          </g>
        ))}
        <BisonMapMarker x={160} y={110} state={bisonState} targetX={focus?.x} targetY={focus?.y} />
      </svg>
      {/* fog layers — animate away as nodes reveal; the fog never fully leaves */}
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: closing ? 0.9 : mapState.fogLevel }} transition={{ duration: 2.5, ease: 'easeInOut' }} style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 22%, hsl(268 16% 8% / 0.9) 78%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, hsl(268 16% 8% / 0.55) 100%)' }} />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground relative">
        <div className="flex gap-3">{Object.entries(CATEGORY_COLORS).map(([category, color]) => <span key={category} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: color }} />{category}</span>)}</div>
        <span>Level {mapState.currentRadius} · {mapState.visibleVariables} of {mapState.nodes.length} nodes revealed</span>
      </div>
    </motion.div>
  );
}