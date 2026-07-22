// ═══════════════════════════════════════════════
// SELF MIRROR (Package J — Mirror)
// Uses LLM to generate a reflective mirror of the user
// based on their accumulated data. Clearly labeled as
// interpretation, not diagnosis.
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildCognitiveContext } from '@/lib/bison/cognitiveContext';
import { ScanFace, Loader2 } from 'lucide-react';

export default function SelfMirror() {
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReflect = async () => {
    setLoading(true);
    setReflection(null);
    try {
      const context = await buildCognitiveContext();
      const contextSummary = context
        ? `Wellbeing trends: ${JSON.stringify(context.wellbeingTrends || {})}. ` +
          `Philosophy: ${JSON.stringify(context.philosophyOverview || {})}. ` +
          `Ethics: ${JSON.stringify(context.ethicsOverview || {})}. ` +
          `Relationships: ${JSON.stringify(context.relationshipOverview || {})}.`
        : 'No data available yet.';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a reflective mirror in the Continuity app. Based on the user's accumulated data, write a brief (3-4 sentence) reflective observation. Be warm, non-clinical, and epistemically honest — use phrases like "I notice" or "there seems to be" rather than definitive statements. Never diagnose. Highlight a potential pattern or tension gently.\n\nUser data summary: ${contextSummary}\n\nReflective mirror:`,
      });

      setReflection(typeof result === 'string' ? result : (result?.text || ''));
    } catch (e) {
      setReflection('Unable to generate reflection right now. Try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ScanFace className="w-4 h-4 text-sky-accent" />
        <h3 className="font-heading font-semibold text-sm text-sky-accent">Mirror</h3>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Bison holds up a mirror based on your accumulated data. This is interpretation, not diagnosis.
      </p>

      {!reflection && !loading && (
        <button
          onClick={handleReflect}
          className="w-full py-2.5 rounded-lg bg-sky-accent/15 text-sky-accent text-sm font-medium hover:bg-sky-accent/25 transition-colors"
        >
          Look in the Mirror
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-6 gap-2">
          <Loader2 className="w-4 h-4 text-sky-accent animate-spin" />
          <span className="text-xs text-muted-foreground">Bison is reflecting...</span>
        </div>
      )}

      {reflection && !loading && (
        <div>
          <div className="p-4 rounded-lg bg-secondary/20 border-l-2 border-sky-accent/30">
            <p className="text-sm italic text-foreground">{reflection}</p>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            This is Bison's interpretation of your data. It may be incomplete or inaccurate. Trust your own knowing.
          </p>
          <button
            onClick={handleReflect}
            className="mt-3 w-full py-2 rounded-lg bg-secondary/50 text-muted-foreground text-xs hover:bg-secondary transition-colors"
          >
            Reflect Again
          </button>
        </div>
      )}
    </div>
  );
}