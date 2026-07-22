// ═══════════════════════════════════════════════
// FORECAST PANEL (Package K — Forecast)
// Uses LLM to generate gentle, probabilistic forecasts
// based on accumulated data. Clearly labeled as
// probabilistic, not deterministic.
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildCognitiveContext } from '@/lib/bison/cognitiveContext';
import { TrendingUp, Loader2, Clock } from 'lucide-react';

export default function ForecastPanel() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleForecast = async () => {
    setLoading(true);
    setForecast(null);
    try {
      const context = await buildCognitiveContext();
      const dataSummary = context
        ? `Wellbeing: ${JSON.stringify(context.wellbeingTrends || {})}. ` +
          `Ethics: ${JSON.stringify(context.ethicsOverview || {})}. ` +
          `Philosophy: ${JSON.stringify(context.philosophyOverview || {})}. ` +
          `Journals recent mood avg: ${context.journalOverview?.avgMood || 'unknown'}.`
        : 'Limited data available.';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Forecast engine in Continuity. Based on the user's accumulated data, generate a gentle 3-day forecast of likely emotional/cognitive patterns. Use probabilistic language ("likely", "may", "could"). Never present as certainty. Structure as 3 brief entries (Day 1, Day 2, Day 3), each 1-2 sentences. Focus on patterns, not predictions of specific events.\n\nUser data: ${dataSummary}\n\nForecast:`,
        response_json_schema: {
          type: 'object',
          properties: {
            day1: { type: 'string' },
            day2: { type: 'string' },
            day3: { type: 'string' },
            pattern_note: { type: 'string' }
          }
        }
      });

      setForecast(result);
    } catch (e) {
      setForecast({ day1: 'Unable to generate forecast right now.', day2: '', day3: '', pattern_note: '' });
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-leaf" />
        <h3 className="font-heading font-semibold text-sm text-leaf">Forecast</h3>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Probabilistic patterns based on your data. Not predictions — just gentle possibilities.
      </p>

      {!forecast && !loading && (
        <button
          onClick={handleForecast}
          className="w-full py-2.5 rounded-lg bg-leaf/15 text-leaf text-sm font-medium hover:bg-leaf/25 transition-colors"
        >
          Generate Forecast
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-6 gap-2">
          <Loader2 className="w-4 h-4 text-leaf animate-spin" />
          <span className="text-xs text-muted-foreground">Reading patterns...</span>
        </div>
      )}

      {forecast && !loading && (
        <div className="space-y-3">
          {forecast.day1 && (
            <div className="p-3 rounded-lg bg-secondary/20 border-l-2 border-leaf/30">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-leaf" />
                <span className="text-[10px] font-medium text-leaf">Day 1</span>
              </div>
              <p className="text-xs text-foreground">{forecast.day1}</p>
            </div>
          )}
          {forecast.day2 && (
            <div className="p-3 rounded-lg bg-secondary/20 border-l-2 border-leaf/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-leaf" />
                <span className="text-[10px] font-medium text-leaf">Day 2</span>
              </div>
              <p className="text-xs text-foreground">{forecast.day2}</p>
            </div>
          )}
          {forecast.day3 && (
            <div className="p-3 rounded-lg bg-secondary/20 border-l-2 border-leaf/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-leaf" />
                <span className="text-[10px] font-medium text-leaf">Day 3</span>
              </div>
              <p className="text-xs text-foreground">{forecast.day3}</p>
            </div>
          )}
          {forecast.pattern_note && (
            <p className="text-[10px] text-muted-foreground/70 italic pt-1">{forecast.pattern_note}</p>
          )}
          <p className="text-[10px] text-muted-foreground/50">
            These are probabilistic observations, not certainties. Your choices shape what actually happens.
          </p>
          <button
            onClick={handleForecast}
            className="w-full py-2 rounded-lg bg-secondary/50 text-muted-foreground text-xs hover:bg-secondary transition-colors"
          >
            Refresh Forecast
          </button>
        </div>
      )}
    </div>
  );
}