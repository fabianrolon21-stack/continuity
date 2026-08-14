// §25 — developer overlay. Enable with ?bison_debug=1 on any page
// showing the sanctuary.

import { bisonSimulation } from '@/lib/bison/life/bisonSimulation';
import { BEHAVIORS } from '@/lib/sanctuary/bisonBehavior';

const FORCE = [
  ['IDLE', BEHAVIORS.IDLE],
  ['WALK', BEHAVIORS.WALK],
  ['PLAY', BEHAVIORS.PLAY],
  ['SLEEP', BEHAVIORS.SLEEP],
  ['HAPPY', BEHAVIORS.DANCE],
];

export default function BisonDebugOverlay({ life }) {
  const Row = ({ k, v }) => (
    <div className="flex justify-between gap-3"><span className="text-white/40">{k}</span><span className="text-white/85">{v}</span></div>
  );

  return (
    <div className="absolute top-4 right-4 z-20 w-[172px] p-2.5 rounded-lg text-[9px] font-mono space-y-0.5 border border-white/15" style={{ background: 'hsl(268 20% 6% / 0.9)' }}>
      <p className="text-gold text-[10px] mb-1">BISON DEBUG</p>
      <Row k="behavior" v={life.behavior} />
      <Row k="micro" v={life.micro || '—'} />
      <Row k="source" v={life.source} />
      <Row k="priority" v={life.priority} />
      <Row k="return" v={life.returnState || '—'} />
      <Row k="next decision" v={`${(life.msUntilDecision / 1000).toFixed(1)}s`} />
      <Row k="time" v={life.timeOfDay} />
      <Row k="queued" v={life.queued} />
      <Row k="decisions" v={life.decisions} />
      <Row k="simulation" v={life.active ? 'ACTIVE' : 'PAUSED'} />
      {Object.entries(life.stats).map(([k, v]) => <Row key={k} k={k} v={Math.round(v)} />)}
      <p className="text-white/30 pt-1 truncate">hist: {life.history.slice(0, 4).join(',')}</p>

      <div className="flex flex-wrap gap-1 pt-1">
        {FORCE.map(([label, id]) => (
          <button key={label} onClick={() => bisonSimulation.force(id)} className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[8px]">{label}</button>
        ))}
        <button onClick={() => bisonSimulation.force(bisonSimulation.snapshot().behavior === BEHAVIORS.IDLE ? BEHAVIORS.LOOK_AROUND : BEHAVIORS.IDLE)} className="px-1.5 py-0.5 rounded bg-white/10 text-[8px]">RANDOM</button>
        <button onClick={() => bisonSimulation.reset()} className="px-1.5 py-0.5 rounded bg-destructive/40 text-[8px]">RESET</button>
      </div>
    </div>
  );
}