import { barGraph } from '@/lib/bison/continuity/epistemicBars';

const ROWS = [
  { key: 'known', label: 'KNOWN', color: 'hsl(120 40% 58%)' },
  { key: 'inferred', label: 'INFERRED', color: 'hsl(199 56% 64%)' },
  { key: 'speculative', label: 'SPECULATIVE', color: 'hsl(42 63% 55%)' },
  { key: 'unknown', label: 'UNKNOWN', color: 'hsl(0 70% 55%)' },
];

export default function EpistemicBarsDisplay({ bars }) {
  return (
    <div className="glass rounded-xl p-4 font-mono text-xs space-y-1.5">
      {ROWS.map(row => (
        <div key={row.key} className="flex items-center gap-2">
          <span className="w-24 text-muted-foreground">{row.label}</span>
          <span style={{ color: row.color }}>{barGraph(bars[row.key])}</span>
          <span className="text-foreground/80">{bars[row.key]}%</span>
        </div>
      ))}
    </div>
  );
}