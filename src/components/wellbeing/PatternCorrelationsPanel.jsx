import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { computeCorrelations, describeCorrelation, METRIC_LABELS } from '@/lib/bison/wellbeing/correlationEngine';
import { EmptyState } from '@/components/MicroAnimations';
import { Loader2, GitCompare, ArrowRight, Clock } from 'lucide-react';

const STRENGTH_STYLES = {
  STRONG: { color: 'hsl(42 63% 55%)', barOpacity: 1 },
  MODERATE: { color: 'hsl(199 56% 64%)', barOpacity: 0.8 },
  WEAK: { color: 'hsl(268 8% 60%)', barOpacity: 0.5 },
};

export default function PatternCorrelationsPanel() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CheckIn.list('-date', 30).then(checkIns => {
      setResult(computeCorrelations(checkIns));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-gold animate-spin" /></div>;
  }

  if (!result || !result.sufficient) {
    return <EmptyState icon={GitCompare} title="Not enough data yet" subtitle={result?.reason || 'Log at least 4 check-ins to unlock pattern analysis.'} />;
  }

  if (result.correlations.length === 0) {
    return <EmptyState icon={GitCompare} title="No significant patterns yet" subtitle="No correlations above the threshold (|r| ≥ 0.3) were found. Keep logging check-ins." />;
  }

  return (
    <div className="space-y-3">
      {result.correlations.map((c, i) => {
        const style = STRENGTH_STYLES[c.strength];
        const barWidth = Math.min(100, Math.abs(c.correlation) * 100);
        const barSide = c.direction === 'positive' ? 'right' : 'left';
        return (
          <div key={i} className="glass rounded-xl p-3">
            {/* Metric pair header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium" style={{ color: style.color }}>{c.labelA}</span>
                {c.lag === 1 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" /> +1d
                  </span>
                )}
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">{c.labelB}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: style.color }}>r={c.correlation}</span>
                <span className="text-[10px] text-muted-foreground">n={c.sampleSize}</span>
              </div>
            </div>

            {/* Correlation bar: center origin, extends left (negative) or right (positive) */}
            <div className="relative h-2 rounded-full bg-secondary/40 overflow-hidden">
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-muted-foreground/30" />
              <div
                className="absolute top-0 bottom-0 rounded-full transition-all"
                style={{
                  [barSide === 'right' ? 'left' : 'right']: '50%',
                  width: `${barWidth / 2}%`,
                  backgroundColor: style.color,
                  opacity: style.barOpacity,
                }}
              />
            </div>

            {/* Human-readable description */}
            <p className="text-xs text-muted-foreground mt-2">
              {describeCorrelation(c)}
            </p>
          </div>
        );
      })}

      <p className="text-[10px] text-muted-foreground/50 text-center">
        Pearson correlations from {result.totalChecked} check-ins. Correlation ≠ causation — these are observed patterns, not causes.
      </p>
    </div>
  );
}