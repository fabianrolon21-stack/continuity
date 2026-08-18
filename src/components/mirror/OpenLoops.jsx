import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { resolveOutcome } from '@/lib/bison/continuity/counterfactualEngine';
import { recordCalibration, calibrationSummary } from '@/lib/bison/continuity/outcomeCalibration';
import { recordReflection } from '@/lib/bison/introspection/reflectionLoop';
import { creditRegulation } from '@/lib/bison/emotion/traitRegulationEngine';

// §9–10, §15 — close the loop: outcome → calibration → reflection → learning.
export default function OpenLoops({ loops, onChanged }) {
  const [resolving, setResolving] = useState(null);
  const [answers, setAnswers] = useState({});
  const summary = calibrationSummary();

  const close = (record, matched) => {
    resolveOutcome(record.decisionId, answers.happened || '(unrecorded)');
    if (record.predictedOutcomes.length) recordCalibration({ prediction: record.predictedOutcomes[0], confidence: 0.7, correct: matched });
    recordReflection({ decisionId: record.decisionId, intended: record.chosenAction, did: record.chosenAction, answers });
    if (record.emotion) creditRegulation(record.emotion);
    setResolving(null); setAnswers({});
    onChanged();
  };

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <p className="text-xs font-medium text-leaf">Open loops — observe → learn</p>
      {summary && <p className="text-[10px] text-muted-foreground">Calibration: {summary.hitRate}% outcomes matched vs {summary.avgConfidence}% average confidence over {summary.total} predictions. {summary.verdict}</p>}
      {!loops.length && <p className="text-[11px] text-muted-foreground">No unresolved decisions. Logged decisions return here so predictions can meet reality.</p>}
      {loops.map(record => (
        <div key={record.decisionId} className="rounded-lg bg-secondary/30 p-3 text-[11px] space-y-1.5">
          <p><span className="text-muted-foreground">You chose:</span> {record.chosenAction}</p>
          <p className="text-muted-foreground">Alternatives kept: {record.alternatives.join(' · ')}</p>
          {record.predictedOutcomes[0] && <p><span className="text-muted-foreground">You predicted:</span> {record.predictedOutcomes[0]}</p>}
          {resolving === record.decisionId ? (
            <div className="space-y-2 pt-1">
              <Textarea rows={2} placeholder="What actually happened? What was different? What did you learn?" value={answers.happened || ''} onChange={event => setAnswers({ happened: event.target.value, learned: event.target.value })} className="bg-secondary/40 border-border text-xs" />
              {record.predictedOutcomes.length > 0 ? (
                <div className="flex gap-2">
                  <Button onClick={() => close(record, true)} className="flex-1 h-7 text-[10px]">Prediction held</Button>
                  <Button onClick={() => close(record, false)} variant="outline" className="flex-1 h-7 border-border text-[10px]">It went differently</Button>
                </div>
              ) : (
                <Button onClick={() => close(record, true)} className="w-full h-7 text-[10px]">Record reflection</Button>
              )}
            </div>
          ) : (
            <Button onClick={() => setResolving(record.decisionId)} variant="ghost" className="h-6 px-2 text-[10px] text-leaf">What actually happened?</Button>
          )}
        </div>
      ))}
    </div>
  );
}