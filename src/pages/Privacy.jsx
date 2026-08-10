import { useState } from 'react';
import { PageHeader } from '@/components/MicroAnimations';
import LocalFirstBadge from '@/components/privacy/LocalFirstBadge';
import FirewallPanel from '@/components/privacy/FirewallPanel';
import ConsentLedger from '@/components/privacy/ConsentLedger';
import RequestLogList from '@/components/privacy/RequestLogList';
import NutritionLabelList from '@/components/privacy/NutritionLabelList';

const TABS = [
  { id: 'firewall', label: 'Firewall' },
  { id: 'consent', label: 'Consent' },
  { id: 'requests', label: 'Requests' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'labels', label: 'Labels' },
];

const ACCENT = 'hsl(120 40% 58%)';

export default function Privacy() {
  const [tab, setTab] = useState('firewall');

  return (
    <div>
      <PageHeader title="Data Sovereignty" subtitle="Your information, under your control" accent={ACCENT} />
      <div className="px-6 lg:px-10 pb-8 space-y-4">
        <LocalFirstBadge />

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-2 rounded-lg whitespace-nowrap transition-all ${tab === t.id ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'firewall' && <FirewallPanel />}
        {tab === 'consent' && <ConsentLedger />}
        {tab === 'requests' && <RequestLogList filter="sent" />}
        {tab === 'blocked' && <RequestLogList filter="blocked" />}
        {tab === 'labels' && <NutritionLabelList />}

        <div className="glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-2">What Bison guarantees</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>Bison never initiates sharing on your behalf.</li>
            <li>External communication requires your explicit authorization.</li>
            <li>Every outbound request is logged here, sent or refused.</li>
            <li>Consent is revocable, and revocation takes effect immediately.</li>
            <li>Local processing is preferred whenever it is possible.</li>
          </ul>
          <h3 className="font-heading font-semibold text-sm mt-4 mb-2">What Bison cannot guarantee</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>The policies of third-party AI providers.</li>
            <li>How an external service uses information after you authorize sharing.</li>
            <li>Legal obligations imposed on those providers.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}