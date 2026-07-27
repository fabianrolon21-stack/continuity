import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, EmptyState } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import {
  canPerform, DEVELOPER_CAPABILITIES, recordAudit, getIncidentState,
  runDiagnostics, generateSystemReport, verifyAuditIntegrity,
} from '@/lib/security/controlPlane';
import { listCapabilities } from '@/lib/security/deviceAccess';
import { getComputeMode } from '@/lib/bison/pipeline';
import RuntimeDiagnosticsPanel from '@/components/developer/RuntimeDiagnosticsPanel';
import ModuleOrchestratorDashboard from '@/components/developer/ModuleOrchestratorDashboard';
import { Shield, Activity, AlertTriangle, FileText, Bug, Lock, Hash, Cpu, Power, Ban, CheckCircle, XCircle } from 'lucide-react';

export default function DeveloperControlPlane() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incidentState, setIncidentState] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [report, setReport] = useState(null);
  const [integrityCheck, setIntegrityCheck] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionResult, setActionResult] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role !== 'admin') { setLoading(false); return; }
      Promise.all([
        getIncidentState(),
        base44.entities.AuditLog.list('-created_date', 30).catch(() => []),
        listCapabilities(),
      ]).then(([state, logs, caps]) => {
        setIncidentState(state);
        setAuditLog(logs || []);
        setCapabilities(caps);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  const refreshAudit = () => base44.entities.AuditLog.list('-created_date', 30).then(logs => setAuditLog(logs || []));

  const executeAction = async (capability, label, fn) => {
    if (!canPerform(user, capability)) {
      setActionResult({ action: label, success: false, message: 'Authorization denied.' });
      await recordAudit(label, 'admin', capability, 'DENIED', 'Capability not available');
      return;
    }
    try {
      const result = await fn();
      await recordAudit(label, 'admin', capability, 'SUCCESS', result?.message || '');
      setActionResult({ action: label, success: true, message: result?.message || `${label} completed.` });
      const state = await getIncidentState();
      setIncidentState(state);
      refreshAudit();
    } catch (e) {
      await recordAudit(label, 'admin', capability, 'FAILED', e.message);
      setActionResult({ action: label, success: false, message: e.message });
    }
    setConfirmAction(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" /></div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div>
        <PageHeader title="Developer" subtitle="Restricted access" accent="hsl(0 70% 50%)" />
        <div className="px-6 lg:px-10">
          <EmptyState icon={Lock} title="Access Denied" subtitle="The Developer Control Plane requires administrator privileges." />
        </div>
      </div>
    );
  }

  const accent = 'hsl(0 70% 50%)';
  const computeMode = incidentState ? getComputeMode(incidentState) : 'UNKNOWN';

  const incidentActions = [
    { cap: DEVELOPER_CAPABILITIES.ENTER_INCIDENT_MODE, label: 'Enter Incident Mode', icon: AlertTriangle, fn: () => base44.auth.updateMe({ incident_mode: true }).then(() => ({ message: 'Incident mode activated. Pipeline switched to LOCAL_CONTINUITY mode.' })) },
    { cap: DEVELOPER_CAPABILITIES.EXIT_INCIDENT_MODE, label: 'Exit Incident Mode', icon: CheckCircle, fn: () => base44.auth.updateMe({ incident_mode: false }).then(() => ({ message: 'Incident mode deactivated. Pipeline resumed FULL mode.' })) },
    { cap: DEVELOPER_CAPABILITIES.FORCE_LOCAL_MODE, label: incidentState?.force_local ? 'Disable Force Local' : 'Force Local Mode', icon: Cpu, fn: () => base44.auth.updateMe({ force_local: !incidentState?.force_local }).then(() => ({ message: `Force local mode ${!incidentState?.force_local ? 'enabled' : 'disabled'}.` })) },
    { cap: DEVELOPER_CAPABILITIES.DISABLE_AUTOMATION, label: incidentState?.automation_disabled ? 'Enable Automation' : 'Disable Automation', icon: Ban, fn: () => base44.auth.updateMe({ automation_disabled: !incidentState?.automation_disabled }).then(() => ({ message: `Automation ${!incidentState?.automation_disabled ? 'disabled' : 'enabled'}.` })) },
  ];

  return (
    <div>
      <PageHeader title="Developer Control Plane" subtitle="System administration & incident response" accent={accent} />
      <div className="px-6 lg:px-10 pb-8 space-y-4">
        {incidentState?.incident_mode && (
          <div className="glass rounded-xl p-4 flex items-center gap-3 border border-destructive/30">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Incident Mode Active</p>
              <p className="text-xs text-muted-foreground">Pipeline operating in LOCAL_CONTINUITY mode. Cloud AI disabled. User data access preserved.</p>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">System Status</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">App</p><p className="font-medium">Continuity</p></div>
            <div><p className="text-xs text-muted-foreground">Bison Core</p><p className="font-medium">v1.0.0</p></div>
            <div><p className="text-xs text-muted-foreground">SPS6-Lite</p><p className="font-medium">v1.0.0-lite</p></div>
            <div><p className="text-xs text-muted-foreground">Platform</p><p className="font-medium">Web (Base44)</p></div>
            <div><p className="text-xs text-muted-foreground">Compute Mode</p><p className="font-medium" style={{ color: computeMode === 'FULL' ? 'hsl(120 40% 58%)' : 'hsl(0 70% 50%)' }}>{computeMode}</p></div>
            <div><p className="text-xs text-muted-foreground">Role</p><p className="font-medium capitalize">{user.role}</p></div>
          </div>
        </div>

        {/* Module Orchestrator (Package 44.6) */}
        <ModuleOrchestratorDashboard accent={accent} />

        {/* Runtime Diagnostics (Package 45.5) */}
        <RuntimeDiagnosticsPanel accent={accent} />

        {/* Incident Controls */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">Incident Response Controls</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incidentActions.map(action => {
              const Icon = action.icon;
              const isHighImpact = action.cap === DEVELOPER_CAPABILITIES.ENTER_INCIDENT_MODE || action.cap === DEVELOPER_CAPABILITIES.EXIT_INCIDENT_MODE;
              return (
                <button
                  key={action.label}
                  onClick={() => isHighImpact ? setConfirmAction(action) : executeAction(action.cap, action.label, action.fn)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ color: accent }} />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
          {confirmAction && (
            <div className="mt-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <p className="text-sm font-medium mb-3">Confirm: {confirmAction.label}?</p>
              <p className="text-xs text-muted-foreground mb-3">This is a high-impact administrative action. It will be audited.</p>
              <div className="flex gap-2">
                <Button onClick={() => executeAction(confirmAction.cap, confirmAction.label, confirmAction.fn)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs">Confirm</Button>
                <Button onClick={() => setConfirmAction(null)} variant="outline" className="border-border text-xs">Cancel</Button>
              </div>
            </div>
          )}
          {actionResult && (
            <div className={`mt-3 p-3 rounded-lg text-xs ${actionResult.success ? 'bg-leaf/10 text-leaf' : 'bg-destructive/10 text-destructive'}`}>
              <strong>{actionResult.action}:</strong> {actionResult.message}
            </div>
          )}
        </div>

        {/* Diagnostics */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4" style={{ color: accent }} />
              <h3 className="font-heading font-semibold text-sm">Diagnostics</h3>
            </div>
            <Button
              onClick={async () => {
                if (!canPerform(user, DEVELOPER_CAPABILITIES.RUN_DIAGNOSTICS)) { setActionResult({ action: 'Run Diagnostics', success: false, message: 'Authorization denied.' }); return; }
                const results = await runDiagnostics();
                await recordAudit('Run Diagnostics', 'admin', DEVELOPER_CAPABILITIES.RUN_DIAGNOSTICS, 'SUCCESS');
                setDiagnostics(results);
                refreshAudit();
              }}
              variant="outline" className="border-border text-xs"
            >Run Diagnostics</Button>
          </div>
          {diagnostics ? (
            <div className="space-y-2">
              {diagnostics.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{d.check}</span>
                  <span className="flex items-center gap-1.5">
                    {d.status === 'PASS' ? <CheckCircle className="w-3.5 h-3.5 text-leaf" /> : d.status === 'FAIL' ? <XCircle className="w-3.5 h-3.5 text-destructive" /> : <AlertTriangle className="w-3.5 h-3.5 text-gold" />}
                    <span style={{ color: d.status === 'PASS' ? 'hsl(120 40% 58%)' : d.status === 'FAIL' ? 'hsl(0 70% 50%)' : 'hsl(42 63% 55%)' }}>{d.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No diagnostics run yet.</p>}
        </div>

        {/* System Report */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: accent }} />
              <h3 className="font-heading font-semibold text-sm">System Report</h3>
            </div>
            <Button
              onClick={async () => {
                if (!canPerform(user, DEVELOPER_CAPABILITIES.GENERATE_SYSTEM_REPORT)) return;
                const rpt = await generateSystemReport(user);
                await recordAudit('Generate System Report', 'admin', DEVELOPER_CAPABILITIES.GENERATE_SYSTEM_REPORT, 'SUCCESS');
                setReport(rpt);
                refreshAudit();
              }}
              variant="outline" className="border-border text-xs"
            >Generate Report</Button>
          </div>
          {report ? (
            <div>
              <pre className="text-xs text-muted-foreground overflow-x-auto max-h-48 overflow-y-auto bg-secondary/30 p-3 rounded-lg">{JSON.stringify(report, null, 2)}</pre>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `continuity-system-report-${Date.now()}.json`; a.click();
                }}
                className="text-xs text-gold mt-2 hover:underline"
              >Download Report</button>
            </div>
          ) : <p className="text-sm text-muted-foreground">No report generated yet. Contains system metadata only — no private user content.</p>}
        </div>

        {/* Audit Integrity */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" style={{ color: accent }} />
              <h3 className="font-heading font-semibold text-sm">Audit Integrity</h3>
            </div>
            <Button
              onClick={async () => {
                const result = await verifyAuditIntegrity();
                setIntegrityCheck(result);
                await recordAudit('Verify Audit Integrity', 'admin', DEVELOPER_CAPABILITIES.READ_SYSTEM_AUDIT_LOG, result.valid ? 'SUCCESS' : 'FAILED');
                refreshAudit();
              }}
              variant="outline" className="border-border text-xs"
            >Verify Integrity</Button>
          </div>
          {integrityCheck && (
            <p className={`text-sm ${integrityCheck.valid ? 'text-leaf' : 'text-destructive'}`}>{integrityCheck.message}</p>
          )}
        </div>

        {/* Audit Log */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">Audit Log</h3>
          </div>
          {auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit entries yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {auditLog.map(entry => (
                <div key={entry.id} className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                  <div>
                    <span className="font-medium">{entry.action}</span>
                    <span className="text-muted-foreground ml-2">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full ${entry.result === 'SUCCESS' ? 'bg-leaf/15 text-leaf' : entry.result === 'DENIED' ? 'bg-destructive/15 text-destructive' : 'bg-gold/15 text-gold'}`}>{entry.result}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device Capabilities */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4" style={{ color: accent }} />
            <h3 className="font-heading font-semibold text-sm">Device Capabilities</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {capabilities.map(cap => (
              <div key={cap.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-muted-foreground">{cap.label}</span>
                <span className={`px-2 py-0.5 rounded-full ${cap.permissionStatus === 'AUTHORIZED' ? 'bg-leaf/15 text-leaf' : cap.permissionStatus === 'NOT_AVAILABLE' ? 'bg-destructive/10 text-muted-foreground' : 'bg-secondary text-muted-foreground'}`}>{cap.permissionStatus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}