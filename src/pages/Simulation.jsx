import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/MicroAnimations';
import { newSimulation, runTicks, worldSummary } from '@/lib/bison/simulation/simulationEngine';
import WorldOverview from '@/components/simulation/WorldOverview';
import EventFeed from '@/components/simulation/EventFeed';
import AgentInspector from '@/components/simulation/AgentInspector';
import ConflictAnalyzer from '@/components/simulation/ConflictAnalyzer';

export default function Simulation() {
  const simRef = useRef(newSimulation('continuity'));
  const [version, setVersion] = useState(0);
  const [selectedId, setSelectedId] = useState(simRef.current.world.agents[0]?.id || null);

  const sim = simRef.current;
  const world = sim.world;
  const summary = worldSummary(world);
  const agent = world.agents.find(a => a.id === selectedId);
  const trace = sim.traces.find(t => t.agentId === selectedId);

  const advance = (n) => { runTicks(sim, n); setVersion(v => v + 1); };
  const reset = () => { simRef.current = newSimulation('continuity'); setSelectedId(simRef.current.world.agents[0]?.id); setVersion(v => v + 1); };

  return (
    <div className="pb-8" data-tick={version}>
      <PageHeader title="Simulation" subtitle="One cognitive loop, running for every agent in the world" accent="hsl(199 56% 64%)" />

      <div className="px-6 lg:px-10">
        <Tabs defaultValue="world">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="world">World</TabsTrigger>
            <TabsTrigger value="agent">Agent</TabsTrigger>
            <TabsTrigger value="conflict">Conflict</TabsTrigger>
          </TabsList>

          <TabsContent value="world" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Tick <span className="text-foreground font-mono">{summary.tick}</span> · seed replayable</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => advance(1)}>Step</Button>
                <Button size="sm" variant="secondary" onClick={() => advance(10)}>×10</Button>
                <Button size="sm" variant="ghost" onClick={reset}>Reset</Button>
              </div>
            </div>
            <WorldOverview summary={summary} />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">World events</p>
              <EventFeed events={world.events.slice(-40)} />
            </div>
          </TabsContent>

          <TabsContent value="agent" className="space-y-4 mt-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {world.agents.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors duration-300"
                  style={a.id === selectedId
                    ? { borderColor: 'hsl(42 63% 55%)', color: 'hsl(42 63% 55%)', background: 'hsl(42 63% 55% / 0.1)' }
                    : { borderColor: 'hsl(268 10% 22%)', color: 'hsl(268 8% 60%)' }}
                >
                  {a.name}
                </button>
              ))}
            </div>
            <div className="glass framed rounded-2xl p-4">
              <AgentInspector agent={agent} trace={trace} />
            </div>
          </TabsContent>

          <TabsContent value="conflict" className="mt-4">
            <div className="glass framed rounded-2xl p-4">
              <ConflictAnalyzer />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}