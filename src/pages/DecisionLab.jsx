import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Brain, TrendingUp, AlertTriangle, GitBranch, Clock, Check, X, BarChart3 } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/MicroAnimations';
import { StaggeredItem } from '@/components/AnimationEngine';

const PRIORITY_DIMENSIONS = [
  { key: 'user_goals', label: 'Goals', icon: Brain, color: 'hsl(42 63% 55%)' },
  { key: 'safety', label: 'Safety', icon: AlertTriangle, color: 'hsl(0 70% 50%)' },
  { key: 'privacy', label: 'Privacy', icon: Brain, color: 'hsl(265 41% 64%)' },
  { key: 'time', label: 'Time', icon: Clock, color: 'hsl(199 56% 64%)' },
  { key: 'resources', label: 'Resources', icon: BarChart3, color: 'hsl(120 40% 58%)' },
  { key: 'emotional_impact', label: 'Emotional', icon: Brain, color: 'hsl(21 73% 69%)' },
  { key: 'long_term_benefit', label: 'Long-term', icon: TrendingUp, color: 'hsl(48 67% 74%)' },
  { key: 'system_integrity', label: 'Integrity', icon: Brain, color: 'hsl(268 8% 60%)' },
];

export default function DecisionLab() {
  const [situation, setSituation] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [currentSim, setCurrentSim] = useState(null);
  const [history, setHistory] = useState(null);
  const [feedbackMode, setFeedbackMode] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await base44.entities.DecisionSimulation.list('-created_date', 20);
      setHistory(data);
    })();
  }, []);

  const handleSimulate = async () => {
    if (!situation.trim()) return;
    setSimulating(true);
    try {
      const { simulateDecision } = await import('@/lib/bison/decisionSimulator');
      const checkins = await base44.entities.CheckIn.list('-created_date', 5);
      const result = await simulateDecision(situation, { checkins });

      const saved = await base44.entities.DecisionSimulation.create({
        situation: situation.trim(),
        recommended_action: result.recommended_action || '',
        benefit_score: result.benefit_score || 0,
        risk_score: result.risk_score || 0,
        alternatives: JSON.stringify(result.alternatives || []),
        long_term_outlook: result.long_term_outlook || '',
        priority_weights: JSON.stringify(result.priority_weights || {}),
        confidence_score: result.confidence_score || 0,
        user_feedback: 'pending',
      });

      setCurrentSim({ ...saved, ...result });
      const data = await base44.entities.DecisionSimulation.list('-created_date', 20);
      setHistory(data);
    } catch (e) {}
    setSimulating(false);
  };

  const handleFeedback = async (feedback) => {
    if (!currentSim) return;
    await base44.entities.DecisionSimulation.update(currentSim.id, { user_feedback: feedback });
    if (feedback === 'accepted' || feedback === 'modified') {
      setFeedbackMode(currentSim.id);
    } else {
      setCurrentSim(null);
      setSituation('');
      const data = await base44.entities.DecisionSimulation.list('-created_date', 20);
      setHistory(data);
    }
  };

  const handleOutcome = async () => {
    if (!outcome.trim() || !currentSim) return;
    setAnalyzing(true);
    try {
      const { analyzeDecisionAccuracy } = await import('@/lib/bison/decisionSimulator');
      const result = await analyzeDecisionAccuracy(currentSim, outcome.trim(), currentSim.user_feedback || 'modified');

      await base44.entities.DecisionSimulation.update(currentSim.id, {
        observed_outcome: outcome.trim(),
        accuracy_score: result.accuracy_score || 0,
        model_adjustment: result.model_adjustment || '',
        user_feedback: 'modified',
      });

      setCurrentSim(prev => ({ ...prev, observed_outcome: outcome.trim(), accuracy_score: result.accuracy_score, model_adjustment: result.model_adjustment }));
      setFeedbackMode(null);
      setOutcome('');
      const data = await base44.entities.DecisionSimulation.list('-created_date', 20);
      setHistory(data);
    } catch (e) {}
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen-safe pb-20 lg:pb-10">
      <PageHeader title="Decision Lab" subtitle="Simulate outcomes before you act" accent="hsl(265 41% 64%)" />

      <div className="px-6 lg:px-10 pb-4 space-y-4">
        {/* Input */}
        <div className="glass rounded-xl p-5 space-y-3">
          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="Describe a decision you're facing..."
            className="w-full bg-secondary/50 rounded-lg px-4 py-3 text-sm border border-border focus:outline-none focus:border-purple-accent min-h-[80px] resize-y"
          />
          <button
            onClick={handleSimulate}
            disabled={!situation.trim() || simulating}
            className="w-full py-2.5 rounded-lg bg-purple-accent/15 text-purple-accent text-sm font-medium hover:bg-purple-accent/25 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            Simulate Decision
          </button>
        </div>

        {/* Current simulation result */}
        {currentSim && (
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-accent" />
              <h3 className="font-heading font-semibold text-sm text-purple-accent">Simulation Result</h3>
            </div>

            {/* Recommended action */}
            <div className="bg-secondary/20 rounded-lg p-4">
              <p className="text-[10px] text-muted-foreground mb-1">Recommended Action</p>
              <p className="text-sm">{currentSim.recommended_action}</p>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-3">
              <ScoreCard label="Benefit" score={currentSim.benefit_score} color="hsl(120 40% 58%)" icon={TrendingUp} />
              <ScoreCard label="Risk" score={currentSim.risk_score} color="hsl(0 70% 50%)" icon={AlertTriangle} />
              <ScoreCard label="Confidence" score={currentSim.confidence_score} color="hsl(42 63% 55%)" icon={Brain} />
            </div>

            {/* Priority weights */}
            {currentSim.priority_weights && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-2">Priority Weights</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_DIMENSIONS.map(dim => {
                    const weights = typeof currentSim.priority_weights === 'string' ? JSON.parse(currentSim.priority_weights) : currentSim.priority_weights;
                    const weight = weights[dim.key] || 0;
                    return (
                      <div key={dim.key} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dim.color }} />
                        <span className="text-[10px] text-muted-foreground flex-1">{dim.label}</span>
                        <div className="w-12 h-1 rounded-full bg-secondary/40 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${weight * 100}%`, backgroundColor: dim.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Long-term outlook */}
            {currentSim.long_term_outlook && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Long-term Outlook</p>
                <p className="text-sm text-foreground/70">{currentSim.long_term_outlook}</p>
              </div>
            )}

            {/* Alternatives */}
            {currentSim.alternatives && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-2">Alternatives Considered</p>
                <div className="space-y-1.5">
                  {(typeof currentSim.alternatives === 'string' ? JSON.parse(currentSim.alternatives) : currentSim.alternatives || []).map((alt, i) => (
                    <div key={i} className="text-xs text-foreground/70 bg-secondary/15 rounded-lg px-3 py-2">
                      <span className="text-muted-foreground">Option {i + 1}:</span> {typeof alt === 'string' ? alt : alt.action}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedbackMode === currentSim.id ? (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground">What actually happened?</p>
                <textarea
                  value={outcome}
                  onChange={e => setOutcome(e.target.value)}
                  placeholder="Describe the outcome..."
                  className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-purple-accent min-h-[60px] resize-y"
                />
                <button
                  onClick={handleOutcome}
                  disabled={!outcome.trim() || analyzing}
                  className="w-full py-2 rounded-lg bg-sky-accent/15 text-sky-accent text-sm font-medium hover:bg-sky-accent/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                  Analyze Accuracy
                </button>
              </div>
            ) : currentSim.user_feedback === 'pending' ? (
              <div className="flex gap-2">
                <button onClick={() => handleFeedback('accepted')} className="flex-1 py-2 rounded-lg bg-leaf/15 text-leaf text-xs font-medium hover:bg-leaf/25 flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button onClick={() => handleFeedback('modified')} className="flex-1 py-2 rounded-lg bg-sky-accent/15 text-sky-accent text-xs font-medium hover:bg-sky-accent/25 flex items-center justify-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" /> Followed Differently
                </button>
                <button onClick={() => handleFeedback('rejected')} className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : currentSim.accuracy_score != null ? (
              <div className="bg-sky-accent/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sky-accent">Prediction Accuracy</span>
                  <span className="text-sm font-bold text-sky-accent">{currentSim.accuracy_score}%</span>
                </div>
                {currentSim.model_adjustment && (
                  <p className="text-[10px] text-muted-foreground">{currentSim.model_adjustment}</p>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* History */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Decision History</h4>
          {history === null ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : history.length === 0 ? (
            <EmptyState icon={Brain} title="No decisions yet" subtitle="Simulate a decision above" />
          ) : (
            history.map((sim, i) => (
              <StaggeredItem key={sim.id} index={i}>
                <div className="glass rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs text-foreground/80 flex-1 line-clamp-2">{sim.situation}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                      sim.user_feedback === 'accepted' ? 'bg-leaf/10 text-leaf' :
                      sim.user_feedback === 'modified' ? 'bg-sky-accent/10 text-sky-accent' :
                      sim.user_feedback === 'rejected' ? 'bg-destructive/10 text-destructive' :
                      'bg-peach/10 text-peach'
                    }`}>
                      {sim.user_feedback}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Confidence: {sim.confidence_score || 0}%</span>
                    {sim.accuracy_score != null && <span className="text-sky-accent">Accuracy: {sim.accuracy_score}%</span>}
                  </div>
                </div>
              </StaggeredItem>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, score, color, icon: Icon }) {
  return (
    <div className="bg-secondary/20 rounded-lg p-3 text-center">
      <Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color }} />
      <p className="text-lg font-bold" style={{ color }}>{score || 0}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}