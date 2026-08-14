import { useEffect, useState } from 'react';
import { loadDeployments, calibration, regressions, systemHealth } from '@/lib/bison/observability/calibration';
import { listEvents } from '@/lib/bison/observability/observabilityBus';
import { securityScore } from '@/lib/bison/soc/securityPosture';

export default function CalibrationView() {
  const [records, setRecords] = useState(null);

  useEffect(() => { loadDeployments().then(setRecords); }, []);

  if (!records) return <p className="text-xs text-muted-foreground">Loading measurements…</p>;

  const cal = calibration(records);
  const reg = regressions(records);
  const health = systemHealth(records, listEvents(), securityScore());

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">System health</p>
        <div className="space-y-0.5">
          {health.map(h => (
            <div key={h.metric} className="flex items-center justify-between text-[10px] py-0.5 border-b border-border/30">
              <span className="text-muted-foreground">{h.metric}</span>
              <span className="font-mono">{h.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Simulation validation</p>
        {cal.available ? (
          <div className="space-y-0.5 text-[10px]">
            <Row k="Samples" v={cal.samples} />
            <Row k="Forecast accuracy" v={`${cal.forecast_accuracy}%`} />
            <Row k="Mean absolute error" v={cal.mean_absolute_error} />
            <Row k="Bias" v={cal.bias} />
            <Row k="Calibration" v={cal.calibration.replace(/_/g, ' ')} />
            <Row k="Confidence reliability" v={cal.confidence_reliability} />
            <Row k="Model drift" v={`${cal.model_drift} (${cal.drift_direction})`} />
            <p className="text-muted-foreground pt-1">{cal.recommendation}</p>
          </div>
        ) : <p className="text-[10px] text-muted-foreground">No deployed proposals with observed outcomes yet — nothing to validate against.</p>}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Regression observer</p>
        <div className="space-y-0.5">
          {reg.rows.map(r => (
            <div key={r.dimension} className="flex items-center justify-between text-[10px] py-0.5 border-b border-border/30">
              <span className="text-muted-foreground capitalize">{r.dimension}</span>
              <span className="font-mono" style={{ color: r.exceeded ? 'hsl(0 70% 50%)' : 'hsl(120 40% 58%)' }}>Δ{r.delta} / threshold {r.threshold}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-1" style={{ color: reg.rollback_recommended ? 'hsl(0 70% 50%)' : 'hsl(120 40% 58%)' }}>{reg.recommendation}</p>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between py-0.5 border-b border-border/30">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}