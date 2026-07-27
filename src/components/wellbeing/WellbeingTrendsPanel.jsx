import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { generateForecast } from '@/lib/bison/wellbeing/forecastEngine';
import { EmptyState } from '@/components/MicroAnimations';
import { Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle, Activity } from 'lucide-react';

const METRIC_LABELS = {
  mood: 'Mood',
  energy: 'Energy',
  sleep_quality: 'Sleep Quality',
  stress_level: 'Stress',
  focus_level: 'Focus',
  nutrition_quality: 'Nutrition',
};

const TRAJECTORY_STYLES = {
  improving: { color: 'hsl(120 40% 58%)', icon: TrendingUp, label: 'Improving' },
  declining: { color: 'hsl(0 70% 50%)', icon: TrendingDown, label: 'Declining' },
  stable: { color: 'hsl(199 56% 64%)', icon: Minus, label: 'Stable' },
};

const CONFIDENCE_STYLES = {
  HIGH: 'text-leaf',
  MEDIUM: 'text-gold',
  LOW: 'text-muted-foreground',
};

export default function WellbeingTrendsPanel() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    base44.entities.CheckIn.list('-date', 30).then(checkIns => {
      setForecast(generateForecast(checkIns));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-leaf animate-spin" /></div>;
  }

  if (!forecast || !forecast.sufficient) {
    return <EmptyState icon={Activity} title="Not enough data yet" subtitle={forecast?.reason || 'Log at least 3 check-ins to unlock trend analysis.'} />;
  }

  const TrajectoryIcon = TRAJECTORY_STYLES[forecast.trajectory].icon;
  const trajColor = TRAJECTORY_STYLES[forecast.trajectory].color;

  return (
    <div className="space-y-4">
      {/* Trajectory header */}
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${trajColor}20` }}>
            <TrajectoryIcon className="w-5 h-5" style={{ color: trajColor }} />
          </div>
          <div>
            <p className="text-sm font-medium">Overall Trajectory</p>
            <p className="text-xs text-muted-foreground">{forecast.dataPoints} check-ins analyzed</p>
          </div>
        </div>
        <span className="text-sm font-semibold" style={{ color: trajColor }}>{TRAJECTORY_STYLES[forecast.trajectory].label}</span>
      </div>

      {/* Metric projections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(forecast.projections).filter(([_, v]) => v.projected !== null).map(([metric, v]) => {
          const isImproving = metric === 'stress_level' ? v.change < 0 : v.change > 0;
          const arrowIcon = v.change === 0 ? Minus : isImproving ? TrendingUp : TrendingDown;
          const ArrowIcon = arrowIcon;
          const changeColor = v.change === 0 ? 'text-muted-foreground' : isImproving ? 'text-leaf' : 'text-destructive';
          return (
            <div key={metric} className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">{METRIC_LABELS[metric] || metric}</span>
                <span className={`text-[10px] font-medium ${CONFIDENCE_STYLES[v.confidence]}`}>{v.confidence}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{v.current}</span>
                  <ArrowIcon className={`w-3.5 h-3.5 ${changeColor}`} />
                  <span className="text-lg font-semibold text-muted-foreground">{v.projected}</span>
                </div>
                <span className={`text-xs ${changeColor}`}>
                  {v.change > 0 ? '+' : ''}{v.change}
                </span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-secondary/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(v.projected / 10) * 100}%`, backgroundColor: trajColor }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk windows */}
      {forecast.riskWindows?.length > 0 && (
        <div className="glass rounded-xl p-4 border border-peach/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-peach" />
            <p className="text-sm font-medium">Risk Windows</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Days where your historical data shows lower mood or higher stress than your personal average.</p>
          <div className="space-y-2">
            {forecast.riskWindows.slice(0, 3).map(w => (
              <div key={w.day} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2">
                <div>
                  <span className="text-sm font-medium">{w.day}</span>
                  <span className="text-xs text-muted-foreground ml-2">({w.occurrences} check-ins)</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {w.type === 'low_mood'
                    ? <span className="text-destructive">Mood {w.avgMood}/10</span>
                    : <span className="text-peach">Stress {w.avgStress}/10</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/50 text-center">
        These are mathematical extrapolations from your check-in data using linear regression. Not predictions — just patterns.
      </p>
    </div>
  );
}