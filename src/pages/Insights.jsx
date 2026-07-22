import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { awardTokens } from '@/lib/tokens';
import { PageHeader, EmptyState, SaveRipple } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Sparkles, Trash2, Compass, Scale, User, Brain, Heart, Shield } from 'lucide-react';
import { emit, EVENT_TYPES } from '@/lib/events';

const ETHICAL_DIMENSIONS = [
  { id: 'honesty', label: 'Honesty', icon: Scale },
  { id: 'compassion', label: 'Compassion', icon: Heart },
  { id: 'courage', label: 'Courage', icon: Shield },
  { id: 'justice', label: 'Justice', icon: Scale },
  { id: 'loyalty', label: 'Loyalty', icon: Compass },
  { id: 'growth', label: 'Growth', icon: Brain },
];

const ARCHETYPES = [
  { id: 'builder', label: 'Builder', desc: 'Creates structure and value', color: 'hsl(42 63% 55%)' },
  { id: 'wanderer', label: 'Wanderer', desc: 'Explores and questions', color: 'hsl(199 56% 64%)' },
  { id: 'protector', label: 'Protector', desc: 'Guards what matters', color: 'hsl(120 40% 58%)' },
  { id: 'critic', label: 'Critic', desc: 'Analyzes and refines', color: 'hsl(265 41% 64%)' },
  { id: 'strategist', label: 'Strategist', desc: 'Plans and positions', color: 'hsl(21 73% 69%)' },
  { id: 'idealist', label: 'Idealist', desc: 'Imagines and aspires', color: 'hsl(48 67% 74%)' },
];

const PERSPECTIVES = [
  { id: 'stoicism', label: 'Stoicism', desc: 'Focus on what you can control. Accept what you cannot.' },
  { id: 'buddhism', label: 'Buddhism', desc: 'Suffering arises from attachment. Liberation through awareness.' },
  { id: 'existentialism', label: 'Existentialism', desc: 'Existence precedes essence. You create your own meaning.' },
  { id: 'taoism', label: 'Taoism', desc: 'Flow with the natural order. Act without forcing.' },
  { id: 'christianity', label: 'Christianity', desc: 'Love God and neighbor. Grace through faith.' },
  { id: 'islam', label: 'Islam', desc: 'Submission to the divine. Compassion and justice.' },
  { id: 'secular_humanism', label: 'Secular Humanism', desc: 'Reason and empathy guide moral action.' },
  { id: 'jungian', label: 'Jungian', desc: 'Integrate the shadow. Individuate the self.' },
];

const PERSPECTIVE_LABELS = ['stoicism', 'buddhism', 'existentialism', 'taoism', 'christianity', 'islam', 'secular_humanism', 'jungian', 'personal'];

export default function Insights() {
  const [tab, setTab] = useState('philosophy');
  const [statements, setStatements] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [form, setForm] = useState({ text: '', category: 'belief', perspective: 'personal' });
  const [ethForm, setEthForm] = useState({ dimension: 'honesty', blue_points: 0, red_points: 0, mixed_points: 0, notes: '' });

  useEffect(() => {
    Promise.all([
      base44.entities.PhilosophyStatement.list('-created_date', 50).catch(() => []),
      base44.entities.EthicalAssessment.list('-created_date', 50).catch(() => []),
    ]).then(([stmts, eths]) => {
      setStatements(stmts || []);
      setAssessments(eths || []);
      setLoading(false);
    });
  }, []);

  const handleSaveStatement = async () => {
    if (!form.text.trim()) return;
    try {
      const stmt = await base44.entities.PhilosophyStatement.create(form);
      emit(EVENT_TYPES.PHILOSOPHY_ADDED, { statement: stmt }, 'insights_page');
      await awardTokens(3, 'philosophy_statement');
      setStatements(prev => [stmt, ...prev]);
      setRipple(true);
      setTimeout(() => setRipple(false), 700);
      setShowForm(false);
      setForm({ text: '', category: 'belief', perspective: 'personal' });
    } catch (e) {}
  };

  const handleDeleteStatement = async (id) => {
    try { await base44.entities.PhilosophyStatement.delete(id); setStatements(prev => prev.filter(s => s.id !== id)); } catch (e) {}
  };

  const handleSaveAssessment = async () => {
    try {
      const eth = await base44.entities.EthicalAssessment.create({ ...ethForm, date: new Date().toISOString().split('T')[0] });
      emit(EVENT_TYPES.ETHICS_ASSESSED, { assessment: eth }, 'insights_page');
      setAssessments(prev => [eth, ...prev]);
      setEthForm({ dimension: 'honesty', blue_points: 0, red_points: 0, mixed_points: 0, notes: '' });
    } catch (e) {}
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-purple-accent/30 border-t-purple-accent rounded-full animate-spin" /></div>;
  }

  const accent = 'hsl(265 41% 64%)';

  return (
    <div>
      <SaveRipple show={ripple} />
      <PageHeader title="Insights" subtitle="Philosophy, ethics, archetypes & perspectives" accent={accent} />
      <div className="px-6 lg:px-10 pb-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-secondary/50 flex-wrap h-auto">
            <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
            <TabsTrigger value="ethics">Ethics</TabsTrigger>
            <TabsTrigger value="archetypes">Archetypes</TabsTrigger>
            <TabsTrigger value="perspectives">Perspectives</TabsTrigger>
          </TabsList>

          <TabsContent value="philosophy" className="mt-4">
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="w-full glass rounded-xl p-4 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform mb-4">
                <Plus className="w-4 h-4" style={{ color: accent }} />
                <span className="text-sm font-medium" style={{ color: accent }}>Add statement</span>
              </button>
            ) : (
              <div className="glass rounded-2xl p-6 space-y-4 mb-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Statement</Label>
                  <Textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="What do you believe? What matters to you?" rows={3} className="mt-1 bg-secondary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border">
                      <option value="belief">Belief</option><option value="value">Value</option><option value="principle">Principle</option><option value="question">Question</option><option value="intention">Intention</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Perspective</Label>
                    <select value={form.perspective} onChange={e => setForm({ ...form, perspective: e.target.value })} className="mt-1 w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border">
                      {PERSPECTIVE_LABELS.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveStatement} className="flex-1" style={{ backgroundColor: accent, color: 'hsl(268 16% 10%)' }} disabled={!form.text.trim()}>Save</Button>
                  <Button onClick={() => setShowForm(false)} variant="outline" className="border-border">Cancel</Button>
                </div>
              </div>
            )}
            {statements.length === 0 && !showForm ? (
              <EmptyState icon={Sparkles} title="No philosophy statements" subtitle="Articulate your beliefs, values, and principles." />
            ) : (
              <div className="space-y-3">
                {statements.map(s => (
                  <div key={s.id} className="glass rounded-xl p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm">{s.text}</p>
                      <div className="flex gap-1.5 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent capitalize">{s.category}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{(s.perspective || 'personal').replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteStatement(s.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ethics" className="mt-4">
            <div className="glass rounded-2xl p-6 mb-4">
              <p className="text-sm font-medium mb-4">Self-assess your ethical alignment</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="col-span-2 md:col-span-1">
                  <Label className="text-xs text-muted-foreground">Dimension</Label>
                  <select value={ethForm.dimension} onChange={e => setEthForm({ ...ethForm, dimension: e.target.value })} className="mt-1 w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border">
                    {ETHICAL_DIMENSIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs" style={{ color: 'hsl(199 56% 64%)' }}>Blue (virtuous)</Label>
                  <Input type="number" min="0" value={ethForm.blue_points} onChange={e => setEthForm({ ...ethForm, blue_points: +e.target.value })} className="mt-1 bg-secondary/50" />
                </div>
                <div>
                  <Label className="text-xs text-destructive">Red (harmful)</Label>
                  <Input type="number" min="0" value={ethForm.red_points} onChange={e => setEthForm({ ...ethForm, red_points: +e.target.value })} className="mt-1 bg-secondary/50" />
                </div>
              </div>
              <div className="mb-4">
                <Label className="text-xs" style={{ color: 'hsl(21 73% 69%)' }}>Mixed Points</Label>
                <Input type="number" min="0" value={ethForm.mixed_points} onChange={e => setEthForm({ ...ethForm, mixed_points: +e.target.value })} className="mt-1 bg-secondary/50 max-w-32" />
              </div>
              <Input value={ethForm.notes} onChange={e => setEthForm({ ...ethForm, notes: e.target.value })} placeholder="Notes (optional)..." className="mb-4 bg-secondary/50" />
              <Button onClick={handleSaveAssessment} style={{ backgroundColor: accent, color: 'hsl(268 16% 10%)' }}>Save Assessment</Button>
            </div>
            <div className="space-y-3">
              {assessments.map(a => {
                const total = (a.blue_points || 0) + (a.red_points || 0) + (a.mixed_points || 0) || 1;
                return (
                  <div key={a.id} className="glass rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{a.dimension}</span>
                      <span className="text-xs text-muted-foreground">{a.date}</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
                      <div className="bg-sky-accent" style={{ width: `${(a.blue_points / total) * 100}%` }} />
                      <div className="bg-peach" style={{ width: `${(a.mixed_points / total) * 100}%` }} />
                      <div className="bg-destructive" style={{ width: `${(a.red_points / total) * 100}%` }} />
                    </div>
                    {a.notes && <p className="text-xs text-muted-foreground mt-2">{a.notes}</p>}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="archetypes" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">Your archetypes evolve based on your data and reflections. These six represent core patterns of self.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ARCHETYPES.map(a => (
                <div key={a.id} className="glass rounded-xl p-5">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${a.color}1a` }}>
                    <User className="w-5 h-5" style={{ color: a.color }} />
                  </div>
                  <p className="font-heading font-semibold text-sm" style={{ color: a.color }}>{a.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="perspectives" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">Eight ontological lenses through which to view your experiences.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PERSPECTIVES.map(p => (
                <div key={p.id} className="glass rounded-xl p-5">
                  <p className="font-heading font-semibold text-sm capitalize text-purple-accent">{p.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}