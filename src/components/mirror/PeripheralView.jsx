const STATUS_COLORS = { KNOWN: 'text-leaf', INFERRED: 'text-sky-accent', SPECULATIVE: 'text-gold', UNKNOWN: 'text-destructive' };

// §8, §12 — multiple plausible interpretations; never one invented reality.
export default function PeripheralView({ social, peripheral }) {
  if (!social && !peripheral) return null;
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <p className="text-xs font-medium text-sky-accent">Look left / look right</p>
      {social && (
        <div className="text-[11px] space-y-1.5">
          <p><span className="text-muted-foreground">Observed:</span> {social.event}</p>
          {social.interpretations.map((interpretation, index) => (
            <p key={index} className="text-muted-foreground">
              <span className={`font-medium ${STATUS_COLORS[interpretation.epistemicStatus]}`}>{interpretation.epistemicStatus}</span> — {interpretation.hypothesis}
            </p>
          ))}
          <p className="text-destructive/80"><span className="font-medium">UNKNOWN</span> — {social.unknown}</p>
        </div>
      )}
      {peripheral && (
        <div className="text-[11px] space-y-1">
          <p><span className="text-muted-foreground">Core interpretation:</span> {peripheral.corePath}</p>
          <p><span className="text-sky-accent">Left:</span> {peripheral.leftAlternative}</p>
          <p><span className="text-sky-accent">Right:</span> {peripheral.rightAlternative}</p>
          <p className="text-muted-foreground/80">{peripheral.neglectedVariable}</p>
        </div>
      )}
    </div>
  );
}