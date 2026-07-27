import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  getAllTelemetry, getTrippedModules, isPreempted, getPreemptionReason,
  detectDeadlocks, clearPreemption, formatLifecycleReport,
} from '@/lib/bison/runtime/moduleLifecycleManager';
import { getSchedulerState } from '@/lib/bison/runtime/executionScheduler';
import { CONTEXT_MODULES } from '@/lib/bison/runtime/contextRegistry';
import { DEPENDENCY_GRAPH } from '@/lib/bison/runtime/plannerDependencyGraph';
import { Network, Activity, AlertTriangle, Shield, RefreshCw, Zap, Ban } from 'lucide-react';

const HEARTBEAT_STYLES = {
  healthy: { color: 'hsl(120 40% 58%)', label: 'Healthy' },
  warning: { color: 'hsl(42 63% 55%)', label: 'Warning' },
  critical: { color: 'hsl(0 70% 50%)', label: 'Critical' },
  unknown: { color: 'hsl(268 8% 60%)', label: 'Idle' },
};

const CIRCUIT_STYLES = {
  CLOSED: { color: 'hsl(120 40% 58%)', label: 'Closed' },
  OPEN: { color: 'hsl(0 70% 50%)', label: 'Open' },
  HALF_OPEN: { color: 'hsl(42 63% 55%)', label: 'Half-Open' },
};

export default function ModuleOrchestratorDashboard({ accent = 'hsl(0 70% 50%)' }) {
  const [tick, setTick] = useState(0);
  const [report, setReport] = useState('');

  useEffect(() => {
    const refresh = () => {
      setReport(formatLifecycleReport());
      setTick(t => t + 1);
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  const telemetry = getAllTelemetry();
  const tripped = getTrippedModules();
  const preempted = isPreempted();
  const preemptionReason = getPreemptionReason();
  const deadlocks = detectDeadlocks();
  const scheduler = getSchedulerState();

  // Merge scheduler state with lifecycle telemetry
  const merged = telemetry.map(t => {
    const sched = scheduler.find(s => s.name === t.name);
    return {
      ...t,
      schedulerState: sched?.state || 'SUSPENDED',
      lastDurationMs: sched?.lastDurationMs ?? null,
      priority: CONTEXT_MODULES[t.name]?.priority || 'UNKNOWN',
    };
  });

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4" style={{ color: accent }} />
          <h3 className="font-heading font-semibold text-sm">Module Orchestrator</h3>
          <span className="text-[10px] text-muted-foreground ml-1">{telemetry.length} modules</span>
        </div>
        <Button onClick={() => setTick(t => t + 1)} variant="outline" className="border-border text-xs">
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </Button>
      </div>

      {/* Alert banners */}
      {preempted && (
        <div className="mb-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Preemption Active</span>
            <span className="text-xs text-muted-foreground">— {preemptionReason}</span>
          </div>
          <Button onClick={() => clearPreemption()} variant="outline" className="border-border text-xs">
            Clear
          </Button>
        </div>
      )}

      {deadlocks.length > 0 && (
        <div className="mb-3 p-3 rounded-lg border border-peach/30 bg-peach/5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-peach" />
            <span className="text-sm font-medium text-peach">Deadlock Detected</span>
          </div>
          {deadlocks.map((cycle, i) => (
            <p key={i} className="text-xs text-muted-foreground ml-6">⟳ {cycle.join(' → ')}</p>
          ))}
        </div>
      )}

      {tripped.length > 0 && !preempted && (
        <div className="mb-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Circuit Breakers Tripped ({tripped.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tripped.map(t => (
              <span key={t.name} className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Stat label="Total Modules" value={telemetry.length} icon={Network} color={accent} />
        <Stat label="Healthy" value={telemetry.filter(t => t.heartbeat === 'healthy').length} icon={Activity} color="hsl(120 40% 58%)" />
        <Stat label="Tripped" value={tripped.length} icon={Ban} color="hsl(0 70% 50%)" />
        <Stat label="Total Executions" value={telemetry.reduce((s, t) => s + t.executionCount, 0)} icon={Zap} color="hsl(42 63% 55%)" />
      </div>

      {/* Module table */}
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {merged.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No modules have executed yet. Send a message to Bison to populate telemetry.</p>
        ) : merged
          .sort((a, b) => b.executionCount - a.executionCount)
          .map(m => {
            const hb = HEARTBEAT_STYLES[m.heartbeat] || HEARTBEAT_STYLES.unknown;
            const cb = CIRCUIT_STYLES[m.circuitState] || CIRCUIT_STYLES.CLOSED;
            return (
              <div key={m.name} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary/30 text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hb.color }} />
                  <span className="font-medium truncate">{m.name}</span>
                  <span className="text-[9px] text-muted-foreground shrink-0">{m.priority}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-muted-foreground">{m.avgLatencyMs}ms</span>
                  <span style={{ color: m.errorRate > 0 ? 'hsl(0 70% 50%)' : 'hsl(268 8% 60%)' }}>{m.errorRate}%</span>
                  <span className="text-muted-foreground">{m.executionCount}×</span>
                  <span style={{ color: cb.color }} className="font-medium">{cb.label}</span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Dependency tree (collapsed) */}
      <details className="mt-4">
        <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">Dependency Graph</summary>
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          {Object.entries(DEPENDENCY_GRAPH).map(([intent, config]) => (
            <div key={intent} className="text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground">{intent}</span>
              <span className="ml-2">{config.requires.join(' → ')}</span>
            </div>
          ))}
        </div>
      </details>

      {/* Raw report */}
      <details className="mt-3">
        <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">Full Lifecycle Report</summary>
        <pre className="mt-2 text-[10px] text-muted-foreground overflow-x-auto max-h-48 overflow-y-auto bg-secondary/30 p-3 rounded-lg whitespace-pre-wrap">{report}</pre>
      </details>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}