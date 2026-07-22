// ═══════════════════════════════════════════════
// ARCHETYPE DISPLAY (Package J — Archetypes)
// Contextual archetypes that shift based on user data.
// Clearly labeled as interpretive, not definitive.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { buildCognitiveContext } from '@/lib/bison/cognitiveContext';
import { Shapes, Loader2 } from 'lucide-react';

const ARCHETYPES = [
  { id: 'seeker', name: 'The Seeker', desc: 'Drawn to questions more than answers. Curiosity is the compass.', color: 'hsl(265 41% 64%)' },
  { id: 'builder', name: 'The Builder', desc: 'Constructs meaning from experience. Patterns become foundations.', color: 'hsl(120 40% 58%)' },
  { id: 'guardian', name: 'The Guardian', desc: 'Protects what matters. Loyalty runs deep.', color: 'hsl(199 56% 64%)' },
  { id: 'weaver', name: 'The Weaver', desc: 'Connects threads across domains. Sees the whole tapestry.', color: 'hsl(21 73% 69%)' },
  { id: 'explorer', name: 'The Explorer', desc: 'Ventures into the unknown. Growth happens at the edge.', color: 'hsl(42 63% 55%)' },
  { id: 'reflective', name: 'The Reflective', desc: 'Turns inward to understand outward. Self-awareness is the practice.', color: 'hsl(48 67% 74%)' },
];

export default function ArchetypeDisplay() {
  const [archetype, setArchetype] = useState(null);
  const [loading, setLoading] = useState(false);

  const determineArchetype = async () => {
    setLoading(true);
    try {
      const context = await buildCognitiveContext();
      const wellbeing = context?.wellbeingTrends;
      const philosophy = context?.philosophyOverview;

      // Simple heuristic — clearly labeled as interpretation
      let selected;

      if (wellbeing?.moodTrend === 'declining' || wellbeing?.stressTrend === 'increasing') {
        selected = ARCHETYPES.find(a => a.id === 'reflective');
      } else if (philosophy?.dominantPerspective === 'existentialism') {
        selected = ARCHETYPES.find(a => a.id === 'explorer');
      } else if (philosophy?.dominantPerspective === 'buddhism') {
        selected = ARCHETYPES.find(a => a.id === 'guardian');
      } else if (philosophy?.totalStatements > 5) {
        selected = ARCHETYPES.find(a => a.id === 'weaver');
      } else if (wellbeing?.avgMood >= 7) {
        selected = ARCHETYPES.find(a => a.id === 'builder');
      } else {
        selected = ARCHETYPES.find(a => a.id === 'seeker');
      }

      setArchetype(selected);
    } catch (e) {
      setArchetype(ARCHETYPES[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    determineArchetype();
  }, []);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shapes className="w-4 h-4 text-purple-accent" />
        <h3 className="font-heading font-semibold text-sm text-purple-accent">Archetype</h3>
        <button
          onClick={determineArchetype}
          className="ml-auto text-[10px] text-muted-foreground hover:text-foreground"
        >
          Recalculate
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 text-purple-accent animate-spin" />
        </div>
      )}

      {!loading && archetype && (
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: `${archetype.color}15` }}
          >
            <Shapes className="w-8 h-8" style={{ color: archetype.color }} />
          </div>
          <p className="text-lg font-bold" style={{ color: archetype.color }}>{archetype.name}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{archetype.desc}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-3">
            Archetypes shift with context. This is an interpretive lens, not a fixed identity.
          </p>
        </div>
      )}
    </div>
  );
}