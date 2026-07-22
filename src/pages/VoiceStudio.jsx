import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Fingerprint, Users, PenLine } from 'lucide-react';
import CorpusManager from '@/components/voice/CorpusManager';
import FingerprintView from '@/components/voice/FingerprintView';
import RelationshipProfiles from '@/components/voice/RelationshipProfiles';
import DraftStudio from '@/components/voice/DraftStudio';

const TABS = [
  { id: 'corpus', label: 'Corpus', icon: FileText, color: 'hsl(265 41% 64%)' },
  { id: 'fingerprint', label: 'Fingerprint', icon: Fingerprint, color: 'hsl(48 67% 74%)' },
  { id: 'profiles', label: 'Profiles', icon: Users, color: 'hsl(199 56% 64%)' },
  { id: 'drafts', label: 'Drafts', icon: PenLine, color: 'hsl(21 73% 69%)' },
];

export default function VoiceStudio() {
  const [tab, setTab] = useState('corpus');
  const [corpus, setCorpus] = useState([]);
  const [fingerprint, setFingerprint] = useState(null);
  const [profiles, setProfiles] = useState([]);

  const refresh = useCallback(async () => {
    const [corpusData, fpData, profileData] = await Promise.all([
      base44.entities.CommunicationCorpus.list('-created_date', 100),
      base44.entities.CommunicationFingerprint.list('-updated_date', 1),
      base44.entities.RelationshipCommProfile.list('-updated_date', 50),
    ]);
    setCorpus(corpusData);
    setFingerprint(fpData[0] || null);
    setProfiles(profileData);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const analyzedCount = corpus.filter(c => c.is_analyzed).length;

  return (
    <div className="min-h-screen-safe pb-20 lg:pb-10">
      {/* Tab bar */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-1 px-4 lg:px-10 py-2 overflow-x-auto scrollbar-hide">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                style={active ? { backgroundColor: `${t.color}20`, color: t.color } : { color: 'hsl(268 8% 50%)' }}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'corpus' && <CorpusManager corpus={corpus} onRefresh={refresh} />}
      {tab === 'fingerprint' && <FingerprintView fingerprint={fingerprint} analyzedCount={analyzedCount} onRefresh={refresh} />}
      {tab === 'profiles' && <RelationshipProfiles corpus={corpus} />}
      {tab === 'drafts' && <DraftStudio fingerprint={fingerprint} profiles={profiles} onRefresh={refresh} />}
    </div>
  );
}