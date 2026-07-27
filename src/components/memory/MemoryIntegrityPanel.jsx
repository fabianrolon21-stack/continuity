import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { detectConflicts, resolveConflict } from '@/lib/bison/memory/conflictResolver';
import { compressOldHistory } from '@/lib/bison/memory/memoryCompression';
import MemoryVerificationCard from '@/components/memory/MemoryVerificationCard';
import { EmptyState } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, Layers, Loader2 } from 'lucide-react';

export default function MemoryIntegrityPanel() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compressing, setCompressing] = useState(false);
  const [compressResult, setCompressResult] = useState(null);
  const [resolvingKey, setResolvingKey] = useState(null);

  const load = () => {
    base44.entities.SavedMemory.list('-created_date', 100).then(data => {
      setMemories(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpdated = (updated) => {
    setMemories(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
  };

  const handleResolve = async (conflict, keepA) => {
    const key = `${conflict.a.id}_${conflict.b.id}`;
    setResolvingKey(key);
    try {
      const keep = keepA ? conflict.a : conflict.b;
      const drop = keepA ? conflict.b : conflict.a;
      const { kept, contradicted } = await resolveConflict(keep, drop);
      setMemories(prev => prev.map(m => m.id === kept.id ? { ...m, ...kept } : m.id === contradicted.id ? { ...m, ...contradicted } : m));
    } catch (e) {}
    setResolvingKey(null);
  };

  const handleCompress = async () => {
    setCompressing(true);
    setCompressResult(null);
    try {
      const result = await compressOldHistory();
      setCompressResult(result);
      if (result.compressed > 0) load();
    } catch (e) {
      setCompressResult({ compressed: 0, reason: e?.message || 'Compression failed.' });
    }
    setCompressing(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-sky-accent animate-spin" /></div>;
  }

  const conflicts = detectConflicts(memories);

  return (
    <div className="space-y-4">
      {/* Compression */}
      <div className="glass rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-accent" />
          <div>
            <p className="text-sm font-medium">Memory Compression</p>
            <p className="text-xs text-muted-foreground">Summarize conversation history older than 30 days into semantic memories. Originals are preserved.</p>
          </div>
        </div>
        <Button onClick={handleCompress} disabled={compressing} variant="outline" className="border-border text-xs">
          {compressing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
          {compressing ? 'Compressing...' : 'Compress older history'}
        </Button>
        {compressResult && (
          <p className={`w-full text-xs ${compressResult.compressed > 0 ? 'text-leaf' : 'text-muted-foreground'}`}>
            {compressResult.compressed > 0
              ? `Created ${compressResult.compressed} semantic memories from ${compressResult.messageCount} messages (${compressResult.period}).`
              : compressResult.reason}
          </p>
        )}
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="glass rounded-xl p-4 border border-destructive/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-sm font-medium">Knowledge Conflicts ({conflicts.length})</p>
          </div>
          <div className="space-y-3">
            {conflicts.map(c => {
              const key = `${c.a.id}_${c.b.id}`;
              return (
                <div key={key} className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground mb-2">{c.reason} Choose which reflects your current reality — the other will be marked contradicted, not deleted.</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm flex-1">"{c.a.corrected_text || c.a.text}"</p>
                      <Button disabled={resolvingKey === key} onClick={() => handleResolve(c, true)} variant="outline" className="border-border text-xs h-7 shrink-0">Keep this</Button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm flex-1">"{c.b.corrected_text || c.b.text}"</p>
                      <Button disabled={resolvingKey === key} onClick={() => handleResolve(c, false)} variant="outline" className="border-border text-xs h-7 shrink-0">Keep this</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Memory list */}
      {memories.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No saved memories yet" subtitle="Memories saved from Bison conversations appear here with full provenance and verification history." />
      ) : (
        <div className="space-y-3">
          {memories.map(m => (
            <MemoryVerificationCard key={m.id} memory={m} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}