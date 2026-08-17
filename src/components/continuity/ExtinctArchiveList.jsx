export default function ExtinctArchiveList({ records }) {
  if (!records.length) return <p className="text-xs text-muted-foreground">No extinct algorithms yet. Discarded paths are archived here for future learning — never deleted, never shared.</p>;
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {records.map((record, index) => (
        <div key={index} className="rounded-lg bg-secondary/30 p-3 text-xs">
          <p><span className="text-muted-foreground">Extinct:</span> <span className="text-destructive/80 line-through">{record.discardedIdea}</span></p>
          <p className="mt-0.5"><span className="text-muted-foreground">Chosen instead:</span> <span className="text-leaf">{record.chosenInstead}</span></p>
          <p className="mt-1 text-[10px] text-muted-foreground/60">{new Date(record.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}