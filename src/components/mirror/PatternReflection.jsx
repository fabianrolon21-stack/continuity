// §1, §5, §14 — impulse detection and behavioral pattern reflection.
// Evaluates behavior, never identity.
export default function PatternReflection({ egoThreat, patterns, trying }) {
  if (!egoThreat.threatDetected && !patterns.length && !trying) return null;
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <p className="text-xs font-medium text-peach">Behavioral mirror</p>
      {egoThreat.threatDetected && (
        <div className="text-[11px]">
          <p className="text-muted-foreground">Defensive impulse detected (not generated): <span className="text-peach font-medium">{egoThreat.defensiveImpulse.replaceAll('_', ' ')}</span></p>
          <p className="mt-0.5 text-muted-foreground/80">{egoThreat.triggerReason}</p>
        </div>
      )}
      {patterns.map(pattern => (
        <div key={pattern.id} className="rounded-lg bg-secondary/30 p-2.5 text-[11px]">
          <p className="font-medium text-foreground/90">{pattern.category.replaceAll('_', ' ')} · severity {Math.round(pattern.severity * 100)}</p>
          <p className="mt-0.5 text-muted-foreground">{pattern.reflection}</p>
        </div>
      ))}
      {trying && (
        <div className="text-[11px]">
          <p className={trying.grounded ? 'text-leaf' : 'text-gold'}>
            {trying.grounded ? 'Grounded trying — the action stands on its own.' : 'Outcome-dependent trying — this action depends on a specific reaction from someone else.'}
          </p>
          <p className="mt-0.5 text-muted-foreground">Motivation: {trying.motivation.toLowerCase()} · outcome dependency {Math.round(trying.outcomeDependency * 100)}% · pressure {Math.round(trying.pressureLevel * 100)}%</p>
        </div>
      )}
    </div>
  );
}