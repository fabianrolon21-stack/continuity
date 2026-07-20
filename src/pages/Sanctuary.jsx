import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BisonCompanion from '@/components/BisonCompanion';
import { PageHeader } from '@/components/MicroAnimations';
import { ClipboardCheck, BookOpen, MessageCircle, Users, ArrowRight } from 'lucide-react';

export default function Sanctuary() {
  const [latestCheckin, setLatestCheckin] = useState(null);
  const [latestJournal, setLatestJournal] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.CheckIn.list('-date', 1).catch(() => []),
      base44.entities.JournalEntry.list('-created_date', 1).catch(() => []),
      base44.auth.me().catch(() => null),
    ]).then(([checkins, journals, user]) => {
      setLatestCheckin(checkins?.[0] || null);
      setLatestJournal(journals?.[0] || null);
      setTokenBalance(user?.token_balance || 0);
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const bisonMood = latestCheckin?.mood >= 7 ? 'happy' : latestCheckin?.mood <= 3 ? 'sad' : latestCheckin?.stress_level >= 7 ? 'anxious' : 'neutral';

  const quickActions = [
    { label: 'Check-in', path: '/checkin', icon: ClipboardCheck, color: 'hsl(42 63% 55%)' },
    { label: 'Journal', path: '/reflect', icon: BookOpen, color: 'hsl(48 67% 74%)' },
    { label: 'Talk to Bison', path: '/bison', icon: MessageCircle, color: 'hsl(42 63% 55%)' },
    { label: 'Community', path: '/community', icon: Users, color: 'hsl(21 73% 69%)' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Sanctuary" subtitle="Your private space for continuity" accent="hsl(120 40% 58%)" />

      <div className="px-6 lg:px-10 pb-8 space-y-6">
        <div className="glass rounded-2xl p-8 lg:p-12 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 pattern-overlay opacity-50" />
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground mb-2">{greeting}.</p>
            <BisonCompanion mood={bisonMood} size="lg" />
            <h2 className="font-heading text-xl font-semibold mt-4 text-foreground">
              {latestCheckin
                ? `Your mood today: ${latestCheckin.mood}/10`
                : 'How are you feeling today?'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {latestCheckin
                ? `Energy ${latestCheckin.energy}/10 · Stress ${latestCheckin.stress_level}/10`
                : 'Start with a daily check-in to help Bison understand you better.'}
            </p>
            <Link
              to="/bison"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-lg bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-all"
            >
              Talk to Bison <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="glass rounded-xl p-4 hover:scale-[1.02] transition-transform group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${action.color}1a` }}>
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <p className="text-sm font-medium">{action.label}</p>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-sm text-leaf">Latest Check-in</h3>
              <Link to="/checkin" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
            </div>
            {latestCheckin ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mood</span>
                  <span className="font-medium">{latestCheckin.mood}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Energy</span>
                  <span className="font-medium">{latestCheckin.energy}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sleep</span>
                  <span className="font-medium">{latestCheckin.sleep_hours || '—'}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Steps</span>
                  <span className="font-medium">{latestCheckin.steps || '—'}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No check-ins yet. Start your first one today.</p>
            )}
          </div>

          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-sm text-starlight">Latest Journal</h3>
              <Link to="/reflect" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
            </div>
            {latestJournal ? (
              <div>
                <p className="text-sm font-medium">{latestJournal.title || 'Untitled'}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{latestJournal.content}</p>
                {latestJournal.distortions_detected?.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {latestJournal.distortions_detected.map(d => (
                      <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent">{d.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No journal entries yet. Reflect on your day.</p>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
            <span className="text-lg font-bold text-gold">{tokenBalance}</span>
          </div>
          <div>
            <p className="text-sm font-medium">Token Balance</p>
            <p className="text-xs text-muted-foreground">Earn 3 per entry · 5 per login</p>
          </div>
        </div>
      </div>
    </div>
  );
}