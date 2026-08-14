import { useState } from 'react';
import { Network } from 'lucide-react';
import { PROTOCOL_VERSION } from '@/lib/bison/ustp/trust';
import UstpTransmissionViewer from './UstpTransmissionViewer';
import UstpConceptExplorer from './UstpConceptExplorer';
import UstpRecoverySimulator from './UstpRecoverySimulator';
import UstpTestBench from './UstpTestBench';

const TABS = [
  { id: 'transmissions', label: 'Transmissions' },
  { id: 'concepts', label: 'Concept Registry' },
  { id: 'recovery', label: 'Recovery Simulator' },
  { id: 'tests', label: 'Test Plan' },
];

export default function UstpProtocolPanel({ accent = 'hsl(0 70% 50%)' }) {
  const [tab, setTab] = useState('transmissions');

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4" style={{ color: accent }} />
          <h3 className="font-heading font-semibold text-sm">USTP — Semantic Transfer Protocol</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">v{PROTOCOL_VERSION} · Package 47</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Every transmission passes ethics, then sovereignty (Package 44), then negotiation — meaning moves only after all three agree.</p>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-4">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${tab === t.id ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'transmissions' && <UstpTransmissionViewer />}
      {tab === 'concepts' && <UstpConceptExplorer />}
      {tab === 'recovery' && <UstpRecoverySimulator />}
      {tab === 'tests' && <UstpTestBench />}
    </div>
  );
}