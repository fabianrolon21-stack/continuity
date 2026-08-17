import { Slider } from '@/components/ui/slider';
import { UTILITY_DISCLAIMER } from '@/lib/bison/continuity/decisionStrategyEngine';

// §13 — user-defined priorities drive the utility analysis.
export default function PrioritySliders({ priorities, onChange }) {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <p className="text-xs font-medium text-gold">Your priorities</p>
      {priorities.map(priority => (
        <div key={priority.id} className="flex items-center gap-3">
          <span className="w-20 text-xs text-muted-foreground">{priority.label}</span>
          <Slider value={[priority.weight]} min={0} max={100} step={5} onValueChange={([weight]) => onChange(priorities.map(p => p.id === priority.id ? { ...p, weight } : p))} className="flex-1" />
          <span className="w-8 text-right text-xs">{priority.weight}</span>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground">{UTILITY_DISCLAIMER}</p>
    </div>
  );
}