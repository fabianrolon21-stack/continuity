import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { generateInterventions } from '@/lib/bison/wellbeing/interventionEngine';
import { generateForecast } from '@/lib/bison/wellbeing/forecastEngine';
import { computeCorrelations } from '@/lib/bison/wellbeing/correlationEngine';
import { EmptyState } from '@/components/MicroAnimations';
import { Loader2, Sparkles, Check, X, Clock, Zap, Leaf, Brain } from 'lucide-react';

const EFFORT_STYLES = {
  low: { color: 'hsl(120 40% 58%)', icon: Leaf, label: 'Low effort' },
  medium: { color: 'hsl(42 63% 55%)', icon: Clock, label: 'Medium effort' },
  high: { color: 'hsl(0 70% 50%)', icon: Zap, label: 'High effort' },
};

export default function InterventionSuggestionsPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [checkIns, existingIvs] = await Promise.all([
        base44.entities.CheckIn.list('-date', 30),
        base44.entities.WellbeingIntervention.list('-created_date', 20),
      ]);
      setExisting(existingIvs || []);
      const forecast = generateForecast(checkIns);
      const correlations = computeCorrelations(checkIns);
      const result = generateInterventions(forecast, correlations, checkIns);
      setSuggestions(result.interventions || []);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const getStatus = (interventionId) => {
    const match = existing.find(e => e.intervention_id === interventionId);
    return match?.status || null;
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
    </div>
  );
}