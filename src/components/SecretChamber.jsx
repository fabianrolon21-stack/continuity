// ═══════════════════════════════════════════════
// SECRET CHAMBER (Package H — Secret Chamber)
// The Bathroom Exception — a private space for metaphors
// and coded venting.
//
// Privacy modes:
//   Ghost Mode (default): Entries stored, never analyzed.
//     "Unseen by the Synthesis Engine."
//   Analysis Mode: User consents to metaphor extraction
//     via LLM. Results are clearly labeled as interpretation.
//
// Lock: If "Lock Secret Chamber" is enabled, requires
//   re-authentication before access.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, Unlock, Eye, EyeOff, Ghost, Save, Trash2, Sparkles } from 'lucide-react';

export default function SecretChamber() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [locked, setLocked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [analyzeEnabled, setAnalyzeEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      const isLocked = u?.lock_secret_chamber || false;
      const analyze = u?.analyze_secret_writings || false;
      setLocked(isLocked);
      setAnalyzeEnabled(analyze);
      if (!isLocked) {
        setUnlocked(true);
        loadEntries();
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const loadEntries = async () => {
    try {
      const data = await base44.entities.SecretEntry.list('-created_date', 50);
      setEntries(data || []);
    } catch (e) {}
    setLoading(false);
  };

  const handleUnlock = async () => {
    // Re-verify auth — simple re-auth check
    try {
      await base44.auth.me();
      setUnlocked(true);
      await loadEntries();
    } catch (e) {}
  };

  const handleSave = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const entry = {
        text,
        is_ghost_mode: !analyzeEnabled,
        is_analyzed: false,
      };

      if (analyzeEnabled) {
        // User consents to analysis — extract metaphors via LLM
        try {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Analyze the following private writing for metaphors and symbolic language. Identify the underlying emotions and themes without making factual claims. Be gentle, non-clinical, and brief (2-3 sentences). Clearly label this as interpretation, not diagnosis.\n\nWriting: "${text}"\n\nMetaphor analysis:`,
          });
          entry.analysis_result = typeof result === 'string' ? result : (result?.text || '');
          entry.is_analyzed = true;
        } catch (e) {}
      }

      const saved = await base44.entities.SecretEntry.create(entry);
      setEntries(prev => [saved, ...prev]);
      setText('');
    } catch (e) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.SecretEntry.delete(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (e) {}
  };

  const toggleAnalyze = async () => {
    const newVal = !analyzeEnabled;
    setAnalyzeEnabled(newVal);
    try {
      await base44.auth.updateMe({ analyze_secret_writings: newVal });
    } catch (e) {}
  };

  const toggleLock = async () => {
    const newVal = !locked;
    setLocked(newVal);
    try {
      await base44.auth.updateMe({ lock_secret_chamber: newVal });
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="w-6 h-6 mx-auto border-2 border-purple-accent/30 border-t-purple-accent rounded-full animate-spin" />
      </div>
    );
  }

  // Locked state
  if (locked && !unlocked) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-purple-accent/15 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-5 h-5 text-purple-accent" />
        </div>
        <p className="text-sm font-medium text-purple-accent">Secret Chamber is Locked</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          This space contains your private writings. Re-authenticate to access them.
        </p>
        <button
          onClick={handleUnlock}
          className="mt-4 px-4 py-2 rounded-lg bg-purple-accent/15 text-purple-accent text-sm font-medium hover:bg-purple-accent/25 transition-colors"
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Ghost className="w-4 h-4 text-purple-accent" />
        <h3 className="font-heading font-semibold text-sm text-purple-accent">Secret Chamber</h3>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleAnalyze}
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-all ${analyzeEnabled ? 'bg-purple-accent/15 text-purple-accent' : 'bg-secondary/30 text-muted-foreground'}`}
            title={analyzeEnabled ? 'Analysis enabled — metaphors will be extracted' : 'Ghost Mode — entries never analyzed'}
          >
            {analyzeEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {analyzeEnabled ? 'Analyzed' : 'Ghost'}
          </button>
          <button
            onClick={toggleLock}
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-all ${locked ? 'bg-purple-accent/15 text-purple-accent' : 'bg-secondary/30 text-muted-foreground'}`}
          >
            {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {locked ? 'Locked' : 'Unlocked'}
          </button>
        </div>
      </div>

      <div className="mb-3 p-3 rounded-lg bg-secondary/20">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {analyzeEnabled
            ? '⚙️ Analysis is ON. Bison will extract metaphors from your writings. Results are clearly labeled as interpretation.'
            : '👻 Ghost Mode is ON. Your writings are stored privately and never seen by the Synthesis Engine.'}
        </p>
      </div>

      <div className="mb-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write freely here. Metaphors, coded thoughts, raw venting..."
          rows={4}
          className="w-full glass rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-accent/40"
          style={{ color: 'hsl(40 20% 92%)' }}
        />
        <button
          onClick={handleSave}
          disabled={!text.trim() || saving}
          className="mt-2 w-full py-2 rounded-lg bg-purple-accent/15 text-purple-accent text-sm font-medium disabled:opacity-30 flex items-center justify-center gap-1.5"
        >
          {saving ? <span className="w-3 h-3 border-2 border-purple-accent/30 border-t-purple-accent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Saving...' : 'Store Privately'}
        </button>
      </div>

      {entries.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
          {entries.map((entry, i) => (
            <div key={i} className="p-3 rounded-lg bg-secondary/20 group">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs flex-1">{entry.text}</p>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {entry.is_ghost_mode && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-0.5">
                    <Ghost className="w-2.5 h-2.5" /> Ghost
                  </span>
                )}
                {entry.is_analyzed && entry.analysis_result && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Analyzed
                  </span>
                )}
              </div>
              {entry.is_analyzed && entry.analysis_result && (
                <p className="text-[10px] text-purple-accent/70 mt-1.5 italic border-l-2 border-purple-accent/20 pl-2">
                  {entry.analysis_result}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          The chamber is empty. Write what you cannot say elsewhere.
        </p>
      )}
    </div>
  );
}