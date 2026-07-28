import { useState } from 'react';
import { Lightbulb, ChevronDown, Check, X } from 'lucide-react';

export default function ProposalInbox({ proposals, accent, onDecide }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Improvement Proposals</h3>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Nothing self-executes</span>
      </div>

      {proposals.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bison has not drafted any proposals yet.</p>
      ) : (
        <div className="space-y-2">
          {proposals.map(p => (
            <div key={p.id} className="border border-border/50 rounded-lg p-3">
              <button onClick={() => setOpen(open === p.id ? null : p.id)} className="w-full flex items-start justify-between gap-2 text-left">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.summary}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === 'auto_rejected' ? 'bg-destructive/15 text-destructive' : p.status === 'approved' ? 'bg-leaf/15 text-leaf' : p.status === 'rejected' ? 'bg-secondary text-muted-foreground' : 'bg-gold/15 text-gold'}`}>{p.status.replace(/_/g, ' ')}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open === p.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {open === p.id && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  {p.rejection_reason && <p className="text-xs text-destructive mb-2">{p.rejection_reason}</p>}
                  <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{p.full_spec}</pre>
                  {p.status === 'submitted' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => onDecide(p, 'approved')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-leaf/15 text-leaf">
                        <Check className="w-3 h-3" />Approve
                      </button>
                      <button onClick={() => onDecide(p, 'rejected')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground">
                        <X className="w-3 h-3" />Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}