import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { generateWellbeingNarrative, computeResilienceScore } from '@/lib/bison/wellbeing/narrativeEngine';
import { generateForecast } from '@/lib/bison/wellbeing/forecastEngine';
import { computeCorrelations } from '@/lib/bison/wellbeing/correlationEngine';
import { computeEffectivenessScores } from '@/lib/bison/wellbeing/outcomeCalibrationEngine';
import { EmptyState } from '@/components/MicroAnimations';
import { Loader2, BookOpen, TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Sparkles, Shield } from 'lucide-react';

const SECTION_ICONS = {
  overview: Shield,
  improving: TrendingUp,
  declining: TrendingDown,
  patterns: Sparkles,
  effective: Target,
  risk: AlertTriangle,
  focus: BookOpen,
};

const SECTION_COLORS = {
  overview: 'hsl(42 63% 55%)',
  improving: 'hsl(120 40% 58%)',
  declining: 'hsl(0 70% 50%)',
  patterns: 'hsl(265 41% 64%)',
  effective: 'hsl(120 40% 58%)',
  risk: 'hsl(21 73% 69%)',
  focus: 'hsl(48 67% 74%)',
};

export default function WellbeingNarrativePanel() {
  const [narrative, setNarrative] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [checkIns, interventions] = await Promise.all([
        base44.entities.CheckIn.list('-date', 30),
        base44.entities.WellbeingIntervention.list('-created_date', 50),
      ]);
      const forecast = generateForecast(checkIns);
      const correlations = computeCorrelations(checkIns);
      const effectivenessScores = computeEffectivenessScores(interventions || [], checkIns || []);
      const result = generateWellbeingNarrative(checkIns, forecast, correlations, interventions, effectivenessScores);
      setNarrative(result);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-gold animate-spin" /></div>;
  }

  if (!narrative?.sufficient) {
    return <EmptyState icon={BookOpen} title="Not enough data for a narrative" subtitle="Log a few more check-ins and your weekly wellbeing story will appear here." />;
  }

  return (
    <div className="space-y-4">
      {/* Resilience Score Header */}
      <div className="glass rounded-xl p-5 flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke={narrative.resilienceColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28 * (narrative.resilienceScore / 100)} ${2 * Math.PI * 28}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold" style={{ color: narrative.resilienceColor }}>{narrative.resilienceScore}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Resilience</p>
          <p className="text-lg font-heading font-bold" style={{ color: narrative.resilienceColor }}>{narrative.resilienceLabel}</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">{narrative.dataPoints} check-ins analyzed</p>
        </div>
      </div>

      {/* Narrative Sections */}
      <div className="space-y-3">
        {narrative.sections.map((section, i) => {
          const Icon = SECTION_ICONS[section.type] || BookOpen;
          const color = SECTION_COLORS[section.type] || 'hsl(var(--muted-foreground))';
          return (
            <div key={i} className="glass rounded-xl p-4 flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  {section.type === 'overview' ? 'Overview' :
                   section.type === 'improving' ? 'Trending Up' :
                   section.type === 'declining' ? 'Trending Down' :
                   section.type === 'patterns' ? 'Patterns Found' :
                   section.type === 'effective' ? 'What Worked' :
                   section.type === 'risk' ? 'Watch For' :
                   section.type === 'focus' ? 'Suggested Focus' : section.type}
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed">{section.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/50 text-center">
        This narrative is assembled from your own check-in data — not generated by AI. Resilience is a directional indicator, not a diagnostic.
      </p>
    </div>
  );
}