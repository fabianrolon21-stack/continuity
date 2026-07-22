// ═══════════════════════════════════════════════
// EVENT TIMELINE (Package I — Timeline)
// Visual timeline of recent events from the EventBus
// and entity creation history.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { eventBus } from '@/lib/events/eventBus';
import { Clock, BookOpen, ClipboardCheck, Brain, Heart, Sparkles, Users, Coins, Shield } from 'lucide-react';

const EVENT_ICONS = {
  JOURNAL_CREATED: BookOpen,
  JOURNAL_UPDATED: BookOpen,
  CHECKIN_COMPLETED: ClipboardCheck,
  BISON_INTERACTION: Brain,
  BISON_RESPONSE: Brain,
  MEMORY_SAVED: Heart,
  MEMORY_ARCHIVED: Heart,
  INSIGHT_GENERATED: Sparkles,
  INSIGHT_ACCEPTED: Sparkles,
  TOKEN_EARNED: Coins,
  TOKEN_SPENT: Coins,
  COMMUNITY_MESSAGE_POSTED: Users,
  THREAT_DETECTED: Shield,
  ACHIEVEMENT_UNLOCKED: Sparkles,
};

const EVENT_COLORS = {
  JOURNAL: 'hsl(48 67% 74%)',
  CHECKIN: 'hsl(42 63% 55%)',
  BISON: 'hsl(42 63% 55%)',
  MEMORY: 'hsl(120 40% 58%)',
  INSIGHT: 'hsl(265 41% 64%)',
  TOKEN: 'hsl(42 63% 55%)',
  COMMUNITY: 'hsl(21 73% 69%)',
  THREAT: 'hsl(0 70% 50%)',
  ACHIEVEMENT: 'hsl(48 67% 74%)',
};

function getEventColor(type) {
  if (type.startsWith('JOURNAL')) return EVENT_COLORS.JOURNAL;
  if (type.startsWith('CHECKIN')) return EVENT_COLORS.CHECKIN;
  if (type.startsWith('BISON')) return EVENT_COLORS.BISON;
  if (type.startsWith('MEMORY')) return EVENT_COLORS.MEMORY;
  if (type.startsWith('INSIGHT')) return EVENT_COLORS.INSIGHT;
  if (type.startsWith('TOKEN')) return EVENT_COLORS.TOKEN;
  if (type.startsWith('COMMUNITY')) return EVENT_COLORS.COMMUNITY;
  if (type.startsWith('THREAT')) return EVENT_COLORS.THREAT;
  if (type.startsWith('ACHIEVEMENT')) return EVENT_COLORS.ACHIEVEMENT;
  return 'hsl(268 8% 60%)';
}

export default function EventTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get EventBus history (recent in-session events)
    const busHistory = eventBus.getHistory(50);

    // Also fetch recent entity records for a richer timeline
    Promise.all([
      base44.entities.JournalEntry.list('-created_date', 5).catch(() => []),
      base44.entities.CheckIn.list('-created_date', 5).catch(() => []),
      base44.entities.SavedMemory.list('-created_date', 5).catch(() => []),
      base44.entities.BisonMessage.list('-created_date', 5).catch(() => []),
    ]).then(([journals, checkins, memories, messages]) => {
      const entityEvents = [];

      (journals || []).forEach(j => entityEvents.push({
        type: 'JOURNAL_CREATED',
        payload: { title: j.title, id: j.id },
        timestamp: j.created_date,
        source: 'journal_page',
      }));

      (checkins || []).forEach(c => entityEvents.push({
        type: 'CHECKIN_COMPLETED',
        payload: { mood: c.mood, date: c.date },
        timestamp: c.created_date,
        source: 'checkin_page',
      }));

      (memories || []).forEach(m => entityEvents.push({
        type: 'MEMORY_SAVED',
        payload: { text: m.text?.substring(0, 60) },
        timestamp: m.created_date,
        source: 'bison_chat',
      }));

      (messages || []).forEach(m => {
        if (m.role === 'bison') {
          entityEvents.push({
            type: 'BISON_RESPONSE',
            payload: { mode: m.mode, text: m.text?.substring(0, 60) },
            timestamp: m.created_date,
            source: 'bison_chat',
          });
        }
      });

      // Merge and sort by timestamp (most recent first)
      const allEvents = [...busHistory, ...entityEvents]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 30);

      setEvents(allEvents);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="w-6 h-6 mx-auto border-2 border-sky-accent/30 border-t-sky-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-sky-accent" />
        <h3 className="font-heading font-semibold text-sm text-sky-accent">Timeline</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">{events.length} recent events</span>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No events yet. Your journey will unfold here.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
          {events.map((event, i) => {
            const Icon = EVENT_ICONS[event.type] || Clock;
            const color = getEventColor(event.type);
            const time = new Date(event.timestamp);
            return (
              <div key={event.id || i} className="flex items-start gap-2.5">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  {i < events.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-3">
                  <p className="text-xs font-medium" style={{ color }}>{event.type.replace(/_/g, ' ').toLowerCase()}</p>
                  {event.payload?.text && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{event.payload.text}</p>}
                  {event.payload?.title && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{event.payload.title}</p>}
                  {event.payload?.mode && <p className="text-[10px] text-muted-foreground mt-0.5">Mode: {event.payload.mode}</p>}
                  <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                    {time.toLocaleDateString()} · {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}