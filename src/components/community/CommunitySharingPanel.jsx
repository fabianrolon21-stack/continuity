import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { AUTONOMY_CAPS, isCapabilityActive } from '@/lib/bison/autonomy/autonomyCapabilities';
import {
  DATA_CATEGORIES, requestConsent, confirmConsent, revokeConsent,
  listConsents, buildSharePackage, listPackages,
} from '@/lib/bison/community/communityIntelligenceManager';
import ConsentConversation from './ConsentConversation';
import { Share2, Plus, Ban, FileText } from 'lucide-react';

const accent = 'hsl(21 73% 69%)';

export default function CommunitySharingPanel() {
  const [user, setUser] = useState(null);
  const [consents, setConsents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [account, setAccount] = useState('');
  const [categories, setCategories] = useState([]);
  const [pendingConsent, setPendingConsent] = useState(null);

  const load = async () => {
    const [u, c, p] = await Promise.all([
      base44.auth.me().catch(() => null),
      listConsents(),
      listPackages(),
    ]);
    setUser(u);
    setConsents(c || []);
    setPackages(p || []);
  };

  useEffect(() => { load(); }, []);

  const enabled = isCapabilityActive(user, AUTONOMY_CAPS.COMMUNITY_INTELLIGENCE);

  const toggleEnabled = async (v) => {
    await base44.auth.updateMe({
      autonomy_capabilities: { ...(user?.autonomy_capabilities || {}), [AUTONOMY_CAPS.COMMUNITY_INTELLIGENCE]: v },
    }).catch(() => {});
    load();
  };

  const toggleCategory = (key) => {
    setCategories(categories.includes(key) ? categories.filter(c => c !== key) : [...categories, key]);
  };

  const startConsent = async () => {
    const consent = await requestConsent(account.trim(), categories, user).catch(() => null);
    if (consent) setPendingConsent(consent);
  };

  const confirm = async () => {
    await confirmConsent(pendingConsent, user).catch(() => {});
    setPendingConsent(null);
    setAccount('');
    setCategories([]);
    load();
  };

  const cancel = async () => {
    await base44.entities.CommunityShareConsent.delete(pendingConsent.id).catch(() => {});
    setPendingConsent(null);
  };

  const revoke = async (consent) => {
    await revokeConsent(consent).catch(() => {});
    load();
  };

  const buildPackage = async (consent) => {
    await buildSharePackage(consent, user).catch(() => {});
    load();
  };

  const active = consents.filter(c => c.confirmed && !c.revoked);

  return (
    <div className="glass rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Kindred Spirits — Shared Analysis</h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="pr-4">
          <p className="text-sm">Share anonymised analysis with trusted accounts</p>
          <p className="text-xs text-muted-foreground">
            Only counters about how the software runs. Your memories, journal, conversations, secrets, relationships, and
            emotional state are not in any category here and cannot be added to one.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={toggleEnabled} />
      </div>

      {enabled && (
        <>
          <div className="mt-4 space-y-3">
            <Input value={account} onChange={e => setAccount(e.target.value)} placeholder="Trusted account identifier..." className="bg-secondary/50" />
            <div className="flex flex-wrap gap-2">
              {Object.entries(DATA_CATEGORIES).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${categories.includes(key) ? 'bg-peach/20 text-peach' : 'bg-secondary/40 text-muted-foreground'}`}
                >
                  {meta.label}
                </button>
              ))}
            </div>
            <button
              onClick={startConsent}
              disabled={!account.trim() || categories.length === 0}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />Review what would be shared
            </button>
          </div>

          {pendingConsent && (
            <ConsentConversation consent={pendingConsent} onConfirm={confirm} onCancel={cancel} />
          )}

          {active.length > 0 && (
            <div className="mt-4 space-y-2">
              {active.map(c => (
                <div key={c.id} className="text-xs border border-border/50 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium">{c.trusted_account}</span>
                    <span className="text-muted-foreground/60">you appear as {c.anonymous_key}</span>
                  </div>
                  <p className="text-muted-foreground mt-1">{c.data_categories.map(k => DATA_CATEGORIES[k]?.label).join(', ')}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => buildPackage(c)} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/50">
                      <FileText className="w-3 h-3" />Build package
                    </button>
                    <button onClick={() => revoke(c)} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-destructive/10 text-destructive">
                      <Ban className="w-3 h-3" />Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {packages.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium mb-2">Packages built for you to hand over</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {packages.map(p => (
                  <details key={p.id} className="text-xs border-b border-border/40 pb-1.5">
                    <summary className="cursor-pointer text-muted-foreground">
                      {p.trusted_account} · {new Date(p.created_date).toLocaleDateString()}
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap text-[11px] text-muted-foreground/80">{p.payload}</pre>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{p.anonymisation_notes}</p>
                  </details>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-2">
                There is no community relay yet, so nothing is transmitted. Packages sit here until you send one deliberately.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}