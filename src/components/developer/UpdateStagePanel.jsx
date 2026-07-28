import { useState, useEffect } from 'react';
import { listStages, crawlForUpdates } from '@/lib/bison/updates/liveUpdateCrawler';
import { processPending, approveStage, markDeployed, rollbackStage, dismissStage } from '@/lib/bison/updates/updateManager';
import { Package, RefreshCw, Check, Rocket, Undo2, X } from 'lucide-react';

const accent = 'hsl(199 56% 64%)';

const STAGE_STYLES = {
  STAGED: 'bg-gold/15 text-gold',
  APPROVED: 'bg-sky-accent/15 text-sky-accent',
  DEPLOYED: 'bg-leaf/15 text-leaf',
  SANDBOX_FAILED: 'bg-destructive/15 text-destructive',
  ROLLED_BACK: 'bg-destructive/15 text-destructive',
};

export default function UpdateStagePanel({ user }) {
  const [stages, setStages] = useState([]);
  const [crawling, setCrawling] = useState(false);

  const load = () => listStages().then(setStages);
  useEffect(() => { load(); }, []);

  const crawl = async () => {
    setCrawling(true);
    await crawlForUpdates(user, { force: true }).catch(() => {});
    await processPending(user).catch(() => {});
    await load();
    setCrawling(false);
  };

  const act = async (fn, stage) => {
    await fn(stage, user).catch(() => {});
    load();
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" style={{ color: accent }} />
          <h3 className="font-heading font-semibold text-sm">Update Lifecycle</h3>
        </div>
        <button onClick={crawl} disabled={crawling} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3 h-3 ${crawling ? 'animate-spin' : ''}`} />
          {crawling ? 'Crawling…' : 'Crawl now'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Bison checks its watched dependencies against the public registry every six hours and records the registry's own
        integrity hash. It stops at STAGED by design — it has no filesystem and cannot install anything. You deploy; it reports.
        There is no signed release feed here, so integrity is HTTPS plus a published hash, which is weaker than signature verification.
      </p>

      {stages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No update stages recorded. Everything watched is current.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {stages.map(s => (
            <div key={s.id} className="text-xs border border-border/50 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-medium">{s.package_name}: {s.current_version} → {s.discovered_version}</span>
                <span className={`px-2 py-0.5 rounded-full ${STAGE_STYLES[s.stage] || 'bg-secondary text-muted-foreground'}`}>{s.stage}</span>
              </div>
              {s.risk_notes && <p className="text-muted-foreground mt-1">{s.risk_notes}</p>}
              {s.test_notes && <p className="text-muted-foreground/80 mt-1">{s.test_notes}</p>}
              <p className="text-muted-foreground/50 mt-1 break-all">hash: {s.integrity_hash} · {s.source}</p>
              {s.approved_by && <p className="text-muted-foreground/60 mt-0.5">approved by {s.approved_by}</p>}

              <div className="flex flex-wrap gap-2 mt-2">
                {s.stage === 'STAGED' && (
                  <button onClick={() => act(approveStage, s)} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-leaf/15 text-leaf">
                    <Check className="w-3 h-3" />Approve
                  </button>
                )}
                {s.stage === 'APPROVED' && (
                  <button onClick={() => act(markDeployed, s)} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-accent/15 text-sky-accent">
                    <Rocket className="w-3 h-3" />Mark deployed
                  </button>
                )}
                {s.deployed && (
                  <button onClick={() => act(rollbackStage, s)} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-destructive/10 text-destructive">
                    <Undo2 className="w-3 h-3" />Roll back
                  </button>
                )}
                {!['DEPLOYED', 'DISMISSED'].includes(s.stage) && (
                  <button onClick={() => act(dismissStage, s)} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-muted-foreground">
                    <X className="w-3 h-3" />Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}