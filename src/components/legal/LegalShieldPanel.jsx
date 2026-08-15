import { useState } from 'react';
import { Scale } from 'lucide-react';
import JurisdictionView from './JurisdictionView';
import ConsentLedgerView from './ConsentLedgerView';
import ActionLedgerView from './ActionLedgerView';
import ProhibitionsView from './ProhibitionsView';
import IncidentReportView from './IncidentReportView';

const VIEWS = [
  { id: 'consents', label: 'Consents' },
  { id: 'actions', label: 'Action ledger' },
  { id: 'jurisdiction', label: 'Jurisdiction' },
  { id: 'prohibitions', label: 'Prohibitions' },
  { id: 'incidents', label: 'Incidents' },
];

export default function LegalShieldPanel({ accent = 'hsl(199 56% 64%)' }) {
  const [view, setView] = useState('consents');

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Legal Shield & Evidence Vault</h3>
      </div>

      <div className="p-2.5 rounded-lg border border-gold/25 bg-gold/5">
        <p className="text-[10px] text-muted-foreground">
          What this genuinely does: refuses actions that fail the prohibition, jurisdiction, and consent checks, and keeps a tamper-evident record of every decision including the refusals.
          What it cannot do: guarantee immunity, determine what is lawful anywhere, or shift legal responsibility away from whoever distributes this app. It is evidence and enforcement, not a legal opinion — for that, talk to a lawyer.
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${view === v.id ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}>{v.label}</button>
        ))}
      </div>

      {view === 'consents' && <ConsentLedgerView />}
      {view === 'actions' && <ActionLedgerView />}
      {view === 'jurisdiction' && <JurisdictionView />}
      {view === 'prohibitions' && <ProhibitionsView />}
      {view === 'incidents' && <IncidentReportView />}
    </div>
  );
}