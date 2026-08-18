// §6 — regulation, not purging. Traits are never deleted or zeroed.
export default function TraitRegulationPanel({ traitStates }) {
  const active = traitStates?.filter(state => state.currentActivation > 0 || state.awareness > 20) || [];
  if (!active.length) return null;
  const bar = (value, color) => (
    <span className="h-1.5 w-14 rounded-full bg-secondary overflow-hidden inline-block align-middle"><span className="block h-full" style={{ width: `${value}%`, background: color }} /></span>
  );
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs font-medium text-purple-accent">Trait regulation <span className="text-[9px] text-muted-foreground font-normal">— detected → regulated → not automatically expressed</span></p>
      <div className="mt-2 space-y-2">
        {active.map(state => (
          <div key={state.trait} className="grid grid-cols-4 items-center gap-1 text-[10px] text-muted-foreground">
            <span className="text-foreground/85">{state.trait}</span>
            <span>awareness {bar(state.awareness, 'hsl(199 56% 64%)')}</span>
            <span>regulation {bar(state.regulationSkill, 'hsl(120 40% 58%)')}</span>
            <span>activation {bar(state.currentActivation, 'hsl(42 63% 55%)')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}