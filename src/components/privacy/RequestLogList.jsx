import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { EmptyState } from '@/components/MicroAnimations';
import { ShieldOff, ArrowUpRight, Eye } from 'lucide-react';

const STATUS_STYLE = {
  COMPLETED: { color: 'hsl(120 40% 58%)', label: 'Sent' },
  ALLOWED: { color: 'hsl(120 40% 58%)', label: 'Allowed' },
  FAILED: { color: 'hsl(42 63% 55%)', label: 'Failed' },
  BLOCKED_FIREWALL: { color: 'hsl(0 70% 55%)', label: 'Blocked — firewall' },
  BLOCKED_CHANNEL: { color: 'hsl(0 70% 55%)', label: 'Blocked — channel closed' },
  BLOCKED_CONSENT: { color: 'hsl(0 70% 55%)', label: 'Blocked — no consent' },
  BLOCKED_LOCKDOWN: { color: 'hsl(0 70% 55%)', label: 'Blocked — lockdown' },
};

export default function RequestLogList({ filter = 'all' }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ExternalRequestLog.list('-created_date', 50)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const shown = logs.filter(l =>
    filter === 'all' ? true : filter === 'blocked' ? l.status?.startsWith('BLOCKED') : !l.status?.startsWith('BLOCKED')
  );

  if (loading) return <p className="text-xs text-muted-foreground px-1">Reading the log…</p>;

  if (!shown.length) {
    return (
      <EmptyState
        icon={filter === 'blocked' ? ShieldOff : Eye}
        title={filter === 'blocked' ? 'Nothing has been blocked' : 'No outbound requests'}
        subtitle="Every request Bison attempts appears here, sent or refused."
      />
    );
  }

  return (
    <div className="space-y-2">
      {shown.map(log => {
        const style = STATUS_STYLE[log.status] || { color: 'hsl(268 8% 60%)', label: log.status };
        return (
          <div key={log.id} className="p-3 rounded-lg glass framed">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: style.color }} />
                <p className="text-sm font-medium truncate">{log.destination}</p>
              </div>
              <span className="text-[10px] shrink-0" style={{ color: style.color }}>{style.label}</span>
            </div>
            {log.purpose && <p className="text-xs text-muted-foreground">Reason: {log.purpose}</p>}
            {log.payload_summary && <p className="text-xs text-muted-foreground">Data sent: {log.payload_summary}</p>}
            {log.block_reason && <p className="text-xs text-destructive/80">{log.block_reason}</p>}
            {log.sanitization_applied?.length > 0 && (
              <p className="text-[10px] text-leaf mt-1">Sanitized: {log.sanitization_applied.join(', ')}</p>
            )}
            {log.response_summary && <p className="text-xs text-muted-foreground mt-1">Returned: {log.response_summary}</p>}
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              {new Date(log.created_date).toLocaleString()}
              {typeof log.payload_bytes === 'number' ? ` · ${log.payload_bytes} bytes` : ''}
              {log.consent_used ? ' · consent recorded' : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}