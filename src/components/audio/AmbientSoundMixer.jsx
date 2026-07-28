// ═══════════════════════════════════════════════
// AMBIENT SOUND MIXER
// Category-grouped ambient sound toggles with an
// independent volume fader, so the ambient bed can
// be balanced against the music.
// ═══════════════════════════════════════════════

import { Cloud } from 'lucide-react';
import { ambientAudioEngine, AMBIENT_SOUNDS } from '@/lib/environment/ambientAudioEngine';

const CATEGORY_LABELS = {
  nature: 'Nature',
  interior: 'Interior',
  urban: 'Urban',
  fantasy: 'Fantasy',
};

export default function AmbientSoundMixer({ activeSounds, ambientVolume, onToggle, onVolumeChange }) {
  const grouped = Object.entries(AMBIENT_SOUNDS).reduce((acc, [id, sound]) => {
    (acc[sound.category] = acc[sound.category] || []).push([id, sound]);
    return acc;
  }, {});

  return (
    <div className="border-t border-border/30 pt-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Cloud className="w-3.5 h-3.5 text-leaf" />
          <span className="text-[10px] font-medium text-leaf">Ambient Sounds</span>
        </span>
        {activeSounds.length > 0 && (
          <button onClick={() => activeSounds.forEach(onToggle)} className="text-[9px] text-muted-foreground hover:text-foreground">
            Clear {activeSounds.length}
          </button>
        )}
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Ambient volume</span>
          <span className="text-[10px] font-medium text-muted-foreground">{ambientVolume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={ambientVolume}
          onChange={e => onVolumeChange(+e.target.value)}
          className="w-full"
          style={{ accentColor: 'hsl(120 40% 58%)' }}
        />
      </div>

      <div className="max-h-52 overflow-y-auto space-y-2 scrollbar-hide">
        {Object.entries(grouped).map(([category, sounds]) => (
          <div key={category}>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground/70 mb-1">
              {CATEGORY_LABELS[category] || category}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {sounds.map(([id, sound]) => (
                <button
                  key={id}
                  onClick={() => onToggle(id)}
                  className={`text-[9px] px-1.5 py-1.5 rounded-lg transition-all ${
                    activeSounds.includes(id)
                      ? 'bg-leaf/15 text-leaf border border-leaf/30'
                      : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}