// ═══════════════════════════════════════════════
// ACCESSIBILITY ENHANCER (Package P — Accessibility)
// Runtime accessibility adjustments: font scale,
// contrast boost, reduced motion. Persists on user.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Eye, Type, Zap, Volume2 } from 'lucide-react';

const FONT_SIZES = [
  { label: 'S', scale: 0.875 },
  { label: 'M', scale: 1 },
  { label: 'L', scale: 1.125 },
  { label: 'XL', scale: 1.25 },
];

export default function AccessibilityEnhancer() {
  const [settings, setSettings] = useState({
    font_scale: 1,
    high_contrast: false,
    reduced_motion: false,
    screen_reader_hints: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.accessibility_settings) {
        setSettings(user.accessibility_settings);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${settings.font_scale * 16}px`;
    if (settings.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    if (settings.reduced_motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [settings]);

  const update = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await base44.auth.updateMe({ accessibility_settings: updated });
    } catch (e) {}
  };

  if (loading) return null;

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-sky-accent" />
        <h3 className="font-heading font-semibold text-sm text-sky-accent">Accessibility</h3>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Font Size</span>
        </div>
        <div className="flex gap-2">
          {FONT_SIZES.map(fs => (
            <button
              key={fs.label}
              onClick={() => update('font_scale', fs.scale)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${settings.font_scale === fs.scale ? 'bg-sky-accent/20 text-sky-accent border border-sky-accent' : 'bg-secondary/30 text-muted-foreground'}`}
            >
              {fs.label}
            </button>
          ))}
        </div>
      </div>

      <ToggleRow
        icon={Zap}
        label="High Contrast"
        desc="Increase visual contrast for readability"
        value={settings.high_contrast}
        onChange={v => update('high_contrast', v)}
      />

      <ToggleRow
        icon={Eye}
        label="Reduced Motion"
        desc="Minimize animations and transitions"
        value={settings.reduced_motion}
        onChange={v => update('reduced_motion', v)}
      />

      <ToggleRow
        icon={Volume2}
        label="Screen Reader Hints"
        desc="Additional ARIA labels and descriptions"
        value={settings.screen_reader_hints}
        onChange={v => update('screen_reader_hints', v)}
      />
    </div>
  );
}

function ToggleRow({ icon: Icon, label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-xs font-medium">{label}</p>
          <p className="text-[10px] text-muted-foreground">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${value ? 'bg-sky-accent' : 'bg-secondary'}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}