import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { EmptyState } from '@/components/MicroAnimations';
import { Radio } from 'lucide-react';

const STATUS_COLOR = {
  COMPLETED: 'hsl(120 40% 58%)',
  QUARANTINED: 'hsl(42 63% 55%)',
  BLOCKED_ETHICS: 'hsl(0 70% 55%)',
  BLOCKED_SOVEREIGNTY: 'hsl(0 70% 55%)',
  NEGOTIATION_FAILED: 'hsl(0 70% 55%)',
  INTEGRITY_FAILED: 'hsl(0 70% 55%)',
  FAILED: 'hsl(42 63% 55%)',
};

export default function UstpTransmissionViewer() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    base44.entities.UstpTransmission.list('-created_date', 30).then(setLogs).catch(() => {});
  }, []);

  if (!logs.length) {
    return <EmptyState icon={Radio} title="No USTP transmissions yet" subtitle="Every transmission — sent, refused, or quarantined — appears here." />;
  }

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto">
      {logs.map(log => (
        <div key={log.id} className="p-3 rounded-lg bg-secondary/30 text-xs space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium truncate">{log.peer || 'unknown'} · {log.mode || '—'} · {log.direction}</span>
            <span className="shrink-0" style={{ color: STATUS_COLOR[log.status] || 'hsl(268 8% 60%)' }}>{log.status}</span>
          </div>
          {log.payload_summary && <p className="text-muted-foreground truncate">"{log.payload_summary}"</p>}
          {log.negotiation_summary && <p className="text-muted-foreground/70">Negotiated: {log.negotiation_summary}</p>}
          {log.block_reason && <p className="text-destructive/80">{log.block_reason}</p>}
          <p className="text-muted-foreground/60">
            {new Date(log.created_date).toLocaleString()}
            {typeof log.payload_bytes === 'number' ? ` · ${log.payload_bytes} B` : ''}
            {typeof log.semantic_fidelity === 'number' ? ` · fidelity ${(log.semantic_fidelity * 100).toFixed(0)}%` : ''}
            {log.integrity_hash ? ` · ${log.integrity_hash.slice(0, 10)}…` : ''}
          </p>
        </div>
      ))}
    </div>
  );
}