import { Home, MessageCircle, BookOpen, Sprout, UserRound, ClipboardCheck, Archive, Sparkles, BriefcaseBusiness, Network, ScanEye, Brain, Map, Mic, Gamepad2, ShoppingBag, Users, Lock, Settings, Eye, Shield } from 'lucide-react';

// Five hubs. Every existing route lives inside exactly one hub — nothing is lost,
// it is simply gathered. Each hub has an accent and an ordered set of sections.
export const HUBS = [
  {
    id: 'sanctuary', label: 'Sanctuary', icon: Home, color: 'hsl(120 40% 58%)', root: '/',
    sections: [],
  },
  {
    id: 'bison', label: 'Bison', icon: MessageCircle, color: 'hsl(42 63% 55%)', root: '/bison',
    sections: [
      { path: '/bison', label: 'Talk', icon: MessageCircle },
      { path: '/work', label: 'Work', icon: BriefcaseBusiness },
      { path: '/mirror', label: 'Mirror', icon: ScanEye },
      { path: '/simulation', label: 'Simulation', icon: Network },
    ],
  },
  {
    id: 'reflect', label: 'Reflect', icon: BookOpen, color: 'hsl(48 67% 74%)', root: '/reflect',
    sections: [
      { path: '/checkin', label: 'Check-in', icon: ClipboardCheck },
      { path: '/reflect', label: 'Journal', icon: BookOpen },
      { path: '/journal', label: 'Entries', icon: Archive, hidden: true },
      { path: '/archives', label: 'Archives', icon: Archive },
      { path: '/insights', label: 'Insights', icon: Sparkles },
    ],
  },
  {
    id: 'grow', label: 'Grow', icon: Sprout, color: 'hsl(199 56% 64%)', root: '/garden',
    sections: [
      { path: '/garden', label: 'Garden', icon: Sprout },
      { path: '/continuity', label: 'Map', icon: Map },
      { path: '/decisions', label: 'Decisions', icon: Brain },
      { path: '/voice', label: 'Voice', icon: Mic },
      { path: '/games', label: 'Play', icon: Gamepad2 },
      { path: '/store', label: 'Store', icon: ShoppingBag },
    ],
  },
  {
    id: 'you', label: 'You', icon: UserRound, color: 'hsl(265 41% 64%)', root: '/settings',
    sections: [
      { path: '/settings', label: 'Settings', icon: Settings },
      { path: '/community', label: 'Community', icon: Users },
      { path: '/privacy', label: 'Privacy', icon: Lock },
      { path: '/trust', label: 'Trust', icon: Eye, requires: 'dashboard' },
      { path: '/developer', label: 'Developer', icon: Shield, requires: 'admin' },
    ],
  },
];

export function findHub(pathname) {
  return HUBS.find(h => h.root === pathname || h.sections.some(s => s.path === pathname)) || HUBS[0];
}

export function visibleSections(hub, { isAdmin, dashboardEnabled }) {
  return hub.sections.filter(s => !s.hidden
    && (s.requires !== 'admin' || isAdmin)
    && (s.requires !== 'dashboard' || dashboardEnabled));
}