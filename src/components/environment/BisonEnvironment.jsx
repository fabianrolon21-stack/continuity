// ═══════════════════════════════════════════════
// BISON ENVIRONMENT (Package 018 — Section 7)
// The Bison's surroundings evolve based on the
// active theme. Simple SVG scenes rendered behind
// the Bison companion.
// ═══════════════════════════════════════════════

import { getThemeProperties } from '@/lib/environment/themeProperties';

const SCENES = {
  calm_room: {
    gradient: 'linear-gradient(180deg, transparent 60%, hsl(268 14% 14% / 0.3) 100%)',
    elements: <RoomScene />,
  },
  wooden_cabin: {
    gradient: 'linear-gradient(180deg, transparent 50%, hsl(30 30% 20% / 0.4) 100%)',
    elements: <CabinScene />,
  },
  coastal_overlook: {
    gradient: 'linear-gradient(180deg, transparent 40%, hsl(199 56% 40% / 0.3) 100%)',
    elements: <CoastalScene />,
  },
  snowy_lodge: {
    gradient: 'linear-gradient(180deg, transparent 50%, hsl(200 20% 80% / 0.2) 100%)',
    elements: <SnowScene />,
  },
  lantern_glow: {
    gradient: 'radial-gradient(ellipse at 50% 70%, hsl(42 70% 50% / 0.08) 0%, transparent 60%)',
    elements: <LanternScene />,
  },
};

function RoomScene() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32" aria-hidden="true">
      <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(180deg, transparent, hsl(268 14% 10% / 0.4))' }} />
    </div>
  );
}

function CabinScene() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32" aria-hidden="true">
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
        <path d="M0 120 L0 80 L60 50 L120 80 L120 120 Z" fill="hsl(30 30% 15% / 0.3)" />
        <path d="M100 120 L100 70 L180 40 L260 70 L260 120 Z" fill="hsl(30 30% 12% / 0.35)" />
        <path d="M240 120 L240 85 L320 60 L400 85 L400 120 Z" fill="hsl(30 30% 15% / 0.3)" />
      </svg>
    </div>
  );
}

function CoastalScene() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32" aria-hidden="true">
      <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: 'linear-gradient(180deg, hsl(199 56% 30% / 0.2), hsl(199 56% 20% / 0.35))' }} />
      <div className="absolute bottom-10 left-0 right-0 h-2" style={{ background: 'hsl(199 56% 50% / 0.15)' }} />
    </div>
  );
}

function SnowScene() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-24" aria-hidden="true">
      <div className="absolute bottom-0 left-0 right-0 h-full" style={{ background: 'linear-gradient(180deg, transparent, hsl(200 20% 85% / 0.15))' }} />
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
        <path d="M0 80 Q100 50 200 60 T400 50 L400 80 Z" fill="hsl(200 20% 90% / 0.1)" />
      </svg>
    </div>
  );
}

function LanternScene() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32" aria-hidden="true">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle, hsl(42 70% 50% / 0.15), transparent 70%)' }} />
    </div>
  );
}

export default function BisonEnvironment({ themeId = 'classic', reduceMotion = false }) {
  const props = getThemeProperties(themeId);
  const scene = SCENES[props.bisonEnvironment] || SCENES.calm_room;

  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: -9, height: '200px' }} aria-hidden="true">
      <div className="absolute inset-0" style={{ background: scene.gradient, transition: 'background 3s ease-in-out' }} />
      {scene.elements}
    </div>
  );
}