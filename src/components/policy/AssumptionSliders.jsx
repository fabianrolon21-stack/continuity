import { ASSUMPTIONS } from '@/lib/bison/policy/assumptions';

export default function AssumptionSliders({ values, onChange }) {
  return (
    <div className="space-y-3">
      {ASSUMPTIONS.map(a => (
        <div key={a.id}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs">{a.label}</span>
            <span className="text-xs font-mono text-gold">{values[a.id]}</span>
          </div>
          <input
            type="range" min="0" max="100" value={values[a.id]}
            onChange={e => onChange({ ...values, [a.id]: +e.target.value })}
            className="w-full" style={{ accentColor: 'hsl(199 56% 64%)' }}
          />
          <p className="text-[10px] text-muted-foreground leading-tight">{a.note}</p>
        </div>
      ))}
    </div>
  );
}