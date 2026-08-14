// ═══════════════════════════════════════════════
// CONTINUOUS LIFE — USER PRESENCE (§16, §17)
// Bison knows whether you are here — and is allowed to
// not care. Greeting is cooldown-gated so noticing you
// never becomes a mechanical "HELLO USER!!!".
// ═══════════════════════════════════════════════

const presence = {
  isAppActive: true,
  isBisonVisible: false,
  lastInteractionAt: Date.now(),
  currentScreen: typeof window !== 'undefined' ? window.location.pathname : '/',
  lastGreetedAt: 0,
};

const GREET_COOLDOWN = 180000; // three minutes

let listeners = [];
const notify = () => listeners.forEach(fn => fn({ ...presence }));

export function initPresence() {
  if (typeof window === 'undefined' || presence._init) return;
  presence._init = true;

  document.addEventListener('visibilitychange', () => {
    presence.isAppActive = document.visibilityState === 'visible';
    notify();
  });

  const touch = () => { presence.lastInteractionAt = Date.now(); };
  window.addEventListener('pointerdown', touch, { passive: true });
  window.addEventListener('keydown', touch);
}

export const getPresence = () => ({ ...presence });

export function setScreen(path) {
  presence.currentScreen = path;
  notify();
}

export function setBisonVisible(visible) {
  presence.isBisonVisible = visible;
  notify();
}

/** True at most once per cooldown — Bison notices you, but not every time. */
export function shouldGreet(now = Date.now()) {
  if (now - presence.lastGreetedAt < GREET_COOLDOWN) return false;
  presence.lastGreetedAt = now;
  return true;
}

export const idleForMs = (now = Date.now()) => now - presence.lastInteractionAt;
export const subscribePresence = (fn) => { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn); }; };