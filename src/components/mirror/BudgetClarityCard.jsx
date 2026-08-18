import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { computeFinancialClarity } from '@/lib/bison/finance/financialPriorityEngine';

// §7 — constraint map, not moral judgment.
export default function BudgetClarityCard() {
  const [balance, setBalance] = useState('');
  const [obligations, setObligations] = useState('');
  const parsed = parseFloat(balance);
  const clarity = !isNaN(parsed)
    ? computeFinancialClarity(parsed, [{ label: 'Known obligations', amount: parseFloat(obligations) || 0, priority: 'OBLIGATION' }])
    : null;
  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <p className="text-xs font-medium text-starlight">Financial clarity — a constraint, not a verdict</p>
      <div className="grid grid-cols-2 gap-2">
        <Input value={balance} onChange={event => setBalance(event.target.value)} placeholder="Current balance $" inputMode="decimal" className="bg-secondary/40 border-border text-xs h-8" />
        <Input value={obligations} onChange={event => setObligations(event.target.value)} placeholder="Known obligations $" inputMode="decimal" className="bg-secondary/40 border-border text-xs h-8" />
      </div>
      {clarity && (
        <div className="text-[11px] space-y-0.5">
          <p><span className="text-muted-foreground">Remaining discretionary:</span> <span className={clarity.remainingDiscretionary < 0 ? 'text-destructive' : 'text-leaf'}>${clarity.remainingDiscretionary.toLocaleString()}</span> <span className="text-muted-foreground">± ${clarity.uncertainty}</span></p>
          <p className="text-muted-foreground/80">{clarity.note}</p>
        </div>
      )}
    </div>
  );
}