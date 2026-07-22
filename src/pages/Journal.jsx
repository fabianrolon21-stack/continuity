import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { awardTokens } from '@/lib/tokens';
import { detectCognitiveDistortions } from '@/lib/bison/pipeline';
import { emit } from '@/lib/events';
import { EVENT_TYPES } from '@/lib/events';
import { PageHeader, EmptyState, SaveRipple } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Plus, BookOpen, Trash2 } from 'lucide-react';

const TAG_OPTIONS = ['gratitude', 'conflict', 'growth', 'fear', 'joy', 'work', 'relationship', 'health', 'creativity', 'loss'];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], title: '', content: '', mood: 5, energy: 5, tags: [] });

  useEffect(() => {
    base44.entities.JournalEntry.list('-created_date', 50).then(data => {
      setEntries(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleSave = async () => {
    if (!form.content.trim()) return;
    const distortions = detectCognitiveDistortions(form.content);
    try {
      const entry = await base44.entities.JournalEntry.create({ ...form, distortions_detected: distortions });
      emit(EVENT_TYPES.JOURNAL_CREATED, { entry, distortions }, 'journal_page');
      await awardTokens(3, 'journal_entry');
      setEntries(prev => [entry, ...prev]);
      setRipple(true);
      setTimeout(() => setRipple(false), 700);
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], title: '', content: '', mood: 5, energy: 5, tags: [] });
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.JournalEntry.delete(id);
      emit(EVENT_TYPES.JOURNAL_DELETED, { id }, 'journal_page');
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-starlight/30 border-t-starlight rounded-full animate-spin" />
      </div>
    );
  }

  const accent = 'hsl(48 67% 74%)';

  return (
    <div>
      <SaveRipple show={ripple} />
      <PageHeader title="Journal" subtitle="Reflect on your day" accent={accent} />

      <div className="px-6 lg:px-10 pb-8">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full glass rounded-xl p-4 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform mb-6"
          >
            <Plus className="w-4 h-4" style={{ color: accent }} />
            <span className="text-sm font-medium" style={{ color: accent }}>New entry</span>
          </button>
        ) : (
          <div className="glass rounded-2xl p-6 space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="mt-1 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="A title..." className="mt-1 bg-secondary/50" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reflection</Label>
              <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="What happened today? How did it feel?" rows={5} className="mt-1 bg-secondary/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <Label className="text-xs text-muted-foreground">Mood</Label>
                  <span className="text-xs font-medium" style={{ color: accent }}>{form.mood}/10</span>
                </div>
                <Slider value={[form.mood]} onValueChange={v => setForm({ ...form, mood: v[0] })} min={1} max={10} step={1} />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <Label className="text-xs text-muted-foreground">Energy</Label>
                  <span className="text-xs font-medium" style={{ color: accent }}>{form.energy}/10</span>
                </div>
                <Slider value={[form.energy]} onValueChange={v => setForm({ ...form, energy: v[0] })} min={1} max={10} step={1} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${form.tags.includes(tag) ? 'bg-starlight/20 text-starlight' : 'bg-secondary/50 text-muted-foreground'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1" style={{ backgroundColor: accent, color: 'hsl(268 16% 10%)' }}>Save Entry</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-border">Cancel</Button>
            </div>
          </div>
        )}

        {entries.length === 0 && !showForm ? (
          <EmptyState icon={BookOpen} title="No journal entries" subtitle="Start writing to see cognitive distortion patterns and track your inner world." />
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold">{entry.title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground">{entry.date} · Mood {entry.mood}/10 · Energy {entry.energy}/10</p>
                  </div>
                  <button onClick={() => handleDelete(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{entry.content}</p>
                {entry.tags?.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {entry.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>)}
                  </div>
                )}
                {entry.distortions_detected?.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {entry.distortions_detected.map(d => (
                      <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent">{d.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}