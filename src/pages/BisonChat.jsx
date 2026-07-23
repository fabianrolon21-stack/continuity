import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { processInteraction, RESPONSE_MODES, createMemoryFromMessage } from '@/lib/bison/pipeline';
import { calculateTrustScore, createTrustEvent, TRUST_EVENTS } from '@/lib/bison/trustScoreCalculator';
import { awardTokens } from '@/lib/tokens';
import { PageHeader, EmptyState } from '@/components/MicroAnimations';
import { Send, Brain, Repeat, Bookmark, Sparkles, Loader2, Zap, Droplet, Heart, ShieldAlert, Lightbulb, ExternalLink, PauseCircle } from 'lucide-react';

const MODE_COLORS = {
  REFLECT: 'hsl(265 41% 64%)',
  STABILIZE: 'hsl(199 56% 64%)',
  EXPLORE: 'hsl(120 40% 58%)',
  AFFIRM: 'hsl(21 73% 69%)',
  CLARIFY: 'hsl(48 67% 74%)',
  GROUND: 'hsl(0 70% 55%)',
};

export default function BisonChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [user, setUser] = useState(null);
  const [needsState, setNeedsState] = useState(null);
  const [backupReminder, setBackupReminder] = useState(false);
  const [threatNotification, setThreatNotification] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.companion_state) {
        setNeedsState({
          hunger: u.companion_state.hunger ?? 80,
          hydration: u.companion_state.hydration ?? 80,
          energy: u.companion_state.energy ?? 80,
        });
      }
    }).catch(() => {});
    base44.entities.BisonMessage.list('-created_date', 50).then(msgs => {
      setMessages((msgs || []).reverse());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, processing]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || processing) return;
    setInput('');
    setProcessing(true);

    const recentHistory = messages.slice(-10).map(m => ({ role: m.role, text: m.text, intent: m.intent, domain: m.domain }));

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    try {
      await base44.entities.BisonMessage.create({ role: 'user', text });
    } catch (e) {}

    try {
      const result = await processInteraction(text, recentHistory, { isDeveloper: user?.role === 'admin' });

      if (result.needsState) setNeedsState(result.needsState);
      if (result.trustScoreEvent) {
        try {
          const cu = await base44.auth.me();
          const tsState = cu?.trust_score_state || { score: 100, breakdown: [], sessionStart: new Date().toISOString() };
          const updated = calculateTrustScore(tsState, result.trustScoreEvent);
          await base44.auth.updateMe({ trust_score_state: updated });
        } catch (e) {}
      }
      if (result.threats && result.threats.length > 0) {
        setThreatNotification(result.threats[0]);
      }
      if (result.triggerUI === 'show_backup_reminder') {
        setBackupReminder(true);
        try {
          const u = await base44.auth.me();
          const cs = u?.companion_state || {};
          cs.lastBackupReminder = new Date().toISOString();
          await base44.auth.updateMe({ companion_state: cs });
        } catch (e) {}
      }

      const bisonMsg = {
        role: 'bison',
        text: result.text,
        mode: result.mode,
        is_garden_candidate: result.isGardenCandidate,
        has_insight: !!result.insightContext?.detected,
        intent: result.state?.intent,
        domain: result.state?.domain,
        emotional_tone: result.state?.emotionalTone,
        recurrence_detected: result.recurrence?.detected,
        oracle_consulted: !!result.oracleConsultation,
        oracle_model: result.oracleConsultation?.consultationLog?.message
          ? (() => { try { return JSON.parse(result.oracleConsultation.consultationLog.message).model; } catch (e) { return null; } })()
          : null,
        breaker_tripped: !!result.emotionalStateSnapshot?.breakerTripped,
      };
      setMessages(prev => [...prev, bisonMsg]);

      try {
        await base44.entities.BisonMessage.create({
          role: 'bison',
          text: result.text,
          mode: result.mode,
          is_garden_candidate: result.isGardenCandidate,
          intent: result.state?.intent,
          domain: result.state?.domain,
          emotional_tone: result.state?.emotionalTone,
          recurrence_detected: result.recurrence?.detected,
        });
      } catch (e) {}
    } catch (e) {
      console.error('[Bison Pipeline Error]', e);
      setMessages(prev => [...prev, { role: 'bison', text: `Something went wrong: ${e?.message || e}. Please try again.`, mode: 'GROUND' }]);
    }
    setProcessing(false);
  };

  const handleRemember = async (msg, index) => {
    if (savedIds.has(index)) return;
    try {
      const memory = createMemoryFromMessage(msg.text);
      await base44.entities.SavedMemory.create({ ...memory, source: 'bison_conversation' });
      try {
        const cu = await base44.auth.me();
        const tsState = cu?.trust_score_state || { score: 100, breakdown: [], sessionStart: new Date().toISOString() };
        const updated = calculateTrustScore(tsState, createTrustEvent(TRUST_EVENTS.MEMORY_CONFIRMED));
        await base44.auth.updateMe({ trust_score_state: updated });
      } catch (e) {}
      setSavedIds(prev => new Set([...prev, index]));
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen-safe lg:h-screen">
      <PageHeader title="Bison" subtitle="Your living companion" accent="hsl(42 63% 55%)" />

      <div className="flex-1 overflow-y-auto px-4 lg:px-10 pb-4 space-y-4">
        {messages.length === 0 && (
          <EmptyState
            icon={Brain}
            title="Bison is here"
            subtitle="Share what's on your mind. Bison listens, reflects, and walks alongside you."
          />
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'w-full'}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gold/10 text-foreground'
                    : 'glass text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.role === 'bison' && msg.mode && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${MODE_COLORS[msg.mode]}20`, color: MODE_COLORS[msg.mode] }}
                    >
                      {msg.mode}
                    </span>
                    {msg.recurrence_detected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent flex items-center gap-1">
                        <Repeat className="w-2.5 h-2.5" /> recurring
                      </span>
                    )}
                    {msg.is_garden_candidate && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-leaf/15 text-leaf flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> garden
                      </span>
                    )}
                    {msg.has_insight && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-starlight/15 text-starlight flex items-center gap-1">
                        <Lightbulb className="w-2.5 h-2.5" /> insight
                      </span>
                    )}
                    {msg.oracle_consulted && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-accent/15 text-sky-accent flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" /> oracle{msg.oracle_model ? `: ${msg.oracle_model}` : ''}
                      </span>
                    )}
                    {msg.breaker_tripped && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive flex items-center gap-1">
                        <PauseCircle className="w-2.5 h-2.5" /> overloaded
                      </span>
                    )}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <button
                  onClick={() => handleRemember(msg, i)}
                  disabled={savedIds.has(i)}
                  className={`text-[10px] mt-1 ml-2 flex items-center gap-1 transition-colors ${
                    savedIds.has(i) ? 'text-leaf' : 'text-muted-foreground hover:text-gold'
                  }`}
                >
                  <Bookmark className="w-3 h-3" />
                  {savedIds.has(i) ? 'Remembered' : 'Remember this'}
                </button>
              )}
            </div>
          </div>
        ))}
        {processing && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-gold animate-spin" />
              <span className="text-sm text-muted-foreground">Bison is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 lg:px-10 pb-safe lg:pb-6 pt-2">
        {threatNotification && (
          <div className="mb-2 glass rounded-xl px-4 py-2 flex items-center justify-between text-xs border border-peach/30">
            <span className="flex items-center gap-2 text-peach">
              <ShieldAlert className="w-3.5 h-3.5" />
              Possible {threatNotification.category.toLowerCase().replace(/_/g, ' ')} detected in your message. Be cautious.
            </span>
            <button onClick={() => setThreatNotification(null)} className="text-muted-foreground hover:text-foreground ml-2 shrink-0">Dismiss</button>
          </div>
        )}
        {backupReminder && (
          <div className="mb-2 glass rounded-xl px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">It's been a while since your last backup. Consider exporting your Continuity Archive.</span>
            <button onClick={() => setBackupReminder(false)} className="text-gold hover:underline ml-2 shrink-0">Dismiss</button>
          </div>
        )}
        {needsState && (
          <div className="mb-2 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-gold" /> {Math.round(needsState.energy)}</span>
            <span className="flex items-center gap-1"><Droplet className="w-3 h-3 text-sky-accent" /> {Math.round(needsState.hydration)}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-peach" /> {Math.round(needsState.hunger)}</span>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Share what's on your mind..."
            rows={1}
            className="flex-1 glass rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-1 focus:ring-gold/40 min-h-[48px] max-h-32"
            style={{ color: 'hsl(40 20% 92%)' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || processing}
            className="w-12 h-12 rounded-xl bg-gold text-background flex items-center justify-center disabled:opacity-30 transition-opacity shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}