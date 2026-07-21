import { TrendingUp, TrendingDown, Minus, Brain, Activity, Tag, Users, Scale, Lightbulb } from 'lucide-react';

export default function CognitiveInsights({ context }) {
  if (!context) return null;

  const TrendIcon = context.wellbeing?.moodTrend === 'improving' ? TrendingUp
    : context.wellbeing?.moodTrend === 'declining' ? TrendingDown : Minus;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-sm text-purple-accent">Cognitive Insights</h3>
        <Brain className="w-4 h-4 text-purple-accent/50" />
      </div>

      <div className="space-y-4">
        {context.wellbeing && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="w-3.5 h-3.5" /> Mood trend
            </span>
            <span className="flex items-center gap-1 font-medium capitalize">
              <TrendIcon className="w-3.5 h-3.5" style={{
                color: context.wellbeing.moodTrend === 'improving' ? 'hsl(120 40% 58%)'
                  : context.wellbeing.moodTrend === 'declining' ? 'hsl(0 70% 55%)'
                  : 'hsl(48 67% 74%)'
              }} />
              {context.wellbeing.moodTrend}
            </span>
          </div>
        )}

        {context.journal?.topTags?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Recurring themes
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {context.journal.topTags.slice(0, 5).map(([tag, count]) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent">
                  {tag} ({count})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          {context.relationships && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {context.relationships.total} relationships
            </div>
          )}
          {context.philosophy && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lightbulb className="w-3 h-3" />
              {context.philosophy.total} philosophies
            </div>
          )}
          {context.ethics && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Scale className="w-3 h-3" />
              {context.ethics.totalAssessments} ethics
            </div>
          )}
          {context.insights && context.insights.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Brain className="w-3 h-3" />
              {context.insights.length} insights
            </div>
          )}
        </div>

        {context.summary && (
          <div className="flex gap-3 text-[10px] text-muted-foreground/70 pt-1">
            <span>{context.summary.totalCheckins} check-ins</span>
            <span>·</span>
            <span>{context.summary.totalJournals} journals</span>
            <span>·</span>
            <span>{context.summary.totalMemories} memories</span>
          </div>
        )}
      </div>
    </div>
  );
}