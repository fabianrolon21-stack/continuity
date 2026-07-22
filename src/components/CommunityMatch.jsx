// ═══════════════════════════════════════════════
// COMMUNITY MATCHING (Package M — Matching)
// Matches users based on shared values, interests,
// and preferred vibe. Privacy-preserving.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Sparkles } from 'lucide-react';

const VIBE_COLORS = {
  calm: 'hsl(199 56% 64%)',
  energetic: 'hsl(21 73% 69%)',
  reflective: 'hsl(265 41% 64%)',
  playful: 'hsl(42 63% 55%)',
  deep: 'hsl(120 40% 58%)',
};

export default function CommunityMatch() {
  const [profiles, setProfiles] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const all = await base44.entities.CommunityProfile.list('-created_date', 20);
        const mine = (all || []).find(p => p.created_by_id === user.id);
        setProfiles(all || []);
        setMyProfile(mine || null);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!myProfile || profiles.length === 0) return;
    const scored = profiles
      .filter(p => p.id !== myProfile.id)
      .map(p => {
        let score = 0;
        const sharedValues = (p.values || []).filter(v => (myProfile.values || []).includes(v));
        const sharedInterests = (p.interests || []).filter(i => (myProfile.interests || []).includes(i));
        score += sharedValues.length * 3;
        score += sharedInterests.length * 2;
        if (p.preferred_vibe === myProfile.preferred_vibe) score += 5;
        return { profile: p, score, sharedValues, sharedInterests };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setMatches(scored);
  }, [myProfile, profiles]);

  if (loading) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="w-6 h-6 mx-auto border-2 border-purple-accent/30 border-t-purple-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="glass rounded-xl p-5 text-center">
        <Users className="w-6 h-6 text-purple-accent mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Create your community profile to find matches.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-purple-accent" />
        <h3 className="font-heading font-semibold text-sm text-purple-accent">Kindred Spirits</h3>
      </div>

      {matches.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No matches yet. More profiles will appear as the community grows.</p>
      ) : (
        <div className="space-y-2">
          {matches.map((m, i) => {
            const vibeColor = VIBE_COLORS[m.profile.preferred_vibe] || 'hsl(265 41% 64%)';
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${vibeColor}15` }}
                >
                  <span className="text-sm font-bold" style={{ color: vibeColor }}>
                    {(m.profile.display_name || '?')[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.profile.display_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {m.sharedValues.length} shared values · {m.sharedInterests.length} shared interests
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold" style={{ color: vibeColor }}>{Math.round(m.score)}</span>
                  <span className="text-[9px] text-muted-foreground block">match</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 mt-3">
        Matches are based on shared values and interests. Your data stays yours.
      </p>
    </div>
  );
}