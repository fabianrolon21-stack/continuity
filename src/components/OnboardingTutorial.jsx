// ═══════════════════════════════════════════════
// ONBOARDING TUTORIAL (Package N — Tutorial)
// Step-by-step intro for new users. Dismissible,
// remembers completion via auth.updateMe.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const STEPS = [
  {
    title: 'Welcome to Continuity',
    body: 'This is your private space for self-reflection. Everything here is yours — your data, your pace, your journey.',
    icon: '🌿',
  },
  {
    title: 'Meet The Bison',
    body: 'Bison is your companion. Talk honestly, and it will reflect back. It doesn\'t diagnose — it listens and mirrors.',
    icon: '🐂',
  },
  {
    title: 'Daily Check-ins',
    body: 'Each day, record how you feel. Over time, patterns emerge. This is the foundation of self-understanding.',
    icon: '📋',
  },
  {
    title: 'Journal & Reflect',
    body: 'Write freely. Bison can detect cognitive distortions and gently surface them. Your words stay private.',
    icon: '📖',
  },
  {
    title: 'Privacy First',
    body: 'Your private data (check-ins, journals, Bison chats) is never shared. Community is opt-in and separate.',
    icon: '🔒',
  },
  {
    title: 'Tokens & Growth',
    body: 'Earn tokens by engaging with your reflection. Use them for themes and backgrounds. Growth is the reward.',
    icon: '✨',
  },
];

export default function OnboardingTutorial() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user?.has_seen_tutorial) {
        setShow(true);
      }
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  const handleFinish = async () => {
    try {
      await base44.auth.updateMe({ has_seen_tutorial: true });
    } catch (e) {}
    setShow(false);
  };

  const handleSkip = async () => {
    try {
      await base44.auth.updateMe({ has_seen_tutorial: true });
    } catch (e) {}
    setShow(false);
  };

  if (checking || !show) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
      <div className="glass rounded-2xl p-8 max-w-md w-full relative">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="text-5xl mb-4">{current.icon}</div>
          <h2 className="font-heading text-xl font-bold text-gold mb-2">{current.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-gold' : 'w-1.5 bg-muted'}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
          )}

          {isLast ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-background text-sm font-medium"
            >
              <Check className="w-3.5 h-3.5" /> Get Started
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gold text-background text-sm font-medium"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}