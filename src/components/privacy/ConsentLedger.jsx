import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { grantConsent, revokeConsent } from '@/lib/bison/privacy/dataSovereigntyGuard';
import { EmptyState } from '@/components/MicroAnimations';
import { FileCheck } from 'lucide-react';

const CATEGORIES = [
  { id: 'current_question', label: 'Current Question', note: 'The single question you are asking, nothing around it.' },
  { id: 'anonymous_context', label: 'Anonymous Context', note: 'Stripped context with no identifiers.' },
  { id: 'location', label: 'Location', note: 'Approximate area, used for weather.' },
  { id: 'conversation', label: 'Conversation', note: 'Recent messages in the current thread.' },
  { id: 'journal', label: 'Journal', note: 'Your written entries. Rarely needed.' },
  { id: 'performance_metrics', label: 'Performance Metrics', note: 'Anonymous timing and error counts.' },
  { id: 'images', label: 'Images', note: 'Files you attach.' },
  { id: 'voice', label: 'Voice', note: 'Recorded audio for transcription.' },
];

const DURATIONS = [
  { id: 'once', label: 'Once' },
  { id: 'one_hour', label: 'One hour' },
  { id: 'today', label: 'Today' },
  { id: 'until_revoked', label: 'Until revoked' },
  { id: 'permanent', label: 'Permanent' },
];

const isLive = (r) =>
  r.granted && !r.revoked && !r.consumed &&
  (!r.expires_at || new Date(r.expires_at) > new Date());

export default function ConsentLedger() {
  const [records, setRecords] = useState([]);
  const [duration, setDuration] = useState('until_revoked');

  const refresh = () => base44.entities.DataSharingConsent.list('-created_date', 100).then(setRecords).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const activeFor = (cat) => records.find(r => r.category === cat && isLive(r));

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-5">
        <h3 className="font-heading font-semibold text-sm mb-1">Consent Categories</h3>
        <p className="text-xs text-muted-foreground mb-3">Nothing in a category can be sent until you grant it. Revoking blocks future requests immediately.</p>
        <div className="mb-4">
          <p className="text-[11px] text-muted-foreground mb-1.5">New grants last for:</p>
          <div className="flex gap-1.5 flex-wrap">
            {DURATIONS.map(d => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${duration === d.id ? 'border-leaf text-leaf bg-leaf/10' : 'border-border text-muted-foreground'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {CATEGORIES.map(c => {
            const active = activeFor(c.id);
            return (
              <div key={c.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm">{c.label}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{c.note}</p>
                </div>
                <button
                  onClick={async () => {
                    if (active) await revokeConsent(active.id);
                    else await grantConsent(c.id, null, c.note, { duration });
                    refresh();
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg shrink-0 ${active ? 'bg-secondary text-destructive' : 'bg-secondary/40 text-muted-foreground'}`}
                >
                  {active ? 'Revoke' : 'Grant'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="font-heading font-semibold text-sm mb-3">Consent History</h3>
        {records.length === 0 ? (
          <EmptyState icon={FileCheck} title="No consent has been given yet" subtitle="That is the default state." />
        ) : (
          <div className="space-y-2">
            {records.map(r => (
              <div key={r.id} className="text-xs flex items-center justify-between gap-2 py-1.5 border-b border-border/40 last:border-0">
                <span className="truncate">{r.category.replace(/_/g, ' ')}</span>
                <span className={r.revoked || r.consumed || (r.expires_at && new Date(r.expires_at) <= new Date()) ? 'text-destructive/80 shrink-0' : 'text-leaf shrink-0'}>
                  {r.revoked ? `revoked ${new Date(r.revoked_at).toLocaleDateString()}`
                    : r.consumed ? 'used (single request)'
                    : r.expires_at && new Date(r.expires_at) <= new Date() ? 'expired'
                    : `granted · ${(r.duration || 'until_revoked').replace(/_/g, ' ')}${r.expires_at ? ` · until ${new Date(r.expires_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}