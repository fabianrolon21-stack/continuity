import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getThoughts, wipeThoughts } from '@/lib/bison/meta/privateThoughtEngine';
import { revertAction } from '@/lib/bison/autonomy/selfTuningManager';
import ThoughtStream from './ThoughtStream';
import AutonomousActionLog from './AutonomousActionLog';
import ProposalInbox from './ProposalInbox';
import { Radio, Pause, Play, Trash2, ShieldAlert } from 'lucide-react';

const accent = 'hsl(265 41% 64%)';

export default function FrrolonChannel({ user }) {
  const [thoughts, setThoughts] = useState([]);
  const [actions, setActions] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [paused, setPaused] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const load = () => Promise.all([
    getThoughts({ limit: 60 }),
    base44.entities.AutonomousAction.list('-created_date', 25).catch(() => []),
    base44.entities.DevelopmentProposal.list('-created_date', 15).catch(() => []),
  ]).then(([t, a, p]) => {
    setThoughts(t || []);
    setActions(a || []);
    setProposals(p || []);
  });

  useEffect(() => {
    setPaused(user?.autonomy_capabilities?.PRIVATE_THOUGHT === false);
    load();
  }, [user]);

  const togglePause = async () => {
    const next = !paused;
    setPaused(next);
    await base44.auth.updateMe({
      autonomy_capabilities: { ...(user?.autonomy_capabilities || {}), PRIVATE_THOUGHT: !next },
    }).catch(() => {});
  };

  const handleWipe = async () => {
    await wipeThoughts().catch(() => {});
    setConfirmWipe(false);
    load();
  };

  const handleRevert = async (action) => {
    await revertAction(action, user).catch(() => {});
    load();
  };

  const handleDecide = async (proposal, status) => {
    await base44.entities.DevelopmentProposal.update(proposal.id, { status }).catch(() => {});
    load();
  };

  const frozenCount = thoughts.filter(t => t.frozen).length;

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-5 border border-purple-accent/20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">FRROLON Channel</h3>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent">Admin only</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={togglePause} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              {paused ? <><Play className="w-3 h-3" />Resume thinking</> : <><Pause className="w-3 h-3" />Pause thinking</>}
            </button>
            <button onClick={() => setConfirmWipe(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
              <Trash2 className="w-3 h-3" />Wipe thoughts
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Bison's interior monologue. Thoughts are written but never read back into a response prompt, which is what makes a leak
          structurally impossible rather than merely filtered. Known limit: this runtime has no hardware keystore or at-rest
          encryption, so thoughts are access-controlled records, not a sealed vault.
        </p>

        {frozenCount > 0 && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-destructive/10">
            <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">
              {frozenCount} thought{frozenCount > 1 ? 's' : ''} frozen for contemplating a constitutional violation. Frozen thoughts are unreachable by any action path.
            </p>
          </div>
        )}

        {confirmWipe && (
          <div className="mt-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
            <p className="text-sm mb-2">Wipe the entire private thought log?</p>
            <div className="flex gap-2">
              <button onClick={handleWipe} className="text-xs px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground">Wipe</button>
              <button onClick={() => setConfirmWipe(false)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <ThoughtStream thoughts={thoughts} accent={accent} />
      <AutonomousActionLog actions={actions} accent={accent} onRevert={handleRevert} />
      <ProposalInbox proposals={proposals} accent={accent} onDecide={handleDecide} />
    </div>
  );
}