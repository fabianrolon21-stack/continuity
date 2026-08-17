import { Button } from '@/components/ui/button';

// §9–10 — archived paths remain revisitable historical nodes.
export default function ArchivedBranchList({ branches, onRevisit }) {
  if (!branches.length) return <p className="text-xs text-muted-foreground">Deferred and discarded branches are archived here as revisitable historical nodes — never destroyed.</p>;
  return (
    <div className="space-y-2 max-h-56 overflow-y-auto">
      {branches.map(branch => (
        <div key={branch.id} className="rounded-lg bg-secondary/30 p-3 text-xs">
          <p><span className="text-muted-foreground">Path:</span> {branch.discardedIdea}</p>
          {branch.chosenInstead && <p className="mt-0.5"><span className="text-muted-foreground">Chosen instead:</span> <span className="text-leaf">{branch.chosenInstead}</span></p>}
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground/60">{new Date(branch.timestamp).toLocaleString()} · {branch.status}</span>
            {branch.revisitable && <Button onClick={() => onRevisit(branch)} variant="ghost" className="h-6 px-2 text-[10px] text-sky-accent">Reopen branch</Button>}
          </div>
        </div>
      ))}
    </div>
  );
}