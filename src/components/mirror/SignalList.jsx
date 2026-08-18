// §2 — user-stated vs Bison-inferred signals never share epistemic status.
export default function SignalList({ signals }) {
  if (!signals.length) return null;
  return (
    <div className="glass rounded-xl p-4">
      <p className="mb-2 text-xs font-medium text-gold">Emotional signals — data, not commands</p>
      <div className="space-y-2">
        {signals.map(signal => (
          <div key={signal.signal} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              {signal.signal}
              <span className={`rounded-full px-2 py-0.5 text-[9px] ${signal.userStated ? 'bg-leaf/15 text-leaf' : 'bg-purple-accent/15 text-purple-accent'}`}>
                {signal.userStated ? 'YOU SAID' : 'BISON INFERRED — might be'}
              </span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden"><span className="block h-full bg-gold" style={{ width: `${signal.intensity * 100}%` }} /></span>
              {Math.round(signal.confidence * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}