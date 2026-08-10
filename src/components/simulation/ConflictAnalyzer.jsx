import { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { analyzeConflict } from '@/lib/bison/simulation/conflictAnalysis';

const ESCALATION_COLORS = ['hsl(120 40% 58%)', 'hsl(120 40% 58%)', 'hsl(42 63% 55%)', 'hsl(21 73% 69%)', 'hsl(0 70% 55%)'];

export default function ConflictAnalyzer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Describe what you observed — what happened, what you've already tried, what you need."
        className="min-h-[110px] text-sm"
      />
      <Button onClick={() => setResult(analyzeConflict(text))} disabled={!text.trim()} className="w-full">
        Analyze the situation
      </Button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="space-y-4">
          <Section title="Your goals" items={result.goals} />
          <Section title="Likely constraints" items={result.constraints} />

          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Possible explanations</p>
            <div className="space-y-2">
              {result.explanations.map(e => (
                <div key={e.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground/85">{e.label}</span>
                    <span className="text-muted-foreground font-mono">{e.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-sky-accent transition-all duration-700" style={{ width: `${e.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Options, lowest escalation first</p>
            <div className="space-y-2">
              {result.options.map(o => (
                <div key={o.id} className="glass framed rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium" style={{ color: ESCALATION_COLORS[o.escalation] }}>{o.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">escalation {o.escalation}/4</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{o.detail}</p>
                  <p className="text-xs text-foreground/70 mt-1.5 italic">{o.outcome}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass framed rounded-xl p-3 border-gold/30">
            <p className="text-xs text-gold font-medium">Recommended response</p>
            <p className="text-sm text-foreground/90 mt-1">{result.guidance}</p>
            <p className="text-[11px] text-muted-foreground mt-2">{result.uncertainty}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map(i => <li key={i} className="text-xs text-foreground/85">· {i}</li>)}
      </ul>
    </div>
  );
}