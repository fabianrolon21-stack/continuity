import { Eye, Shield, Activity, Heart, Brain, Lock, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Cpu, Scale } from 'lucide-react';
import { useState } from 'react';

export default function TrustDashboard({ state, onToggle }) {
  const [showReasoning, setShowReasoning] = useState(false);

  if (!state) {
    return (
      <div className="px-6 lg:px-10 py-8">
        <p className="text-sm text-muted-foreground">Loading dashboard state...</p>
      </div>
    );
  }

  const scoreColor = state.trustScore >= 80 ? 'hsl(120 40% 58%)' : state.trustScore >= 60 ? 'hsl(42 63% 55%)' : 'hsl(199 56% 64%)';

  return (
    <div className="px-6 lg:px-10 pb-8 space-y-4">
      {/* Trust Score */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-sky-accent" />
            <h3 className="font-heading font-semibold text-sm text-sky-accent">Trust Score</h3>
          </div>
          {onToggle && (
            <button onClick={onToggle} className="text-xs text-muted-foreground hover:text-foreground">Disable Dashboard</button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold" style={{ color: scoreColor }}>{state.trustScore}</div>
          <div className="text-sm text-muted-foreground">/ 100</div>
        </div>
        {state.trustScoreBreakdown && state.trustScoreBreakdown.length > 0 ? (
          <div className="mt-4 space-y-1.5">
            <p className="text-xs text-muted-foreground mb-2">Recent changes (explainable):</p>
            {state.trustScoreBreakdown.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.reason}</span>
                <span style={{ color: item.change > 0 ? 'hsl(120 40% 58%)' : item.change < 0 ? 'hsl(42 63% 55%)' : 'hsl(268 8% 60%)' }}>
                  {item.change > 0 ? '+' : ''}{item.change}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-3">No deductions this session. Score starts at 100.</p>
        )}
      </div>

      {/* Observation Mode */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-sky-accent" />
          <h3 className="font-heading font-semibold text-sm text-sky-accent">Observation Mode</h3>
        </div>
        <p className="text-sm font-medium capitalize">{state.observationMode}</p>
        <p className="text-xs text-muted-foreground mt-1">Bison observes only what you explicitly grant. No background sensing.</p>
      </div>

      {/* Self-Model */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-accent" />
          <h3 className="font-heading font-semibold text-sm text-purple-accent">Bison Self-Model</h3>
        </div>
        <p className="text-sm text-muted-foreground">{state.selfModelSummary}</p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <p className="text-xs text-muted-foreground">Empathy (simulated)</p>
            <p className="text-sm font-medium text-peach">{state.empathyLevel}/100</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Simulated pain</p>
            <p className="text-sm font-medium text-peach">{state.painLevel}/100</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-2">Simulated affect influences narrative tone only. Never grants operational authority.</p>
      </div>

      {/* Permissions */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-sky-accent" />
          <h3 className="font-heading font-semibold text-sm text-sky-accent">Active Permissions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {state.permissions.map(perm => (
            <div key={perm.name} className="flex items-center justify-between text-xs py-1">
              <span className="text-muted-foreground">{perm.name}</span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${perm.status === 'AUTHORIZED' ? 'bg-leaf/15 text-leaf' : perm.status === 'NOT_AVAILABLE' ? 'bg-secondary text-muted-foreground/50' : 'bg-secondary text-muted-foreground'}`}>
                {perm.status === 'AUTHORIZED' ? <CheckCircle className="w-3 h-3" /> : perm.status === 'NOT_AVAILABLE' ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {perm.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Protective Actions */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-sky-accent" />
          <h3 className="font-heading font-semibold text-sm text-sky-accent">Recent Protective Actions</h3>
        </div>
        {state.protectiveActions && state.protectiveActions.length > 0 ? (
          <div className="space-y-2">
            {state.protectiveActions.map((action, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{action.action}</span>
                <span className="text-muted-foreground/60">{new Date(action.time).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No threats detected. Immune system at rest.</p>
        )}
      </div>

      {/* Epistemic Flags */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-purple-accent" />
          <h3 className="font-heading font-semibold text-sm text-purple-accent">Epistemic State (Last Interaction)</h3>
        </div>
        {state.epistemicFlags && state.epistemicFlags.length > 0 ? (
          <div className="space-y-1.5">
            {state.epistemicFlags.map((flag, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{flag.claim}</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent">{flag.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent interaction to classify.</p>
        )}
      </div>

      {/* Constitutional Status */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-sky-accent" />
          <h3 className="font-heading font-semibold text-sm text-sky-accent">Constitutional Status</h3>
        </div>
        <p className="text-sm text-muted-foreground">{state.constitutionalStatus}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Compute: {state.computeMode}</span>
        </div>
      </div>

      {/* Tri-Layer Reasoning (Expandable) */}
      <div className="glass rounded-xl p-5">
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-accent" />
            <h3 className="font-heading font-semibold text-sm text-purple-accent">Tri-Layer Reasoning</h3>
          </div>
          {showReasoning ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {showReasoning && (
          <div className="mt-4 space-y-3 text-xs">
            <div>
              <p className="font-medium text-peach mb-1">Layer 1 — Perception</p>
              <p className="text-muted-foreground">Embodied context, affective state, ecological awareness. Bison observes what the user shares and infers emotional tone.</p>
            </div>
            <div>
              <p className="font-medium text-sky-accent mb-1">Layer 2 — Analysis</p>
              <p className="text-muted-foreground">Recurrence detection, cognitive context aggregation, pattern matching across all stored data. Cross-entity trend analysis.</p>
            </div>
            <div>
              <p className="font-medium text-leaf mb-1">Layer 3 — Response</p>
              <p className="text-muted-foreground">SPS6-Lite strategy selection, constitutional validation, epistemic honesty enforcement. Response mode chosen before generation.</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Memories */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-peach" />
          <h3 className="font-heading font-semibold text-sm text-peach">Recently Stored Memories</h3>
        </div>
        {state.recentMemories && state.recentMemories.length > 0 ? (
          <div className="space-y-2">
            {state.recentMemories.map((mem, i) => (
              <div key={i} className="text-xs">
                <p className="text-muted-foreground">{mem.text}...</p>
                <p className="text-muted-foreground/50 mt-0.5">Source: {mem.source || 'conversation'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No memories stored yet. Memories appear here only when you explicitly save them.</p>
        )}
      </div>
    </div>
  );
}