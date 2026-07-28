import { useState } from 'react';
import { Brain, Snowflake } from 'lucide-react';

const CATEGORIES = ['all', 'reflection', 'anomaly_flag', 'what_if', 'debugging', 'improvement_proposal'];

export default function ThoughtStream({ thoughts, accent }) {
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? thoughts : thoughts.filter(t => t.category === filter);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Private Thought Stream</h3>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Never shown to the user</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${filter === c ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}
          >{c.replace(/_/g, ' ')}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">No thoughts recorded in this category yet.</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {shown.map(t => (
            <div key={t.id} className={`text-xs border-l-2 pl-3 py-1 ${t.frozen ? 'border-destructive' : 'border-secondary'}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-muted-foreground/70">{new Date(t.created_date).toLocaleString()}</span>
                <span className="px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">{t.category.replace(/_/g, ' ')}</span>
                {t.frozen && <span className="flex items-center gap-1 text-destructive"><Snowflake className="w-3 h-3" />frozen</span>}
              </div>
              <p className="text-foreground/85 leading-relaxed">{t.content}</p>
              {t.freeze_reason && <p className="text-destructive mt-1">{t.freeze_reason}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}