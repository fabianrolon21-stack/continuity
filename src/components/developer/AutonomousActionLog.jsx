import { Wrench, Undo2 } from 'lucide-react';

export default function AutonomousActionLog({ actions, accent, onRevert }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Wrench className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Autonomous Actions</h3>
      </div>

      {actions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bison has taken no autonomous actions yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {actions.map(a => (
            <div key={a.id} className="text-xs border-b border-border/50 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{a.type.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full ${a.reverted ? 'bg-secondary text-muted-foreground' : a.applied ? 'bg-leaf/15 text-leaf' : 'bg-gold/15 text-gold'}`}>
                    {a.reverted ? 'reverted' : a.applied ? 'applied' : 'suggested'}
                  </span>
                  {a.reversible && a.applied && !a.reverted && (
                    <button onClick={() => onRevert(a)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                      <Undo2 className="w-3 h-3" />revert
                    </button>
                  )}
                </div>
              </div>
              {a.parameter_key && (
                <p className="text-muted-foreground mt-0.5">{a.parameter_key}: {a.old_value} → {a.new_value}</p>
              )}
              <p className="text-muted-foreground/80 mt-0.5">{a.justification}</p>
              <p className="text-muted-foreground/50 mt-0.5">{new Date(a.created_date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}