import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { loadProfile, saveProfile, PERMIT_KEYS, HARD_FALSE_KEYS } from '@/lib/bison/legal/jurisdictionProfile';

const LABELS = {
  cryptoMining: 'Cryptocurrency mining', vpnUse: 'VPN use', torUse: 'Tor use',
  dataProcessing: 'Data processing / external calls', surveillance: 'Surveillance',
  autonomousActions: 'Autonomous actions', medicalAdvice: 'Medical advice', financialAdvice: 'Financial advice',
};

export default function JurisdictionView() {
  const [profile, setProfile] = useState(loadProfile());

  const set = (patch) => setProfile(saveProfile(patch));

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg border border-gold/25 bg-gold/5">
        <p className="text-[10px] text-muted-foreground">This is your own declaration, used only to configure what the app will attempt. It is built from what you type — never from GPS or IP. It is not legal research and not legal advice: the app does not know the law of any jurisdiction.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Country</p>
          <Input value={profile.country} placeholder="e.g. US" onChange={e => set({ country: e.target.value })} className="h-7 text-[11px] bg-secondary/40 border-border" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Region</p>
          <Input value={profile.region} placeholder="e.g. New York" onChange={e => set({ region: e.target.value })} className="h-7 text-[11px] bg-secondary/40 border-border" />
        </div>
      </div>

      {!profile.configured && (
        <p className="text-[10px] text-gold">No jurisdiction declared — defaults deny every discretionary action.</p>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Declared permissions</p>
        {PERMIT_KEYS.map(k => {
          const locked = HARD_FALSE_KEYS.includes(k);
          return (
            <div key={k} className="flex items-center justify-between py-1 border-b border-border/30">
              <div className="min-w-0">
                <p className="text-[11px]">{LABELS[k]}</p>
                {locked && <p className="text-[9px] text-destructive">Permanently off — absolute prohibition, not a setting.</p>}
              </div>
              <Switch checked={profile.permits[k]} disabled={locked}
                onCheckedChange={v => set({ permits: { [k]: v } })} />
            </div>
          );
        })}
      </div>

      <p className="text-[9px] text-muted-foreground/60">Turning something on here permits the app to attempt it; it does not make it lawful where you are. VPN and Tor routing are not implemented at all, so those switches record a declaration only.</p>
    </div>
  );
}