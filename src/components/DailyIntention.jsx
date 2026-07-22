// ═══════════════════════════════════════════════
// DAILY INTENTION (Package R — Sanctuary expansion)
// Set a daily intention that anchors the day.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Target, X } from 'lucide-react';

const SUGGESTED_INTENTIONS = [
  'Notice one thing I\'m grateful for',
  'Pause before reacting',
  'Be present with someone',
  'Move my body',
  'Write one honest sentence',
  'Ask instead of assume',
  'Rest without guilt',
  'Listen fully',
];

export default function DailyIntention() {
  const [intention, setIntention] = useState(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(user => {
      const today = new Date().toISOString().split('T')[0];
      const stored = user?.daily_intention;
      if (stored?.date === today) {
        setIntention(stored.text);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      await base44.auth.updateMe({
        daily_intention: { date: today, text: text.trim() },
      });
      setIntention(text.trim());
      setEditing(false);
      setText('');
    } catch (e) {}
  };

  const handleClear = async () => {
    try {
      await base44.auth.updateMe({ daily_intention: null });
      setIntention(null);
    } catch (e) {}
  };

  if (loading) return null;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-peach" />
        <h3 className="font-heading font-semibold text-sm text-peach">Daily Intention</h3>
      </div>

      {intention && !editing ? (
        <div className="relative">
          <p className="text-sm italic text-foreground pr-6">"{intention}"</p>
          <button
            onClick={handleClear}
            className="absolute top-0 right-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] text-muted-foreground hover:text-foreground mt-2"
          >
            Change intention
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What matters today?"
            className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-peach"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_INTENTIONS.map(s => (
              <button
                key={s}
                onClick={() => setText(s)}
                className="text-[10px] px-2 py-1 rounded-full bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-peach transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          {text.trim() && (
            <button
              onClick={handleSave}
              className="w-full py-2 rounded-lg bg-peach/15 text-peach text-sm font-medium hover:bg-peach/25 transition-colors"
            >
              Set Intention
            </button>
          )}
        </div>
      )}
    </div>
  );
}