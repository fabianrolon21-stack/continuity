import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Network, ChevronDown, ChevronUp } from 'lucide-react';

const TAG_STYLES = {
  'Negotiable': 'bg-leaf/15 text-leaf',
  'Partially Negotiable': 'bg-gold/15 text-gold',
  'Non-Negotiable': 'bg-peach/15 text-peach',
  'Unknown': 'bg-secondary/50 text-muted-foreground',
};

export default function DendriticScanCard({ scan }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleFeedback = async (value) => {
    setFeedback(value);
    if (scan.scanId) {
      try { await base44.entities.DendriticScan.update(scan.scanId, { fit_feedback: value }); } catch (e) {}
    }
  };

  return (
    <div className="mt-2 glass rounded-xl overflow-hidden text-xs">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-2.5">
        <span className="flex items-center gap-2 text-purple-accent font-medium">
          <Network className="w-3.5 h-3.5" />
          Dendritic scan — {scan.classification.primary} system · {scan.dashboard.confidence}% confidence
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-3">
          {/* Possible Incentive Landscape */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Possible Incentive Landscape</p>
            {scan.hypotheses.map((h, i) => (
              <div key={i}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-foreground/90">{h.label}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{h.confidence}%</span>
                </div>
                <div className="h-1 rounded-full bg-secondary/50">
                  <div className="h-1 rounded-full bg-purple-accent/60" style={{ width: `${h.confidence}%` }} />
                </div>
              </div>
            ))}
            <div className="flex justify-between text-muted-foreground/70">
              <span>Unknown</span><span>{scan.unknownRemainder}%</span>
            </div>
          </div>

          {/* Negotiability */}
          {scan.variables.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Negotiability</p>
              <div className="flex flex-wrap gap-1.5">
                {scan.variables.map((v, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded-full ${TAG_STYLES[v.tag] || TAG_STYLES.Unknown}`}>
                    {v.name}: {v.tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Epistemic dashboard */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
            <span>Evidence quality: <span className="text-foreground/80">{scan.dashboard.evidenceQuality}</span></span>
            <span>Completeness: <span className="text-foreground/80">{scan.dashboard.completeness}</span></span>
            <span>Missing variables: <span className="text-foreground/80">{scan.dashboard.missingVariables}</span></span>
            <span>Stability: <span className="text-foreground/80">{scan.dashboard.stability}</span></span>
          </div>

          {/* Reality feedback */}
          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            <span className="text-muted-foreground">Did this fit?</span>
            {['yes', 'partially', 'no'].map(v => (
              <button
                key={v}
                onClick={() => handleFeedback(v)}
                disabled={!!feedback}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  feedback === v ? 'bg-purple-accent/20 text-purple-accent' : feedback ? 'opacity-30' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}