import { useState } from 'react';
import { CONCEPTS, registrySummary } from '@/lib/bison/ustp/conceptRegistry';

export default function UstpConceptExplorer() {
  const [query, setQuery] = useState('');
  const summary = registrySummary();
  const shown = CONCEPTS.filter(c =>
    !query || c.ucid.includes(query.toLowerCase()) || c.meaning.toLowerCase().includes(query.toLowerCase()) ||
    c.aliases.some(a => a.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search concepts…"
          className="flex-1 bg-secondary/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold/40"
        />
        <span className="text-[10px] text-muted-foreground shrink-0">registry v{summary.version} · {summary.conceptCount} concepts</span>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {shown.map(c => (
          <div key={c.ucid} className="p-3 rounded-lg bg-secondary/30 text-xs space-y-0.5">
            <p className="font-mono text-gold">{c.ucid}</p>
            <p>{c.meaning}</p>
            <p className="text-muted-foreground">
              {c.ontology} · aliases: {c.aliases.join(', ') || '—'}
              {Object.keys(c.relationships).length > 0 && ` · ${Object.entries(c.relationships).map(([k, v]) => `${k}: ${v.length}`).join(', ')}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}