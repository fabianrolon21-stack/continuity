// ═══════════════════════════════════════════════
// SENSORY LOGGER (Package G — Sensory Inputs)
// UI for logging Hearing, Smell, and Media Consumption.
// Deepens self-awareness through sensory observation.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { emit, EVENT_TYPES } from '@/lib/events';
import { Ear, Wind, Tv, Plus, X } from 'lucide-react';

const SENSE_TYPES = [
  { id: 'hearing', label: 'Hearing', icon: Ear, color: 'hsl(199 56% 64%)', placeholder: 'What did you hear? A song, a voice, the rain...' },
  { id: 'smell', label: 'Smell', icon: Wind, color: 'hsl(120 40% 58%)', placeholder: 'What did you smell? Coffee, rain, a perfume...' },
  { id: 'media', label: 'Media', icon: Tv, color: 'hsl(265 41% 64%)', placeholder: 'What media did you consume? A film, an article, a song...' },
];

export default function SensoryLogger() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSense, setSelectedSense] = useState('hearing');
  const [form, setForm] = useState({ data: '', intensity: 5, emotion: '', context: '', location: '' });

  useEffect(() => {
    base44.entities.SensoryLog.list('-created_date', 20).then(data => {
      setLogs(data || []);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.data.trim()) return;
    try {
      const entry = { ...form, sense_type: selectedSense };
      await base44.entities.SensoryLog.create(entry);
      emit(EVENT_TYPES.HEALTH_EVENT_LOGGED, { type: 'sensory', ...entry }, 'sensory_logger');
      setLogs(prev => [entry, ...prev]);
      setForm({ data: '', intensity: 5, emotion: '', context: '', location: '' });
      setShowForm(false);
    } catch (e) {}
  };

  const currentSense = SENSE_TYPES.find(s => s.id === selectedSense);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Ear className="w-4 h-4 text-sky-accent" />
        <h3 className="font-heading font-semibold text-sm text-sky-accent">Sensory Journal</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ml-auto text-xs px-2 py-1 rounded-lg bg-sky-accent/10 text-sky-accent flex items-center gap-1"
        >
          {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showForm ? 'Close' : 'Log'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 p-3 rounded-lg bg-secondary/30">
          <div className="grid grid-cols-3 gap-2">
            {SENSE_TYPES.map(sense => {
              const Icon = sense.icon;
              return (
                <button
                  key={sense.id}
                  onClick={() => setSelectedSense(sense.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${selectedSense === sense.id ? 'bg-secondary' : 'bg-secondary/30'}`}
                  style={selectedSense === sense.id ? { borderColor: sense.color, borderWidth: 1 } : {}}
                >
                  <Icon className="w-4 h-4" style={{ color: selectedSense === sense.id ? sense.color : 'hsl(268 8% 60%)' }} />
                  <span className="text-[10px]" style={{ color: selectedSense === sense.id ? sense.color : 'hsl(268 8% 60%)' }}>{sense.label}</span>
                </button>
              );
            })}
          </div>

          <textarea
            value={form.data}
            onChange={e => setForm({ ...form, data: e.target.value })}
            placeholder={currentSense?.placeholder}
            rows={2}
            className="w-full glass rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-sky-accent/40"
            style={{ color: 'hsl(40 20% 92%)' }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground">Intensity (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.intensity}
                onChange={e => setForm({ ...form, intensity: +e.target.value })}
                className="w-full"
                style={{ accentColor: currentSense?.color }}
              />
              <span className="text-[10px] font-medium" style={{ color: currentSense?.color }}>{form.intensity}/10</span>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Emotion</label>
              <input
                type="text"
                value={form.emotion}
                onChange={e => setForm({ ...form, emotion: e.target.value })}
                placeholder="Calm, nostalgic..."
                className="w-full glass rounded-lg px-2 py-1.5 text-xs"
                style={{ color: 'hsl(40 20% 92%)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.context}
              onChange={e => setForm({ ...form, context: e.target.value })}
              placeholder="Context (optional)"
              className="glass rounded-lg px-3 py-2 text-xs"
              style={{ color: 'hsl(40 20% 92%)' }}
            />
            <input
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Location (optional)"
              className="glass rounded-lg px-3 py-2 text-xs"
              style={{ color: 'hsl(40 20% 92%)' }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!form.data.trim()}
            className="w-full py-2 rounded-lg bg-sky-accent/15 text-sky-accent text-sm font-medium disabled:opacity-30"
          >
            Save Sensory Log
          </button>
        </div>
      )}

      {logs.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
          {logs.map((log, i) => {
            const sense = SENSE_TYPES.find(s => s.id === log.sense_type) || SENSE_TYPES[0];
            const Icon = sense.icon;
            return (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20">
                <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: sense.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs">{log.data}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {log.intensity && <span className="text-[10px] text-muted-foreground">{log.intensity}/10</span>}
                    {log.emotion && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{log.emotion}</span>}
                    {log.location && <span className="text-[10px] text-muted-foreground/60">@ {log.location}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {logs.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground text-center py-4">No sensory logs yet. Observe what you hear, smell, and consume.</p>
      )}
    </div>
  );
}