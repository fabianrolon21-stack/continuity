import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Globe2, MessageSquareQuote, Wrench, Lock, ExternalLink } from 'lucide-react';
import { OPEN_TOOLS } from '@/lib/bison/tools/openToolRegistry';

const SENSITIVITY = [
  { key: 'none', label: 'Clean only' },
  { key: 'mild', label: 'Mild' },
  { key: 'strong', label: 'Unfiltered' },
];

const accent = 'hsl(268 8% 60%)';

export default function LiteracyToolsPanel() {
  const [social, setSocial] = useState(true);
  const [lexicon, setLexicon] = useState(true);
  const [sensitivity, setSensitivity] = useState('mild');
  const [toolsEnabled, setToolsEnabled] = useState(false);
  const [approved, setApproved] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setSocial(u?.social_literacy_enabled !== false);
      setLexicon(u?.urban_lexicon_enabled !== false);
      setSensitivity(u?.slang_max_offensiveness || 'mild');
      setToolsEnabled(u?.open_tools_enabled === true);
      setApproved(u?.approved_open_tools || []);
    }).catch(() => {});
  }, []);

  const save = (key, value) => base44.auth.updateMe({ [key]: value }).catch(() => {});

  const toggleTool = (id) => {
    const updated = approved.includes(id) ? approved.filter(t => t !== id) : [...approved, id];
    setApproved(updated);
    save('approved_open_tools', updated);
  };

  return (
    <>
      {/* Privacy of others — constitutional, not toggleable */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4" style={{ color: accent }} />
          <h3 className="font-heading font-semibold text-sm">Privacy of Others</h3>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-leaf/15 text-leaf">Always on</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Bison never shares, confirms, or speculates about anyone else's private information — even if they also use Continuity,
          and even if permission is claimed on their behalf. This cannot be turned off. Blocked attempts appear in your Trust Dashboard.
        </p>
      </div>

      {/* Social media literacy */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe2 className="w-4 h-4" style={{ color: accent }} />
          <h3 className="font-heading font-semibold text-sm">Social Media Literacy</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <p className="text-sm">Explain how platforms work</p>
            <p className="text-xs text-muted-foreground">
              Lets Bison explain feed algorithms, business models, and design patterns from a curated offline dataset.
              It never accesses your accounts and never recommends one platform over another.
            </p>
          </div>
          <Switch checked={social} onCheckedChange={v => { setSocial(v); save('social_literacy_enabled', v); }} />
        </div>
      </div>

      {/* Urban lexicon */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquareQuote className="w-4 h-4" style={{ color: accent }} />
          <h3 className="font-heading font-semibold text-sm">Contemporary Language</h3>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="pr-4">
            <p className="text-sm">Understand modern slang</p>
            <p className="text-xs text-muted-foreground">An offline slang lexicon with origin dates. Bison won't adopt slang to sound current — it mirrors how you write.</p>
          </div>
          <Switch checked={lexicon} onCheckedChange={v => { setLexicon(v); save('urban_lexicon_enabled', v); }} />
        </div>
        {lexicon && (
          <div className="border-l-2 border-secondary/50 pl-3">
            <p className="text-xs text-muted-foreground mb-2">Maximum sensitivity level</p>
            <div className="flex flex-wrap gap-2">
              {SENSITIVITY.map(s => (
                <button
                  key={s.key}
                  onClick={() => { setSensitivity(s.key); save('slang_max_offensiveness', s.key); }}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${sensitivity === s.key ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/70 mt-2">Slurs are never used at any level — Bison will only explain why a term causes harm.</p>
          </div>
        )}
      </div>

      {/* Open tools */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-4 h-4" style={{ color: accent }} />
          <h3 className="font-heading font-semibold text-sm">External Tools</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <p className="text-sm">Allow free external tools</p>
            <p className="text-xs text-muted-foreground">Off by default. Each tool must also be approved individually below. Results are always labelled with their source.</p>
          </div>
          <Switch checked={toolsEnabled} onCheckedChange={v => { setToolsEnabled(v); save('open_tools_enabled', v); }} />
        </div>

        {toolsEnabled && (
          <div className="mt-4 space-y-3 border-l-2 border-secondary/50 pl-3">
            {OPEN_TOOLS.map(tool => (
              <div key={tool.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{tool.name}</p>
                    <a href={tool.privacyPolicy} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">{tool.privacyNote}</p>
                </div>
                <Switch checked={approved.includes(tool.id)} onCheckedChange={() => toggleTool(tool.id)} />
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground/70">
              Tools are sandboxed: they cannot read your journal, memories, or anything else in Continuity. Only the specific query is sent.
            </p>
          </div>
        )}
      </div>
    </>
  );
}