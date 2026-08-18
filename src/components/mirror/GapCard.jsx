import { formatDelay } from '@/lib/bison/introspection/impulseLatencyEngine';
import ReversibilityIndicator from '@/components/continuity/ReversibilityIndicator';

// §3–4 — the gap between what I feel and what I'm about to do.
export default function GapCard({ gap, latency }) {
  if (!gap.immediateImpulse) return null;
  return (
    <div className="glass rounded-xl p-4 space-y-2 border border-gold/25">
      <p className="text-xs font-medium text-gold">Emotion → Action gap</p>
      <div className="text-xs space-y-1.5">
        <p><span className="text-muted-foreground">Feeling:</span> {gap.emotion}</p>
        <p><span className="text-muted-foreground">Immediate impulse:</span> “{gap.immediateImpulse}”</p>
        <p><span className="text-muted-foreground">Alternative:</span> {gap.alternativeAction}</p>
      </div>
      <ReversibilityIndicator reversibility={gap.reversibility} />
      {latency.recommendedDelaySeconds > 0 ? (
        <div className="rounded-lg bg-gold/10 p-2.5 text-[11px]">
          <p className="font-medium text-gold">Pause suggested: {formatDelay(latency.recommendedDelaySeconds)}</p>
          <p className="mt-0.5 text-muted-foreground">{latency.reason} You decide — Bison only exposes the gap.</p>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">{latency.reason}</p>
      )}
    </div>
  );
}