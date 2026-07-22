import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getTokenBalance } from '@/lib/tokens';
import { PageHeader } from '@/components/MicroAnimations';
import { Switch } from '@/components/ui/switch';
import { Coins, Globe, Zap, Music, Info, Shield, Gauge } from 'lucide-react';
import ThemeShop from '@/components/ThemeShop';
import TokenShop from '@/components/TokenShop';
import AccessibilityEnhancer from '@/components/AccessibilityEnhancer';
import PerformanceModeSelector from '@/components/world/PerformanceModeSelector';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
];

const AUDIO_PACKS = [
  { id: '8bit', label: '8 Bit Classic', color: 'hsl(42 63% 55%)' },
  { id: 'piano', label: 'Piano Calm', color: 'hsl(199 56% 64%)' },
  { id: 'violin', label: 'Violin Warm', color: 'hsl(120 40% 58%)' },
  { id: 'jazz', label: 'Mysterious Jazz', color: 'hsl(265 41% 64%)' },
];

export default function Settings() {
  const [user, setUser] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [language, setLanguage] = useState('en');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [audioPack, setAudioPack] = useState('piano');
  const [autoTone, setAutoTone] = useState(true);
  const [volume, setVolume] = useState(50);
  const [immuneEnabled, setImmuneEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setTokenBalance(u?.token_balance || 0);
      setLanguage(u?.language || 'en');
      setReduceMotion(u?.reduce_motion || false);
      setAudioPack(u?.audio_pack || 'piano');
      setAutoTone(u?.auto_tone !== false);
      setVolume(u?.audio_volume || 50);
      setImmuneEnabled(u?.immune_enabled !== false);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateSetting = async (key, value) => {
    try {
      await base44.auth.updateMe({ [key]: value });
      setUser(prev => ({ ...prev, [key]: value }));
    } catch (e) {}
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-muted/30 border-t-muted rounded-full animate-spin" /></div>;
  }

  const accent = 'hsl(268 8% 60%)';

  return (
    <div>
      <PageHeader title="Settings" subtitle="Personalize your experience" accent={accent} />
      <div className="px-6 lg:px-10 pb-8 space-y-4">
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
            <Coins className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-sm font-medium">Token Balance</p>
            <p className="text-2xl font-bold text-gold">{tokenBalance}</p>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">Language</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); updateSetting('language', lang.code); }}
                className={`text-sm px-3 py-2 rounded-lg transition-all ${language === lang.code ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Full translations coming soon. English is currently active.</p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">Accessibility</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Reduce Motion</p>
              <p className="text-xs text-muted-foreground">Minimize animations across the app</p>
            </div>
            <Switch checked={reduceMotion} onCheckedChange={v => { setReduceMotion(v); updateSetting('reduce_motion', v); }} />
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">Protection</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Threat Detection</p>
              <p className="text-xs text-muted-foreground">Detect phishing, spam, and sensitive data in messages</p>
            </div>
            <Switch checked={immuneEnabled} onCheckedChange={v => { setImmuneEnabled(v); updateSetting('immune_enabled', v); }} />
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">Audio Tone</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {AUDIO_PACKS.map(pack => (
              <button
                key={pack.id}
                onClick={() => { setAudioPack(pack.id); updateSetting('audio_pack', pack.id); }}
                className={`text-sm px-3 py-3 rounded-lg text-center transition-all ${audioPack === pack.id ? 'bg-secondary' : 'bg-secondary/30 text-muted-foreground'}`}
                style={audioPack === pack.id ? { borderColor: pack.color, borderWidth: 1 } : {}}
              >
                <p className="font-medium" style={audioPack === pack.id ? { color: pack.color } : {}}>{pack.label}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm">Auto Tone</p>
              <p className="text-xs text-muted-foreground">Shifts by time of day</p>
            </div>
            <Switch checked={autoTone} onCheckedChange={v => { setAutoTone(v); updateSetting('auto_tone', v); }} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">Volume</span>
              <span className="text-xs font-medium" style={{ color: accent }}>{volume}%</span>
            </div>
            <input type="range" min="0" max="100" value={volume} onChange={e => { const v = +e.target.value; setVolume(v); updateSetting('audio_volume', v); }} className="w-full accent-current" style={{ accentColor: accent }} />
          </div>
        </div>

        <ThemeShop />

        <TokenShop />

        <AccessibilityEnhancer />

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4" style={{ color: accent }} />
              <h3 className="font-heading font-semibold text-sm">World Performance</h3>
            </div>
            <PerformanceModeSelector />
          </div>
          <p className="text-xs text-muted-foreground">Controls animation density, particles, and visual effects for the living world.</p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">About Continuity</h3>
          </div>
          <p className="text-xs text-muted-foreground">A private identity engine, philosophical mirror, and long-term continuity system with a living companion — The Bison.</p>
          <p className="text-xs text-muted-foreground mt-2">All private data is scoped to your account. Community features are opt-in and use only your profile fields — never your private logs.</p>
        </div>
      </div>
    </div>
  );
}