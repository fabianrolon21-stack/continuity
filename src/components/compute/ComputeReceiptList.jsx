import { useEffect, useState } from 'react';
import { loadReceipts } from '@/lib/bison/compute/computeClient';

const COLORS = { VERIFIED: 'hsl(120 40% 58%)', REJECTED: 'hsl(0 70% 50%)', ISSUED: 'hsl(268 8% 60%)', EXPIRED: 'hsl(268 8% 60%)' };

export default function ComputeReceiptList({ refreshKey }) {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => { loadReceipts().then(setReceipts); }, [refreshKey]);

  if (receipts.length === 0) {
    return <p className="text-[10px] text-muted-foreground">No task receipts yet. This list is read back from the server's records, not from local counters.</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto space-y-1.5">
      {receipts.map(r => (
        <div key={r.id} className="p-2 rounded-lg bg-secondary/25">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium truncate">{r.task_type}</p>
            <span className="text-[9px] font-mono shrink-0" style={{ color: COLORS[r.status] }}>{r.status}</span>
          </div>
          <p className="text-[9px] text-muted-foreground">
            range {r.params?.start?.toLocaleString()}–{r.params?.end?.toLocaleString()} · difficulty {r.difficulty}
            {r.worker_ms ? ` · ${r.worker_ms} ms` : ''}
          </p>
          <p className="text-[9px]" style={{ color: r.credits_awarded ? 'hsl(120 40% 58%)' : 'hsl(268 8% 60%)' }}>
            {r.credits_awarded ? `+${r.credits_awarded} credits` : '0 credits'}
            {r.reject_reason ? ` — ${r.reject_reason}` : ''}
          </p>
        </div>
      ))}
    </div>
  );
}