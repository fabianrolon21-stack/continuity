import { useState } from 'react';
import { transitionMemoryState, correctMemory, VERIFICATION_STATES } from '@/lib/bison/memory/memoryVerification';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Pencil, Archive as ArchiveIcon, History, RotateCcw } from 'lucide-react';

const STATE_STYLES = {
  OBSERVED: 'bg-sky-accent/15 text-sky-accent',
  USER_CONFIRMED: 'bg-leaf/15 text-leaf',
  CORRECTED: 'bg-gold/15 text-gold',
  CONTRADICTED: 'bg-destructive/15 text-destructive',
  ARCHIVED: 'bg-secondary text-muted-foreground',
};

export default function MemoryVerificationCard({ memory, onUpdated }) {
  const [showHistory, setShowHistory] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [correction, setCorrection] = useState('');
  const [busy, setBusy] = useState(false);

  const state = memory.verification_state || 'OBSERVED';

  const doTransition = async (toState, reason) => {
    setBusy(true);
    try {
      const updated = await transitionMemoryState(memory, toState, reason);
      onUpdated(updated);
    } catch (e) {}
    setBusy(false);
  };

  const doCorrect = async () => {
    if (!correction.trim()) return;
    setBusy(true);
    try {
      const updated = await correctMemory(memory, correction.trim(), 'User corrected this memory.');
      onUpdated(updated);
      setCorrecting(false);
      setCorrection('');
    } catch (e) {}
    setBusy(false);
  };

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-sm ${state === 'CONTRADICTED' || state === 'ARCHIVED' ? 'line-through text-muted-foreground' : ''}`}>{memory.text}</p>
          {memory.corrected_text && (
            <p className="text-sm text-gold mt-1">Corrected: {memory.corrected_text}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
            <span className={`px-2 py-0.5 rounded-full font-medium ${STATE_STYLES[state]}`}>{state}</span>
            {memory.confidence && <span className="text-muted-foreground">confidence: {memory.confidence}</span>}
            {memory.is_compressed && <span className="px-2 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent">compressed</span>}
            {memory.origin && <span className="text-muted-foreground truncate max-w-[240px]">{memory.origin}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {state !== 'USER_CONFIRMED' && state !== 'ARCHIVED' && (
          <Button disabled={busy} onClick={() => doTransition(VERIFICATION_STATES.USER_CONFIRMED, 'User explicitly confirmed this memory.')} variant="outline" className="border-border text-xs h-7">
            <CheckCircle className="w-3 h-3 mr-1 text-leaf" /> Confirm
          </Button>
        )}
        {state !== 'ARCHIVED' && (
          <Button disabled={busy} onClick={() => setCorrecting(!correcting)} variant="outline" className="border-border text-xs h-7">
            <Pencil className="w-3 h-3 mr-1 text-gold" /> Correct
          </Button>
        )}
        {state !== 'ARCHIVED' ? (
          <Button disabled={busy} onClick={() => doTransition(VERIFICATION_STATES.ARCHIVED, 'User archived this memory.')} variant="outline" className="border-border text-xs h-7">
            <ArchiveIcon className="w-3 h-3 mr-1 text-muted-foreground" /> Archive
          </Button>
        ) : (
          <Button disabled={busy} onClick={() => doTransition(VERIFICATION_STATES.OBSERVED, 'User restored this memory from archive.')} variant="outline" className="border-border text-xs h-7">
            <RotateCcw className="w-3 h-3 mr-1" /> Restore
          </Button>
        )}
        {(memory.verification_history || []).length > 0 && (
          <button onClick={() => setShowHistory(!showHistory)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
            <History className="w-3 h-3" /> {showHistory ? 'Hide' : 'Show'} history ({memory.verification_history.length})
          </button>
        )}
      </div>

      {correcting && (
        <div className="mt-3 space-y-2">
          <Textarea value={correction} onChange={e => setCorrection(e.target.value)} rows={2} placeholder="What is the accurate version?" className="bg-secondary/50 text-sm" />
          <Button onClick={doCorrect} disabled={!correction.trim() || busy} className="text-xs h-7 bg-gold text-background hover:bg-gold/90">Save Correction</Button>
        </div>
      )}

      {showHistory && (
        <div className="mt-3 space-y-1 border-t border-border/50 pt-2">
          {memory.verification_history.map((h, i) => (
            <p key={i} className="text-[10px] text-muted-foreground">
              {new Date(h.timestamp).toLocaleString()} — {h.from_state} → {h.to_state}: {h.reason}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}