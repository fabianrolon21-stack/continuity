import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings, Coins } from 'lucide-react';
import { findHub, visibleSections } from '@/lib/navigation';
import SidebarNav from '@/components/nav/SidebarNav';
import MobileNav from '@/components/nav/MobileNav';
import SectionNav from '@/components/nav/SectionNav';
import LocalFirstBadge from '@/components/privacy/LocalFirstBadge';
import BackgroundLayer from '@/components/BackgroundLayer';
import AudioPlayer from '@/components/AudioPlayer';
import InteractionEffects from '@/components/environment/InteractionEffects';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import { useOrchestrator } from '@/hooks/useOrchestrator';
import { loadUserTheme } from '@/lib/ambiance/themeEngine';
import { initLanguage } from '@/lib/localization';
import { startPresenceLoop, recordInteraction, getPresenceState } from '@/lib/bison/presenceManager';
import { useAtmosphericLighting } from '@/lib/ambiance/atmosphericLighting';

export default function Layout() {
  useOrchestrator();
  const location = useLocation();
  const [tokenBalance, setTokenBalance] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dashboardEnabled, setDashboardEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [staticBackground, setStaticBackground] = useState(false);
  const [userBirthday, setUserBirthday] = useState(null);

  useAtmosphericLighting({ userBirthday, enabled: !staticBackground });

  useEffect(() => {
    base44.auth.me().then(u => { setTokenBalance(u?.token_balance || 0); setUserRole(u?.role); setDashboardEnabled(u?.dashboard_enabled ?? false); setReduceMotion(u?.accessibility_settings?.reduced_motion || false); setStaticBackground(u?.accessibility_settings?.static_background_mode || false); setUserBirthday(u?.birthday || null); }).catch(() => {});
    loadUserTheme();
    initLanguage();
    recordInteraction();
    const stopLoop = startPresenceLoop(() => ({ userActive: true }));
    const persistInterval = setInterval(() => { getPresenceState(); }, 60000);
    return () => { stopLoop(); clearInterval(persistInterval); };
  }, [location.pathname]);

  const activeHub = findHub(location.pathname);
  const sections = visibleSections(activeHub, { isAdmin: userRole === 'admin', dashboardEnabled });

  return (
    <div className="min-h-screen bg-background no-tap-highlight">
      <BackgroundLayer />
      <AudioPlayer />
      <InteractionEffects reduceMotion={reduceMotion} />
      <OnboardingTutorial />
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-border bg-card/40 backdrop-blur-xl z-40">
        <div className="p-6 pb-4">
          <h1 className="font-heading text-xl font-bold text-gold tracking-tight text-glow-gold animate-glow-pulse">Continuity</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Private Identity Engine</p>
        </div>
        <SidebarNav activeHub={activeHub} />
        <div className="px-3 mb-2">
          <LocalFirstBadge />
        </div>
        {tokenBalance !== null && (
          <div className="p-4 m-3 rounded-lg bg-secondary/50 flex items-center gap-2">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{tokenBalance} tokens</span>
          </div>
        )}
      </aside>

      {/* Privacy state — always visible on mobile too */}
      <div className="lg:hidden fixed top-3 left-3 z-50" style={{ marginTop: 'env(safe-area-inset-top)' }}>
        <LocalFirstBadge />
      </div>

      {/* Persistent settings gear — never hidden (mobile) */}
      <Link
        to="/settings"
        className="lg:hidden fixed top-3 right-3 z-50 w-10 h-10 rounded-full flex items-center justify-center border border-border/60 no-tap-highlight"
        style={{ background: 'hsl(268 14% 12% / 0.75)', backdropFilter: 'blur(8px)', marginTop: 'env(safe-area-inset-top)' }}
      >
        <Settings className="w-4 h-4" style={{ color: location.pathname === '/settings' ? 'hsl(42 63% 55%)' : 'hsl(268 8% 60%)' }} />
      </Link>

      <main className="lg:ml-64 min-h-screen pb-28 lg:pb-8 pt-safe">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHub.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <SectionNav hub={activeHub} sections={sections} />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <MobileNav activeHub={activeHub} />
    </div>
  );
}