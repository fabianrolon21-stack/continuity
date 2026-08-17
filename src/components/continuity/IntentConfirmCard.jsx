import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// §5 — WHAT USER SAID is separated from WHAT BISON THINKS USER MEANT,
// and nothing is recorded until the user confirms or corrects it.
export default function IntentConfirmCard({ rawInput, interpretation, onConfirm }) {
  const [correcting, setCorrecting] = useState(false);
  const [corrected, setCorrected] = useState('');
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">You said</p>
        <p className="mt-1 text-sm">“{rawInput}”</p>
      </div>
      <div>
        <p className="text-[10px] font-medium text-sky-accent uppercase tracking-wide">Bison interprets this as</p>
        <p className="mt-1 text-sm text-muted-foreground">“{interpretation}”</p>
      </div>
      {!correcting ? (
        <div className="flex gap-2">
          <Button onClick={() => onConfirm(true)} className="flex-1 text-xs">Yes, that's right</Button>
          <Button onClick={() => setCorrecting(true)} variant="outline" className="flex-1 border-border text-xs">No, correct it</Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea value={corrected} onChange={event => setCorrected(event.target.value)} placeholder="What did you actually mean?" rows={2} className="bg-secondary/40 border-border text-sm" />
          <Button onClick={() => corrected.trim() && onConfirm(false, corrected.trim())} className="w-full text-xs">Use my correction</Button>
        </div>
      )}
    </div>
  );
}