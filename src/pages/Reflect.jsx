import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { awardTokens } from '@/lib/tokens';
import { PageHeader, EmptyState, SaveRipple } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Plus, Users, Trash2, Heart, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SensoryLogger from '@/components/SensoryLogger';
import SecretChamber from '@/components/SecretChamber';

const TAG_OPTIONS = ['supportive', 'distant', 'inspiring', 'draining', 'honest', 'complex', 'warm', 'challenging'];

function RelationshipForm({ form, setForm, onSave, onCancel }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Name</Label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 bg-secondary/50" placeholder="Their name..." />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Category</Label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border">
            <option value="friend">Friend</option>
            <option value="family">Family</option>
            <option value="partner">Partner</option>
            <option value="colleague">Colleague</option>
            <option value="acquaintance">Acquaintance</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Trust</Label>
            <span className="text-xs font-medium text-peach">{form.trust_level}/10</span>
          </div>
          <Slider value={[form.trust_level]} onValueChange={v => setForm({ ...form, trust_level: v[0] })} min={1} max={10} step={1} />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3" /> Closeness</Label>
            <span className="text-xs font-medium text-peach">{form.closeness_level}/10</span>
          </div>
          <Slider value={[form.closeness_level]} onValueChange={v => setForm({ ...form, closeness_level: v[0] })} min={1} max={10} step={1} />
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Interaction Notes</Label>
        <Textarea value={form.interaction_notes} onChange={e => setForm({ ...form, interaction_notes: e.target.value })} placeholder="How do you perceive this relationship?" rows={3} className="mt-1 bg-secondary/50" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Perception Tags</Label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map(tag => (
            <button key={tag} onClick={() => {
              const tags = form.perception_tags?.includes(tag) ? form.perception_tags.filter(t => t !== tag) : [...(form.perception_tags || []), tag];
              setForm({ ...form, perception_tags: tags });
            }} className={`text-xs px-3 py-1 rounded-full transition-all ${form.perception_tags?.includes(tag) ? 'bg-peach/20 text-peach' : 'bg-secondary/50 text-muted-foreground'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={onSave} className="flex-1 bg-peach text-background hover:bg-peach/90" disabled={!form.name.trim()}>Save</Button>
        <Button onClick={onCancel} variant="outline" className="border-border">Cancel</Button>
      </div>
    </div>
  );
}

export default function Reflect() {
  const [entries, setEntries] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'friend', trust_level: 5, closeness_level: 5, interaction_notes: '', perception_tags: [] });

  useEffect(() => {
    Promise.all([
      base44.entities.Relationship.list('-created_date', 50).catch(() => []),
      base44.entities.JournalEntry.list('-created_date', 50).catch(() => []),
    ]).then(([rels, journals]) => {
      setEntries(rels || []);
      setMemories(journals || []);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      const rel = await base44.entities.Relationship.create(form);
      await awardTokens(3, 'relationship_mapped');
      setEntries(prev => [rel, ...prev]);
      setRipple(true);
      setTimeout(() => setRipple(false), 700);
      setShowForm(false);
      setForm({ name: '', category: 'friend', trust_level: 5, closeness_level: 5, interaction_notes: '', perception_tags: [] });
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    try { await base44.entities.Relationship.delete(id); setEntries(prev => prev.filter(e => e.id !== id)); } catch (e) {}
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-peach/30 border-t-peach rounded-full animate-spin" /></div>;
  }

  const accent = 'hsl(48 67% 74%)';

  return (
    <div>
      <SaveRipple show={ripple} />
      <PageHeader title="Reflect" subtitle="Relationships & journal" accent={accent} />
      <div className="px-6 lg:px-10 pb-8">
        <Tabs defaultValue="relationships">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="sensory">Sensory</TabsTrigger>
            <TabsTrigger value="secret">Secret</TabsTrigger>
          </TabsList>

          <TabsContent value="relationships" className="mt-4">
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="w-full glass rounded-xl p-4 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform mb-4">
                <Plus className="w-4 h-4" style={{ color: 'hsl(21 73% 69%)' }} />
                <span className="text-sm font-medium" style={{ color: 'hsl(21 73% 69%)' }}>Map a relationship</span>
              </button>
            ) : (
              <div className="mb-4">
                <RelationshipForm form={form} setForm={setForm} onSave={handleSave} onCancel={() => setShowForm(false)} />
              </div>
            )}

            {entries.length === 0 && !showForm ? (
              <EmptyState icon={Users} title="No relationships mapped" subtitle="Map the people in your life to understand your perceptions." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {entries.map(rel => (
                  <div key={rel.id} className="glass rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm">{rel.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{rel.category}</p>
                      </div>
                      <button onClick={() => handleDelete(rel.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Trust</span><span className="text-peach">{rel.trust_level}/10</span></div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full bg-peach" style={{ width: `${rel.trust_level * 10}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Closeness</span><span className="text-peach">{rel.closeness_level}/10</span></div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full bg-peach" style={{ width: `${rel.closeness_level * 10}%` }} /></div>
                      </div>
                    </div>
                    {rel.interaction_notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{rel.interaction_notes}</p>}
                    {rel.perception_tags?.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {rel.perception_tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-peach/10 text-peach">{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="journal" className="mt-4">
            {memories.length === 0 ? (
              <EmptyState icon={Users} title="No journal entries" subtitle="Journal entries will appear here." />
            ) : (
              <div className="space-y-3">
                {memories.map(entry => (
                  <div key={entry.id} className="glass rounded-xl p-4">
                    <p className="text-sm font-semibold">{entry.title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground mb-2">{entry.date} · Mood {entry.mood}/10</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sensory" className="mt-4">
            <SensoryLogger />
          </TabsContent>

          <TabsContent value="secret" className="mt-4">
            <SecretChamber />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}