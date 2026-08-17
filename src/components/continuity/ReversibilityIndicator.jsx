const STEPS = { high: 4, medium: 3, low: 2, irreversible: 1 };

// §14 — reversibility as a first-class visual property.
export default function ReversibilityIndicator({ reversibility }) {
  const steps = STEPS[reversibility] ?? 3;
  const irreversible = reversibility === 'irreversible';
  return (
    <div>
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3].map(index => (
          <span key={index} className="h-1.5 flex-1 rounded-full" style={{ background: index < steps ? (irreversible ? 'hsl(0 70% 50%)' : 'hsl(120 40% 58%)') : 'hsl(268 8% 22%)' }} />
        ))}
      </div>
      <p className={`mt-1 text-[10px] ${irreversible ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
        {irreversible ? 'This branch has irreversible consequences — inspect them before choosing.' : `Reversibility: ${reversibility}`}
      </p>
    </div>
  );
}