// ═══════════════════════════════════════════════
// AUDIO PLAYER (Package B — Audio Engine)
// Floating control widget for ambient music.
// Rendered in Layout so music continues across navigation.
// ═══════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { audioEngine, TRACKS } from '@/lib/ambiance/audioEngine';
import { Play, Pause, Volume2, VolumeX, Music, Cloud } from 'lucide-react';
import { ambientAudioEngine, AMBIENT_SOUNDS } from '@/lib/environment/ambientAudioEngine';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('piano');
  const [volume, setVolume] = useState(50);
  const [autoTone, setAutoTone] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [ambientSounds, setAmbientSounds] = useState([]);

  // Load saved preferences
  useEffect(() => {
    base44.auth.me().then(u => {
      const savedTrack = u?.audio_pack || 'piano';
      const savedVolume = u?.audio_volume ?? 50;
      const savedAutoTone = u?.auto_tone !== false;
      setCurrentTrack(savedTrack);
      setVolume(savedVolume);
      setAutoTone(savedAutoTone);
      audioEngine.setVolume(savedVolume / 100);
      audioEngine.setAutoTone(savedAutoTone);
      const savedAmbient = u?.ambient_sounds || [];
      setAmbientSounds(savedAmbient);
      if (u?.accessibility_settings?.disable_ambient_audio !== true) {
        savedAmbient.forEach(s => ambientAudioEngine.play(s));
      }
    }).catch(() => {});
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      audioEngine.play(currentTrack);
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);

  const handleTrackChange = useCallback(async (trackId) => {
    setCurrentTrack(trackId);
    try {
      await base44.auth.updateMe({ audio_pack: trackId });
    } catch (e) {}
    if (isPlaying) {
      audioEngine.play(trackId);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback(async (v) => {
    setVolume(v);
    audioEngine.setVolume(v / 100);
    try {
      await base44.auth.updateMe({ audio_volume: v });
    } catch (e) {}
  }, []);

  const handleAutoToneToggle = useCallback(async () => {
    const newVal = !autoTone;
    setAutoTone(newVal);
    audioEngine.setAutoTone(newVal);
    try {
      await base44.auth.updateMe({ auto_tone: newVal });
    } catch (e) {}
    // If enabling auto-tone and playing, switch to period-appropriate track
    if (newVal && isPlaying) {
      const recommended = audioEngine.getTrackForCurrentPeriod();
      if (recommended !== currentTrack) {
        handleTrackChange(recommended);
      }
    }
  }, [autoTone, isPlaying, currentTrack, handleTrackChange]);

  const toggleAmbientSound = useCallback(async (soundId) => {
    if (ambientSounds.includes(soundId)) {
      ambientAudioEngine.stop(soundId);
      const updated = ambientSounds.filter(s => s !== soundId);
      setAmbientSounds(updated);
      try { await base44.auth.updateMe({ ambient_sounds: updated }); } catch (e) {}
    } else {
      ambientAudioEngine.play(soundId);
      const updated = [...ambientSounds, soundId];
      setAmbientSounds(updated);
      try { await base44.auth.updateMe({ ambient_sounds: updated }); } catch (e) {}
    }
  }, [ambientSounds]);

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-30">
      {expanded && (
        <div className="glass rounded-xl p-4 mb-2 w-64 space-y-3 animate-pulse-soft">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-gold" />
            <span className="text-xs font-medium text-gold">Ambient Soundtrack</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(TRACKS).map(([id, track]) => (
              <button
                key={id}
                onClick={() => handleTrackChange(id)}
                className={`text-[10px] px-2 py-2 rounded-lg text-center transition-all ${
                  currentTrack === id ? 'bg-secondary' : 'bg-secondary/30 text-muted-foreground'
                }`}
                style={currentTrack === id ? { borderColor: track.color, borderWidth: 1 } : {}}
              >
                <span style={currentTrack === id ? { color: track.color } : {}}>{track.label}</span>
              </button>
            ))}
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Volume</span>
              <span className="text-[10px] font-medium text-muted-foreground">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={e => handleVolumeChange(+e.target.value)}
              className="w-full"
              style={{ accentColor: 'hsl(42 63% 55%)' }}
            />
          </div>
          <button
            onClick={handleAutoToneToggle}
            className={`w-full text-[10px] px-2 py-1.5 rounded-lg transition-all ${autoTone ? 'bg-gold/15 text-gold' : 'bg-secondary/30 text-muted-foreground'}`}
          >
            Auto Tone: {autoTone ? 'On' : 'Off'}
          </button>

          <div className="border-t border-border/30 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-3.5 h-3.5 text-leaf" />
              <span className="text-[10px] font-medium text-leaf">Ambient Sounds</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(AMBIENT_SOUNDS).map(([id, sound]) => (
                <button
                  key={id}
                  onClick={() => toggleAmbientSound(id)}
                  className={`text-[9px] px-1.5 py-1.5 rounded-lg transition-all ${ambientSounds.includes(id) ? 'bg-leaf/15 text-leaf border border-leaf/30' : 'bg-secondary/30 text-muted-foreground'}`}
                >
                  {sound.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-full glass shadow-lg transition-all touch-target"
      >
        <button
          onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
          className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center"
        >
          {isPlaying
            ? <Pause className="w-3.5 h-3.5 text-gold" />
            : <Play className="w-3.5 h-3.5 text-gold" />
          }
        </button>
        {volume === 0
          ? <VolumeX className="w-4 h-4 text-muted-foreground" />
          : <Volume2 className="w-4 h-4 text-muted-foreground" />
        }
        <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline">
          {isPlaying ? TRACKS[currentTrack]?.label : 'Music'}
        </span>
      </button>
    </div>
  );
}