import { NUTRITION_LABELS } from '@/lib/bison/privacy/nutritionLabels';

export default function NutritionLabelList() {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="font-heading font-semibold text-sm mb-1">Data Nutrition Labels</h3>
      <p className="text-xs text-muted-foreground mb-4">What each feature needs, and what happens to it.</p>
      <div className="space-y-3">
        {NUTRITION_LABELS.map(l => (
          <div key={l.channel} className="p-3 rounded-lg bg-secondary/30">
            <p className="text-sm font-medium mb-1">{l.feature}</p>
            <p className="text-xs text-muted-foreground">Requires: <span className="text-foreground/80">{l.needs}</span></p>
            <p className="text-xs text-muted-foreground">Why: {l.why}</p>
            <div className="flex gap-3 mt-1.5">
              <span className={`text-[10px] ${l.stored ? 'text-gold' : 'text-leaf'}`}>{l.stored ? 'Stored locally' : 'Never stored'}</span>
              <span className={`text-[10px] ${l.shared ? 'text-gold' : 'text-leaf'}`}>{l.shared ? 'Shared (anonymous)' : 'Never shared'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}