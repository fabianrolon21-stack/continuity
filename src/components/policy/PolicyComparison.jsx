import { METRICS } from '@/lib/bison/policy/policySimulator';
import { getFramework } from '@/lib/bison/policy/frameworks';

export default function PolicyComparison({ scenarios, onRemove }) {
  if (!scenarios.length) {
    return <p className="text-xs text-muted-foreground">Run a simulation and pin it to compare up to four scenarios side by side.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="py-1.5 pr-2 font-medium">Metric</th>
            {scenarios.map((s, i) => (
              <th key={i} className="py-1.5 px-2 font-medium">
                <div className="flex items-center gap-1">
                  <span className="truncate max-w-[90px]">{String.fromCharCode(65 + i)} · {getFramework(s.framework).label}</span>
                  <button onClick={() => onRemove(i)} className="text-destructive/70 hover:text-destructive">×</button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map(m => {
            const vals = scenarios.map(s => s.results.find(r => r.id === m.id));
            const best = m.lowerIsBetter ? Math.min(...vals.map(v => v.expected)) : Math.max(...vals.map(v => v.expected));
            return (
              <tr key={m.id} className="border-t border-border/40">
                <td className="py-1.5 pr-2 text-muted-foreground">{m.label}</td>
                {vals.map((v, i) => (
                  <td key={i} className="py-1.5 px-2 font-mono" style={{ color: vals.length > 1 && v.expected === best ? 'hsl(120 40% 58%)' : undefined }}>
                    {v.expected > 0 ? '+' : ''}{v.expected}
                    <span className="opacity-50"> [{v.interval[0]},{v.interval[1]}]</span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[10px] text-muted-foreground mt-2">Green marks the numerically strongest value per metric — a highlight, not a recommendation. Intervals overlap heavily; differences within intervals are not meaningful.</p>
    </div>
  );
}