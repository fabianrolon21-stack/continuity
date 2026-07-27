import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { generateInterventions } from '@/lib/bison/wellbeing/interventionEngine';
import { generateForecast } from '@/lib/bison/wellbeing/forecastEngine';
import { computeCorrelations } from '@/lib/bison/wellbeing/correlationEngine';
import { computeEffectivenessScores } from '@/lib/bison/wellbeing/outcomeCalibrationEngine';
import { EmptyState } from '@/components/MicroAnimations';
import { Loader2, Sparkles, Check, X, Clock, Zap, Leaf, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const EFFORT_STYLES = {
  low: { color: 'hsl(120 40% 58%)', icon: Leaf, label: 'Low effort' },
  medium: { color: 'hsl(42 63% 55%)', icon: Clock, label: 'Medium effort' },
  high: { color: 'hsl(0 70% 50%)', icon: Zap, label: 'High effort' },
};

const VERDICT_STYLES = {
  effective: { color: 'hsl(120 40% 58%)', icon: TrendingUp, label: 'Working for you' },
  neutral: { color: 'hsl(48 67% 74%)', icon: Minus, label: 'Neutral so far' },
  ineffective: { color: 'hsl(0 70% 50%)', icon: TrendingDown, label: 'Not helping' },
};

export default function InterventionSuggestionsPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [existing, setExisting] = useState([]);
  const [effectivenessScores, setEffectivenessScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [checkIns, existingIvs] = await Promise.all([
        base44.entities.CheckIn.list('-date', 60),
        base44.entities.WellbeingIntervention.list('-created_date', 50),
      ]);
      setExisting(existingIvs || []);
      const scores = computeEffectivenessScores(existingIvs || [], checkIns || []);
      setEffectivenessScores(scores);
      const forecast = generateForecast(checkIns);
      const correlations = computeCorrelations(checkIns);
      const result = generateInterventions(forecast, correlations, checkIns, [], scores);
      setSuggestions(result.interventions || []);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const getStatus = (interventionId) => {
    const match = existing.find(e => e.intervention_id === interventionId);
    return match?.status || null;
  };

  const getEffectiveness = (interventionId) => {
    return effectivenessScores[interventionId] || null;
  };

  const handleRespond = async (suggestion, status) => {
    setActing(suggestion.intervention_id);
    try {
      const existingRecord = existing.find(e => e.intervention_id === suggestion.intervention_id);
      if (existingRecord) {
        await base44.entities.WellbeingIntervention.update(existingRecord.id, {
          status,
          outcome_note: status === 'accepted' ? 'User accepted this suggestion.' : 'User declined this suggestion.',
        });
      } else {
        await base44.entities.WellbeingIntervention.create({
          ...suggestion,
          status,
          outcome_note: status === 'accepted' ? 'User accepted this suggestion.' : 'User declined this suggestion.',
        });
      }
      setExisting(prev => {
        const idx = prev.findIndex(e => e.intervention_id === suggestion.intervention_id);
        const updated = { ...(idx >= 0 ? prev[idx] : suggestion), status };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
    } catch (e) {}
    setActing(null);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-peach animate-spin" /></div>;
  }

  if (suggestions.length === 0) {
    return <EmptyState icon={Sparkles} title="No interventions suggested" subtitle="Your data looks stable. Keep logging check-ins for personalized suggestions." />;
  }

  return (
    <div className="space-y-3">
      {suggestions.map((s, i) => {
        const status = getStatus(s.intervention_id);
        const effort = EFFORT_STYLES[s.estimated_effort] || EFFORT_STYLES.low;
        const EffortIcon = effort.icon;
        return (
          <div key={i} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-peach shrink-0" />
                <h4 className="text-sm font-medium">{s.title}</h4>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <EffortIcon className="w-3 h-3" style={{ color: effort.color }} />
                {effort.label}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-2">{s.description}</p>

            <div className="flex items-start gap-1.5 mb-3">
              <Sparkles className="w-3 h-3 text-peach/60 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground/80 italic">{s.trigger_reason}</p>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {s.target_metrics.map(m => (
                <span key={m} className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                  → {m.replace(/_/g, ' ')}
                </span>
              ))}
            </div>

            {(() => {
              const eff = getEffectiveness(s.intervention_id);
              if (!eff) return null;
              const style = VERDICT_STYLES[eff.verdict] || VERDICT_STYLES.neutral;
              const EffIcon = style.icon;
              return (
                <div className="flex items-center gap-1.5 mb-3 text-[10px]" style={{ color: style.color }}>
                  <EffIcon className="w-3 h-3" />
                  <span>{style.label} — {eff.effectivenessScore}/100 ({eff.sampleCount} measurement{eff.sampleCount > 1 ? 's' : ''})</span>
                </div>
              );
            })()}

            {status ? (
              <div className={`flex items-center gap-2 text-xs font-medium ${
                status === 'accepted' ? 'text-leaf' :
                status === 'rejected' ? 'text-muted-foreground' :
                'text-gold'
              }`}>
                {status === 'accepted' && <Check className="w-3.5 h-3.5" />}
                {status === 'rejected' && <X className="w-3.5 h-3.5" />}
                {status === 'accepted' ? 'Accepted' : status === 'rejected' ? 'Declined' : 'Pending'}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(s, 'accepted')}
                  disabled={acting === s.intervention_id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-leaf/15 text-leaf text-xs font-medium hover:bg-leaf/25 transition-colors disabled:opacity-50"
                >
                  <Check className="w-3 h-3" /> I'll try it
                </button>
                <button
                  onClick={() => handleRespond(s, 'rejected')}
                  disabled={acting === s.intervention_id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground text-xs hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  <X className="w-3 h-3" /> Not now
                </button>
              </div>
            )}
          </div>
        );
      })}

      <p className="text-[10px] text-muted-foreground/50 text-center">
        Suggestions are matched to your own data patterns — not generated by AI. You decide what to act on.
      </p>

      {Object.keys(effectivenessScores).length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-leaf" />
            <h5 className="text-xs font-medium text-leaf">What's working for you</h5>
          </div>
          <div className="space-y-1.5">
            {Object.entries(effectivenessScores)
              .sort(([, a], [, b]) => b.effectivenessScore - a.effectivenessScore)
              .map(([id, data]) => {
                const style = VERDICT_STYLES[data.verdict] || VERDICT_STYLES.neutral;
                const EffIcon = style.icon;
                return (
                  <div key={id} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground capitalize">{id.replace(/_/g, ' ')}</span>
                    <span className="flex items-center gap-1" style={{ color: style.color }}>
                      <EffIcon className="w-3 h-3" />
                      {data.effectivenessScore}/100
                    </span>
                  </div>
                );
              })}
          </div>
          <p className="text-[9px] text-muted-foreground/40 mt-2">
            Based on your check-in changes before vs. after accepting each intervention.
          </p>
        </div>
      )}
    </div>
  );
}