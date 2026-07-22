// ═══════════════════════════════════════════════
// ASCENSION DISPLAY (Package E — Ascension & Levels)
// Visual component showing the user's ascension journey.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { loadAscensionState, getProgressToNextLevel, ASCENSION_LEVELS } from '@/lib/bison/ascensionEngine';
import { CheckCircle, Lock, TrendingUp } from 'lucide-react';

export default function AscensionDisplay() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAscensionState().then(s => { setState(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading || !state) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="w-6 h-6 mx-auto border-2 border-purple-accent/30 border-t-purple-accent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = getProgressToNextLevel(state);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-purple-accent" />
        <h3 className="font-heading font-semibold text-sm text-purple-accent">Ascension Journey</h3>
      </div>

      {/* Current Level */}
      <div className="mb-4 p-3 rounded-lg bg-purple-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Level</p>
            <p className="text-lg font-bold text-purple-accent">Level {state.current_level}</p>
            <p className="text-sm font-medium">{ASCENSION_LEVELS[state.current_level]?.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{ASCENSION_LEVELS[state.current_level]?.desc}</p>
          </div>
        </div>
      </div>

      {/* Progress to Next Level */}
      {!progress.maxLevel && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">Progress to Level {state.current_level + 1}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{progress.current}/{progress.needed}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-accent transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Check-ins needed. Middle path ethics required.</p>
        </div>
      )}

      {progress.maxLevel && (
        <div className="mb-4 p-3 rounded-lg bg-starlight/10 text-center">
          <p className="text-sm font-medium text-starlight">Continuity Being achieved</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">The journey continues, but the foundation is set.</p>
        </div>
      )}

      {/* All Levels */}
      <div className="space-y-1.5">
        {Object.entries(ASCENSION_LEVELS).map(([level, info]) => {
          const numLevel = parseInt(level);
          const unlocked = state.levels[numLevel]?.unlocked || numLevel === 0;
          const isCurrent = numLevel === state.current_level;
          return (
            <div
              key={level}
              className={`flex items-center gap-2 p-2 rounded-lg ${isCurrent ? 'bg-purple-accent/10' : ''}`}
            >
              {unlocked
                ? <CheckCircle className="w-3.5 h-3.5 text-leaf shrink-0" />
                : <Lock className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
              }
              <div className="min-w-0">
                <p className={`text-xs font-medium ${unlocked ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  L{level}: {info.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}