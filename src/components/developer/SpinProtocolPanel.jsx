import { useState, useEffect } from 'react';
import { getSpinLog } from '@/lib/bison/evolution/cognitiveCircleManager';
import { Button } from '@/components/ui/button';
import { RotateCw, CircleDot, XCircle } from 'lucide-react';

export default function SpinProtocolPanel() {
  const [log, setLog] = useState([]);

  const refresh = () => setLog(getSpinLog());
  useEffect(() => { refresh(); }, []);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-purple-accent" />
          <h3 className="font-heading text-sm font-semibold">Spin Protocol Log</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh}>
          <RotateCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {log.length === 0 ? (
        <p className="text-xs text-muted-foreground">No spin protocol activations this session. Bison's responses have flowed without resource-constrained decision events.</p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-hide">
          {log.map((spin, i) => (
            <div key={i} className="rounded-lg bg-secondary/50 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground/90">{spin.triggerEvent}</span>
                <span className="text-muted-foreground/60">{spin.durationMs}ms</span>
              </div>
              <p className="text-muted-foreground">
                Paint available: {spin.paint}/100 · Generated {spin.generatedAlgorithms.length} algorithms
              </p>
              {spin.eliminated.length > 0 && (
                <div className="space-y-0.5">
                  {spin.eliminated.map((e, j) => (
                    <p key={j} className="flex items-start gap-1 text-muted-foreground/70">
                      <XCircle className="w-3 h-3 mt-0.5 shrink-0 text-destructive/60" />
                      <span>{e.type.replace(/_/g, ' ')} — {e.eliminationReason}</span>
                    </p>
                  ))}
                </div>
              )}
              <p className="flex items-center gap-1 text-leaf font-medium">
                <CircleDot className="w-3 h-3" />
                Constant Circle: {spin.constantCircle.type.replace(/_/g, ' ')} (cost {spin.constantCircle.energyCost})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}