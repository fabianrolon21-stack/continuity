import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Home, MessageCircle, ClipboardCheck, BookOpen, Archive, Sparkles, Users, Settings, Coins, Shield, Eye, Mic, Sprout, Brain } from 'lucide-react';
import BackgroundLayer from '@/components/BackgroundLayer';
import AudioPlayer from '@/components/AudioPlayer';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import { loadUserTheme } from '@/lib/ambiance/themeEngine';
import { initLanguage } from '@/lib/localization';
import { startPresenceLoop, recordInteraction, getPresenceState } from '@/lib/bison/presenceManager';

const NAV_ITEMS = [
  { path: '/', label: 'Sanctuary', icon: Home, color: 'hsl(120 40% 58%)' },
  { path: '/bison', label: 'Bison', icon: MessageCircle, color: 'hsl(42 63% 55%)' },
  { path: '/checkin', label: 'Check-in', icon: ClipboardCheck, color: 'hsl(42 63% 55%)' },
  { path: '/reflect', label: 'Reflect', icon: BookOpen, color: 'hsl(48 67% 74%)' },
  { path: '/archives', label: 'Archives', icon: Archive, color: 'hsl(199 56% 64%)' },
  { path: '/insights', label: 'Insights', icon: Sparkles, color: 'hsl(265 41% 64%)' },
  { path: '/community', label: 'Community', icon: Users, color: 'hsl(21 73% 69%)' },
  { path: '/voice', label: 'Voice', icon: Mic, color: 'hsl(265 41% 64%)' },
  { path: '/garden', label: 'Garden', icon: Sprout, color: 'hsl(120 40% 58%)' },
  { path: '/decisions', label: 'Decisions', icon: Brain, color: 'hsl(199 56% 64%)' },
  { path: '/settings', label: 'Settings', icon: Settings, color: 'hsl(268 8% 60%)' },
];

export default function Layout() {
  const location = useLocation();
  const [tokenBalance, setTokenBalance] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dashboardEnabled, setDashboardEnabled] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { setTokenBalance(u?.token_balance || 0); setUserRole(u?.role); setDashboardEnabled(u?.dashboard_enabled ?? false); }).catch(() => {});
    loadUserTheme();
    initLanguage();
    recordInteraction();
    const stopLoop = startPresenceLoop(() => ({ userActive: true }));
    const persistInterval = setInterval(() => { getPresenceState(); }, 60000);
    return () => { stopLoop(); clearInterval(persistInterval); };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background no-tap-highlight">
      <BackgroundLayer />
      <AudioPlayer />
      <OnboardingTutorial />
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-border bg-card/40 backdrop-blur-xl z-40">
        <div className="p-6 pb-4">
          <h1 className="font-heading text-xl font-bold text-gold tracking-tight">Continuity</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Private Identity Engine</p>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={active ? { backgroundColor: `${item.color}1a`, color: item.color } : { color: 'hsl(268 8% 60%)' }}
                onMouseEnter={e => !active && (e.currentTarget.style.color = 'hsl(40 20% 92%)')}
                onMouseLeave={e => !active && (e.currentTarget.style.color = 'hsl(268 8% 60%)')}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {dashboardEnabled && (
          <Link
            to="/trust"
            className="mx-3 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={location.pathname === '/trust' ? { backgroundColor: 'hsl(199 56% 64% / 0.1)', color: 'hsl(199 56% 64%)' } : { color: 'hsl(268 8% 60%)' }}
          >
            <Eye className="w-4 h-4 shrink-0" />
            Trust
          </Link>
        )}
        {userRole === 'admin' && (
          <Link
            to="/developer"
            className="mx-3 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={location.pathname === '/developer' ? { backgroundColor: 'hsl(0 70% 50% / 0.1)', color: 'hsl(0 70% 50%)' } : { color: 'hsl(268 8% 60%)' }}
          >
            <Shield className="w-4 h-4 shrink-0" />
            Developer
          </Link>
        )}
        {tokenBalance !== null && (
          <div className="p-4 m-3 rounded-lg bg-secondary/50 flex items-center gap-2">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{tokenBalance} tokens</span>
          </div>
        )}
      </aside>

      <main className="lg:ml-64 min-h-screen pb-28 lg:pb-8 pt-safe">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-border bg-card/80 backdrop-blur-xl z-40 px-1 pb-safe">
        {NAV_ITEMS.slice(0, 5).map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 py-2.5 px-1 flex-1 touch-target no-tap-highlight"
              style={active ? { color: item.color } : { color: 'hsl(268 8% 50%)' }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}