import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { awardTokens } from '@/lib/tokens';
import { PageHeader, EmptyState, SaveRipple } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Archive, Trash2, PawPrint, Cpu, MapPin, Utensils, Clock, Play } from 'lucide-react';
import EventTimeline from '@/components/EventTimeline';
import MemoryReplay from '@/components/MemoryReplay';

const CATEGORIES = [
  { id: 'animals', label: 'Animals', icon: PawPrint, color: 'hsl(120 40% 58%)' },
  { id: 'technology', label: 'Technology', icon: Cpu, color: 'hsl(199 56% 64%)' },
  { id: 'location', label: 'Location', icon: MapPin, color: 'hsl(42 63% 55%)' },
  { id: 'intake', label: 'Intake', icon: Utensils, color: 'hsl(21 73% 69%)' },
];

export default function Archives() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('animals');
  const [showForm, setShowForm] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ category: 'animals', title: '', description: '', photo_url: '', metadata: '' });

  useEffect(() => {
    base44.entities.MemoryArchive.list('-created_date', 100).then(data => {
      setMemories(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, photo_url: file_url }));
    } catch (e) {}
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    try {
      const mem = await base44.entities.MemoryArchive.create({ ...form, category: activeTab });
      await awardTokens(3, 'memory_archive');
      setMemories(prev => [mem, ...prev]);
      setRipple(true);
      setTimeout(() => setRipple(false), 700);
      setShowForm(false);
      setForm({ category: activeTab, title: '', description: '', photo_url: '', metadata: '' });
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    try { await base44.entities.MemoryArchive.delete(id); setMemories(prev => prev.filter(m => m.id !== id)); } catch (e) {}
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-sky-accent/30 border-t-sky-accent rounded-full animate-spin" /></div>;
  }

  const accent = 'hsl(199 56% 64%)';
  const filtered = memories.filter(m => m.category === activeTab);

  return (
    <div>
      <SaveRipple show={ripple} />
      <PageHeader title="Archives" subtitle="Visual memory categories" accent={accent} />
      <div className="px-6 lg:px-10 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50 flex-wrap h-auto">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" /> {cat.label}
                </TabsTrigger>
              );
            })}
            <TabsTrigger value="timeline" className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Timeline
            </TabsTrigger>
            <TabsTrigger value="replay" className="flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Replay
            </TabsTrigger>
          </TabsList>

          {CATEGORIES.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="mt-4">
              {!showForm ? (
                <button onClick={() => { setForm({ ...form, category: cat.id }); setShowForm(true); }} className="w-full glass rounded-xl p-4 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform mb-4">
                  <Plus className="w-4 h-4" style={{ color: cat.color }} />
                  <span className="text-sm font-medium" style={{ color: cat.color }}>Add {cat.label.toLowerCase()} memory</span>
                </button>
              ) : (
                <div className="glass rounded-2xl p-6 space-y-4 mb-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Name this memory..." className="mt-1 bg-secondary/50" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What happened? Why does this matter?" className="mt-1 bg-secondary/50" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Photo</Label>
                    <div className="mt-1 flex items-center gap-3">
                      {form.photo_url && <img src={form.photo_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files?.[0])} />
                        <span className="text-xs px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">{uploading ? 'Uploading...' : form.photo_url ? 'Change photo' : 'Upload photo'}</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Metadata</Label>
                    <Input value={form.metadata} onChange={e => setForm({ ...form, metadata: e.target.value })} placeholder="Additional details..." className="mt-1 bg-secondary/50" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSave} className="flex-1" style={{ backgroundColor: accent, color: 'hsl(268 16% 10%)' }} disabled={!form.title.trim()}>Save Memory</Button>
                    <Button onClick={() => setShowForm(false)} variant="outline" className="border-border">Cancel</Button>
                  </div>
                </div>
              )}

              {filtered.length === 0 && !showForm ? (
                <EmptyState icon={Archive} title={`No ${cat.label.toLowerCase()} memories`} subtitle="Capture moments, encounters, and details you want to remember." />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filtered.map(mem => (
                    <div key={mem.id} className="glass rounded-xl overflow-hidden group">
                      {mem.photo_url ? (
                        <img src={mem.photo_url} alt={mem.title} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-secondary/30">
                          <cat.icon className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium truncate">{mem.title}</p>
                          <button onClick={() => handleDelete(mem.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {mem.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mem.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}

          <TabsContent value="timeline" className="mt-4">
            <EventTimeline />
          </TabsContent>

          <TabsContent value="replay" className="mt-4">
            <MemoryReplay />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}