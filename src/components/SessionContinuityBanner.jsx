import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { computeSessionGap } from '@/lib/bison/runtime/sessionStateSerializer';
import { Clock, X } from 'lucide-react';

// Shows a subtle welcome-back banner when a previous session is detected.
// Auto-dismisses after 8 seconds or on user close.
export default function SessionContinuityBanner() {
  const [info, setInfo] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    base44.auth.me().then(user => {
      if (!active) return;
      const snapshot = user?.session_state;
      if (!snapshot?.serializedAt) return;
      const gap = computeSessionGap(snapshot);
      if (!gap || gap.minutes < 2) return; // too recent to warrant a banner
      if (gap.days >= 7) return; // stale, treated as fresh start

      let gapText;
      if (gap.days >= 1) gapText = `${gap.days} day${gap.days > 1 ? 's' : ''}`;
      else if (gap.hours >= 1) gapText = `${gap.hours} hour${gap.hours > 1 ? 's' : ''}`;
      else gapText = `${gap.minutes} minute${gap.minutes > 1 ? 's' : ''}`;

      setInfo({ gapText, summary: snapshot.sessionSummary || null });
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  if (!visible || !info) return null;

  return (
    <div className="mx-6 lg:mx-10 mt-2 glass rounded-xl px-4 py-3 flex items-start gap-3 border border-gold/20 animate-slide-up">
      <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">Welcome back — it's been {info.gapText} since your last visit.</p>
        {info.summary && (
          <p className="text-xs text-muted-foreground mt-0.5">{info.summary}</p>
        )}
      </div>
      <button onClick={() => setVisible(false)} className="text-muted-foreground hover:text-foreground shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}