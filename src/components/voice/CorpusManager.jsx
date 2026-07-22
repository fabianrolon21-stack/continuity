import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/MicroAnimations';
import { StaggeredItem } from '@/components/AnimationEngine';

const SOURCE_TYPES = [
  { value: 'text', label: 'Text', color: 'hsl(42 63% 55%)' },
  { value: 'email', label: 'Email', color: 'hsl(199 56% 64%)' },
  { value: 'chat', label: 'Chat', color: 'hsl(120 40% 58%)' },
  { value: 'note', label: 'Note', color: 'hsl(265 41% 64%)' },
  { value: 'social_post', label: 'Social', color: 'hsl(21 73% 69%)' },
];

const CATEGORIES = ['boss', 'family', 'friend', 'coworker', 'professional', 'unknown'];

export default function CorpusManager({ corpus, onRefresh }) {
  const [text, setText] = useState('');
  const [sourceType, setSourceType] = useState('text');
  const [relName, setRelName] = useState('');
  const [relCategory, setRelCategory] = useState('unknown');
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.CommunicationCorpus.create({
        text: text.trim(),
        source_type: sourceType,
        relationship_name: relName.trim(),
        relationship_category: relCategory,
        consent_verified: true,
      });
      setText('');
      setRelName('');
      onRefresh();
    } catch (e) {}
    setSubmitting(false);
  };

  const handleAnalyze = async (entry) => {
    setAnalyzing(entry.id);
    try {
      const { analyzeCorpus } = await import('@/lib/bison/communicationEngine');
      const result = await analyzeCorpus(entry.text, entry.source_type, entry.relationship_name, entry.relationship_category);
      await base44.entities.CommunicationCorpus.update(entry.id, {
        is_analyzed: true,
        analysis_result: JSON.stringify(result),
      });
      onRefresh();
    } catch (e) {}
    setAnalyzing(null);
  };

  const handleDelete = async (id) => {
    await base44.entities.CommunicationCorpus.delete(id);
    onRefresh();
  };

  return (
    <div>
      <PageHeader title="Communication Corpus" subtitle="Add samples of your writing to build your voice fingerprint" accent="hsl(265 41% 64%)" />

      <div className="px-6 lg:px-10 pb-4 space-y-4">
        <div className="glass rounded-xl p-5 space-y-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste a message you wrote — a text, email, chat, note, or social post..."
            className="w-full bg-secondary/50 rounded-lg px-4 py-3 text-sm border border-border focus:outline-none focus:border-purple-accent min-h-[120px] resize-y"
          />

          <div className="flex flex-wrap gap-2">
            {SOURCE_TYPES.map(s => (
              <button
                key={s.value}
                onClick={() => setSourceType(s.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${sourceType === s.value ? 'text-background' : 'bg-secondary/30 text-muted-foreground'}`}
                style={sourceType === s.value ? { backgroundColor: s.color } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              value={relName}
              onChange={e => setRelName(e.target.value)}
              placeholder="Who was this to? (e.g. Mom, Alex)"
              className="flex-1 min-w-[150px] bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-purple-accent"
            />
            <select
              value={relCategory}
              onChange={e => setRelCategory(e.target.value)}
              className="bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-purple-accent"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="w-full py-2.5 rounded-lg bg-purple-accent/15 text-purple-accent text-sm font-medium hover:bg-purple-accent/25 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add to Corpus
          </button>
        </div>

        <div className="space-y-2">
          {corpus.length === 0 ? (
            <EmptyState title="No samples yet" subtitle="Add messages you've written to start building your fingerprint" />
          ) : (
            corpus.map((entry, i) => (
              <StaggeredItem key={entry.id} index={i}>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{
                        backgroundColor: `${SOURCE_TYPES.find(s => s.value === entry.source_type)?.color || 'hsl(268 8% 60%)'}20`,
                        color: SOURCE_TYPES.find(s => s.value === entry.source_type)?.color || 'hsl(268 8% 60%)',
                      }}>
                        {entry.source_type?.replace('_', ' ')}
                      </span>
                      {entry.relationship_name && (
                        <span className="text-[10px] text-muted-foreground">to {entry.relationship_name}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground capitalize">{entry.relationship_category}</span>
                      {entry.is_analyzed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-leaf/10 text-leaf">analyzed</span>
                      )}
                    </div>
                    <button onClick={() => handleDelete(entry.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-3">{entry.text}</p>
                  {!entry.is_analyzed && (
                    <button
                      onClick={() => handleAnalyze(entry)}
                      disabled={analyzing === entry.id}
                      className="mt-2 text-[11px] text-purple-accent hover:underline flex items-center gap-1"
                    >
                      {analyzing === entry.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Extract patterns
                    </button>
                  )}
                  {entry.is_analyzed && entry.analysis_result && (
                    <details className="mt-2">
                      <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground">Pattern analysis</summary>
                      <pre className="text-[10px] text-muted-foreground mt-1 overflow-x-auto whitespace-pre-wrap">{entry.analysis_result}</pre>
                    </details>
                  )}
                </div>
              </StaggeredItem>
            ))
          )}
        </div>
      </div>
    </div>
  );
}