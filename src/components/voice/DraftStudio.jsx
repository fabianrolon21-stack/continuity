import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, PenLine, Check, Edit3, X } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/MicroAnimations';
import { StaggeredItem } from '@/components/AnimationEngine';

const CATEGORIES = ['boss', 'family', 'friend', 'coworker', 'professional', 'unknown'];

export default function DraftStudio({ fingerprint, profiles, onRefresh }) {
  const [context, setContext] = useState('');
  const [intent, setIntent] = useState('');
  const [relName, setRelName] = useState('');
  const [relCategory, setRelCategory] = useState('friend');
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    (async () => {
      const data = await base44.entities.CommunicationDraft.list('-created_date', 20);
      setDrafts(data);
    })();
  }, []);

  const handleGenerate = async () => {
    if (!context.trim()) return;
    setGenerating(true);
    try {
      const { generateDraft, verifyAuthenticity } = await import('@/lib/bison/communicationEngine');
      const fp = fingerprint?.analysis_result ? JSON.parse(fingerprint.analysis_result) : null;
      const profile = profiles?.find(p => (p.relationship_name || '').toLowerCase() === relName.toLowerCase());

      const text = await generateDraft(context, intent, relName, relCategory, fp, profile);
      const auth = await verifyAuthenticity(text, fp, profile, relName, relCategory);

      const draft = await base44.entities.CommunicationDraft.create({
        context: context.trim(),
        user_intent: intent.trim(),
        relationship_name: relName.trim(),
        relationship_category: relCategory,
        generated_text: text,
        authenticity_scores: JSON.stringify(auth.scores),
        authenticity_flags: auth.flags || [],
        review_status: 'pending',
      });
      setDrafts(prev => prev ? [draft, ...prev] : [draft]);
      setContext('');
      setIntent('');
    } catch (e) {}
    setGenerating(false);
  };

  const reloadDrafts = async () => {
    const data = await base44.entities.CommunicationDraft.list('-created_date', 20);
    setDrafts(data);
  };

  const handleAccept = async (draft) => {
    await base44.entities.CommunicationDraft.update(draft.id, { review_status: 'accepted' });
    reloadDrafts();
  };

  const handleStartEdit = (draft) => {
    setReviewing(draft.id);
    setEditText(draft.generated_text);
  };

  const handleSaveEdit = async (draft) => {
    const { analyzeDifference } = await import('@/lib/bison/communicationEngine');
    const diff = await analyzeDifference(draft.generated_text, editText);
    await base44.entities.CommunicationDraft.update(draft.id, {
      review_status: 'edited',
      edited_text: editText,
      difference_analysis: JSON.stringify(diff),
    });
    setReviewing(null);
    setEditText('');
    reloadDrafts();
  };

  const handleReject = async (draft) => {
    await base44.entities.CommunicationDraft.update(draft.id, { review_status: 'rejected' });
    reloadDrafts();
  };

  return (
    <div>
      <PageHeader title="Draft Studio" subtitle="Generate messages in your authentic voice" accent="hsl(21 73% 69%)" />

      <div className="px-6 lg:px-10 pb-4 space-y-4">
        <div className="glass rounded-xl p-5 space-y-3">
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="What's the situation? What do you need to say?"
            className="w-full bg-secondary/50 rounded-lg px-4 py-3 text-sm border border-border focus:outline-none focus:border-peach min-h-[80px] resize-y"
          />
          <input
            value={intent}
            onChange={e => setIntent(e.target.value)}
            placeholder="Your intent (e.g. be warm but firm, express gratitude...)"
            className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-peach"
          />
          <div className="flex flex-wrap gap-3">
            <input
              value={relName}
              onChange={e => setRelName(e.target.value)}
              placeholder="To whom? (e.g. Mom, Boss)"
              className="flex-1 min-w-[120px] bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-peach"
            />
            <select
              value={relCategory}
              onChange={e => setRelCategory(e.target.value)}
              className="bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-peach"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!context.trim() || generating}
            className="w-full py-2.5 rounded-lg bg-peach/15 text-peach text-sm font-medium hover:bg-peach/25 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
            Generate Draft
          </button>
          {!fingerprint && (
            <p className="text-[11px] text-muted-foreground text-center">Build your fingerprint first for best results</p>
          )}
        </div>

        <div className="space-y-3">
          {drafts === null ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading drafts...</p>
          ) : drafts.length === 0 ? (
            <EmptyState icon={PenLine} title="No drafts yet" subtitle="Generate a message above" />
          ) : (
            drafts.map((draft, i) => {
              const scores = draft.authenticity_scores ? JSON.parse(draft.authenticity_scores) : {};
              const overall = scores.overall || 0;
              return (
                <StaggeredItem key={draft.id} index={i}>
                  <div className="glass rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">to {draft.relationship_name || 'unknown'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full capitalize bg-secondary/40 text-muted-foreground">{draft.relationship_category}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        draft.review_status === 'accepted' ? 'bg-leaf/10 text-leaf' :
                        draft.review_status === 'edited' ? 'bg-sky-accent/10 text-sky-accent' :
                        draft.review_status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                        'bg-peach/10 text-peach'
                      }`}>
                        {draft.review_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${overall}%`, backgroundColor: overall > 75 ? 'hsl(120 40% 58%)' : overall > 50 ? 'hsl(42 63% 55%)' : 'hsl(0 70% 50%)' }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{overall}% authentic</span>
                    </div>

                    {draft.authenticity_flags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {draft.authenticity_flags.map(f => (
                          <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{f.replace(/_/g, ' ')}</span>
                        ))}
                      </div>
                    )}

                    {reviewing === draft.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-peach min-h-[100px] resize-y"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(draft)} className="flex-1 py-1.5 rounded-lg bg-sky-accent/15 text-sky-accent text-xs font-medium hover:bg-sky-accent/25 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> Save Edit
                          </button>
                          <button onClick={() => setReviewing(null)} className="px-3 py-1.5 rounded-lg bg-secondary/30 text-muted-foreground text-xs">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{draft.edited_text || draft.generated_text}</p>
                    )}

                    {draft.review_status === 'pending' && reviewing !== draft.id && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(draft)} className="flex-1 py-1.5 rounded-lg bg-leaf/15 text-leaf text-xs font-medium hover:bg-leaf/25 flex items-center justify-center gap-1">
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button onClick={() => handleStartEdit(draft)} className="flex-1 py-1.5 rounded-lg bg-sky-accent/15 text-sky-accent text-xs font-medium hover:bg-sky-accent/25 flex items-center justify-center gap-1">
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleReject(draft)} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {draft.difference_analysis && (
                      <details>
                        <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground">Edit analysis</summary>
                        <pre className="text-[10px] text-muted-foreground mt-1 overflow-x-auto whitespace-pre-wrap">{draft.difference_analysis}</pre>
                      </details>
                    )}
                  </div>
                </StaggeredItem>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}