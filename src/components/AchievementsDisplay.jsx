// ═══════════════════════════════════════════════
// ACHIEVEMENTS DISPLAY (Package F — Achievements)
// Visual grid showing unlocked and locked achievements.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { ACHIEVEMENTS, loadAchievements } from '@/lib/bison/achievementEngine';
import { Award, Lock, Check } from 'lucide-react';

const ICON_MAP = {
  check: Check,
  flame: Award,
  book: Award,
  bookmark: Award,
  lightbulb: Award,
  scale: Award,
  'trending-up': Award,
  star: Award,
  sparkles: Award,
  'message-circle': Award,
  users: Award,
  palette: Award,
  heart: Award,
};

export default function AchievementsDisplay() {
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements().then(ids => { setUnlocked(ids); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="w-6 h-6 mx-auto border-2 border-starlight/30 border-t-starlight rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-starlight" />
        <h3 className="font-heading font-semibold text-sm text-starlight">Achievements</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">{unlocked.length}/{ACHIEVEMENTS.length}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = unlocked.includes(achievement.id);
          const Icon = ICON_MAP[achievement.icon] || Award;
          return (
            <div
              key={achievement.id}
              className={`rounded-lg p-3 text-center transition-all ${isUnlocked ? 'glass' : 'bg-secondary/20'}`}
              style={isUnlocked ? { borderColor: achievement.color, borderWidth: 1 } : {}}
            >
              <div
                className="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: isUnlocked ? `${achievement.color}20` : 'hsl(268 8% 22%)' }}
              >
                {isUnlocked
                  ? <Icon className="w-4 h-4" style={{ color: achievement.color }} />
                  : <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                }
              </div>
              <p
                className="text-[10px] font-medium leading-tight"
                style={{ color: isUnlocked ? achievement.color : 'hsl(268 8% 50%)' }}
              >
                {achievement.title}
              </p>
              <p className="text-[8px] text-muted-foreground/60 mt-0.5 leading-tight">
                {isUnlocked ? achievement.description : '???'}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Achievements recognize genuine milestones. No artificial scarcity.
      </p>
    </div>
  );
}