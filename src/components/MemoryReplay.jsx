// ═══════════════════════════════════════════════
// MEMORY REPLAY (Package I — Replay)
// Cycles through stored memories, journals, and check-ins
// in a chronological "replay" experience.
// ═══════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Pause, ChevronLeft, ChevronRight, BookOpen, ClipboardCheck, Heart, Brain } from 'lucide-react';

const SOURCE_CONFIG = {
  journal: { label: 'Journal', icon: BookOpen, color: 'hsl(48 67% 74%)' },
  checkin: { label: 'Check-in', icon: ClipboardCheck, color: 'hsl(42 63% 55%)' },
  memory: { label: 'Memory', icon: Heart, color: 'hsl(120 40% 58%)' },
  bison: { label: 'Bison', icon: Brain, color: 'hsl(42 63% 55%)' },
};

export default function MemoryReplay() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.JournalEntry.list('-created_date', 20).catch(() => []),
      base44.entities.CheckIn.list('-date', 20).catch(() => []),
      base44.entities.SavedMemory.list('-created_date', 20).catch(() => []),
      base44.entities.BisonMessage.list('-created_date', 20).catch(() => []),
    ]).then(([journals, checkins, memories, messages]) => {
      const allItems = [];

      (journals || []).forEach(j => allItems.push({
        type: 'journal',
        title: j.title || 'Untitled',
        content: j.content,
        date: j.created_date,
        extra: `Mood: ${j.mood || '—'}/10`,
      }));

      (checkins || []).forEach(c => allItems.push({
        type: 'checkin',
        title: `Check-in — ${c.date}`,
        content: `Mood ${c.mood}/10, Energy ${c.energy}/10, Sleep ${c.sleep_hours || '—'}h`,
        date: c.created_date,
        extra: `Stress: ${c.stress_level || '—'}/10`,
      }));

      (memories || []).forEach(m => allItems.push({
        type: 'memory',
        title: 'Saved Memory',
        content: m.text,
        date: m.created_date,
        extra: m.source || 'conversation',
      }));

      (messages || []).forEach(m => {
        if (m.role === 'bison') {
          allItems.push({
            type: 'bison',
            title: `Bison — ${m.mode || 'REFLECT'}`,
            content: m.text,
            date: m.created_date,
            extra: m.intent || '',
          });
        }
      });

      // Sort chronologically (oldest first for replay)
      allItems.sort((a, b) => new Date(a.date) - new Date(b.date));
      setItems(allItems);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleNext = useCallback(() => {
    setIndex(prev => Math.min(prev + 1, items.length - 1));
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setIndex(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (index >= items.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setIndex(prev => Math.min(prev + 1, items.length - 1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [playing, index, items.length]);

  if (loading) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="w-6 h-6 mx-auto border-2 border-peach/30 border-t-peach rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-sm text-muted-foreground">No memories to replay yet.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Journal, check in, or talk to Bison to build your timeline.</p>
      </div>
    );
  }

  const current = items[index];
  const config = SOURCE_CONFIG[current.type] || SOURCE_CONFIG.memory;
  const Icon = config.icon;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Play className="w-4 h-4 text-peach" />
        <h3 className="font-heading font-semibold text-sm text-peach">Memory Replay</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">{index + 1} / {items.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-secondary overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-peach transition-all duration-500"
          style={{ width: `${((index + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* Current memory card */}
      <div className="glass rounded-xl p-4 mb-4 min-h-[120px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${config.color}15` }}>
            <Icon className="w-3 h-3" style={{ color: config.color }} />
          </div>
          <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {new Date(current.date).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm font-medium">{current.title}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-4">{current.content}</p>
        {current.extra && (
          <p className="text-[10px] text-muted-foreground/60 mt-2">{current.extra}</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          disabled={index === 0}
          className="w-10 h-10 rounded-full glass flex items-center justify-center disabled:opacity-30 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          className="w-12 h-12 rounded-full bg-peach/15 text-peach flex items-center justify-center"
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={handleNext}
          disabled={index >= items.length - 1}
          className="w-10 h-10 rounded-full glass flex items-center justify-center disabled:opacity-30 transition-opacity"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}