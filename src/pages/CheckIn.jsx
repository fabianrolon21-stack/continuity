import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { awardTokens } from '@/lib/tokens';
import { PageHeader, EmptyState, SaveRipple } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Plus, Calendar, TrendingUp, GitCompare, Sparkles, BookOpen } from 'lucide-react';
import WellbeingTrendsPanel from '@/components/wellbeing/WellbeingTrendsPanel';
import PatternCorrelationsPanel from '@/components/wellbeing/PatternCorrelationsPanel';
import InterventionSuggestionsPanel from '@/components/wellbeing/InterventionSuggestionsPanel';
import WellbeingNarrativePanel from '@/components/wellbeing/WellbeingNarrativePanel';
import { emit, EVENT_TYPES } from '@/lib/events';
import { incrementCheckIn } from '@/lib/bison/ascensionEngine';

const todayStr = () => new Date().toISOString().split('T')[0];

function SliderField({ label, value, onChange, accent }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs font-medium" style={{ color: accent }}>{value}/10</span>
      </div>
      <Slider value={[value]} onValueChange={v => onChange(v[0])} min={1} max={10} step={1} />
    </div>
  );
}

export default function CheckIn() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [form, setForm] = useState({
    date: todayStr(),
    mood: 5, energy: 5, sleep_hours: 7, sleep_quality: 5, stress_level: 5,
    exercise_type: '', exercise_duration_min: 0, social_interactions_count: 0,
    social_detail: '', nutrition_quality: 5, hydration_glasses: 4, focus_level: 5, steps: 0,
  });

  useEffect(() => {
    base44.entities.CheckIn.list('-date', 30).then(data => {
      setCheckins(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await base44.entities.CheckIn.create(form);
      emit(EVENT_TYPES.CHECKIN_COMPLETED, { checkin: form }, 'checkin_page');
      await awardTokens(3, 'daily_checkin');
      await incrementCheckIn();
      setCheckins(prev => [form, ...prev]);
      setRipple(true);
      setTimeout(() => setRipple(false), 700);
      setShowForm(false);
      setForm({ ...form, date: todayStr() });
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const gold = 'hsl(42 63% 55%)';

  return (
    <div>
      <SaveRipple show={ripple} />
      <PageHeader title="Daily Check-in" subtitle="Track your biological & lifestyle patterns" accent={gold} />

      <div className="px-6 lg:px-10 pb-8">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full glass rounded-xl p-4 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform mb-6"
          >
            <Plus className="w-4 h-4" style={{ color: gold }} />
            <span className="text-sm font-medium" style={{ color: gold }}>New check-in</span>
          </button>
        ) : (
          <div className="glass rounded-2xl p-6 space-y-5 mb-6">
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="mt-1 bg-secondary/50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SliderField label="Mood" value={form.mood} onChange={v => setForm({ ...form, mood: v })} accent={gold} />
              <SliderField label="Energy" value={form.energy} onChange={v => setForm({ ...form, energy: v })} accent={gold} />
              <SliderField label="Sleep Quality" value={form.sleep_quality} onChange={v => setForm({ ...form, sleep_quality: v })} accent={gold} />
              <SliderField label="Stress Level" value={form.stress_level} onChange={v => setForm({ ...form, stress_level: v })} accent={gold} />
              <SliderField label="Nutrition Quality" value={form.nutrition_quality} onChange={v => setForm({ ...form, nutrition_quality: v })} accent={gold} />
              <SliderField label="Focus Level" value={form.focus_level} onChange={v => setForm({ ...form, focus_level: v })} accent={gold} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Sleep Hours</Label>
                <Input type="number" step="0.5" value={form.sleep_hours} onChange={e => setForm({ ...form, sleep_hours: +e.target.value })} className="mt-1 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Steps</Label>
                <Input type="number" value={form.steps} onChange={e => setForm({ ...form, steps: +e.target.value })} className="mt-1 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Hydration (glasses)</Label>
                <Input type="number" value={form.hydration_glasses} onChange={e => setForm({ ...form, hydration_glasses: +e.target.value })} className="mt-1 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Exercise Type</Label>
                <Input value={form.exercise_type} onChange={e => setForm({ ...form, exercise_type: e.target.value })} placeholder="Walking..." className="mt-1 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Exercise (min)</Label>
                <Input type="number" value={form.exercise_duration_min} onChange={e => setForm({ ...form, exercise_duration_min: +e.target.value })} className="mt-1 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Social Interactions</Label>
                <Input type="number" value={form.social_interactions_count} onChange={e => setForm({ ...form, social_interactions_count: +e.target.value })} className="mt-1 bg-secondary/50" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Social Detail</Label>
              <Input value={form.social_detail} onChange={e => setForm({ ...form, social_detail: e.target.value })} placeholder="Who did you interact with?" className="mt-1 bg-secondary/50" />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="bg-gold text-background hover:bg-gold/90 flex-1">Save Check-in</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-border">Cancel</Button>
            </div>
          </div>
        )}

        {checkins.length === 0 && !showForm ? (
          <EmptyState icon={Calendar} title="No check-ins yet" subtitle="Start tracking your daily patterns to help Bison understand you." />
        ) : (
          <div className="space-y-3">
            {checkins.map((c, i) => (
              <div key={i} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{c.date}</span>
                  <span className="text-xs text-muted-foreground">{c.steps || 0} steps</span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
                  {[
                    { label: 'Mood', val: c.mood },
                    { label: 'Energy', val: c.energy },
                    { label: 'Sleep Q', val: c.sleep_quality },
                    { label: 'Stress', val: c.stress_level },
                    { label: 'Nutrition', val: c.nutrition_quality },
                    { label: 'Focus', val: c.focus_level },
                  ].map(m => (
                    <div key={m.label}>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className="text-sm font-semibold" style={{ color: gold }}>{m.val || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wellbeing Trends (Package 48) */}
      {checkins.length >= 3 && (
        <div className="px-6 lg:px-10 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-leaf" />
            <h2 className="font-heading text-lg font-semibold text-leaf">Trends & Forecast</h2>
          </div>
          <WellbeingTrendsPanel />
        </div>
      )}

      {/* Pattern Correlations (Package 49) */}
      {checkins.length >= 4 && (
        <div className="px-6 lg:px-10 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <GitCompare className="w-4 h-4 text-sky-accent" />
            <h2 className="font-heading text-lg font-semibold text-sky-accent">Pattern Correlations</h2>
          </div>
          <PatternCorrelationsPanel />
        </div>
      )}

      {/* Wellbeing Narrative (Package 52) */}
      {checkins.length >= 3 && (
        <div className="px-6 lg:px-10 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-gold" />
            <h2 className="font-heading text-lg font-semibold text-gold">Your Weekly Story</h2>
          </div>
          <WellbeingNarrativePanel />
        </div>
      )}

      {/* Intervention Suggestions (Package 50) */}
      {checkins.length >= 3 && (
        <div className="px-6 lg:px-10 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-peach" />
            <h2 className="font-heading text-lg font-semibold text-peach">Suggestions for You</h2>
          </div>
          <InterventionSuggestionsPanel />
        </div>
      )}
    </div>
  );
}