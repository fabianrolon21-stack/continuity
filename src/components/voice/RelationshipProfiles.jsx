import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Users } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/MicroAnimations';
import { StaggeredItem } from '@/components/AnimationEngine';

const CATEGORY_COLORS = {
  boss: 'hsl(0 70% 50%)',
  family: 'hsl(21 73% 69%)',
  friend: 'hsl(120 40% 58%)',
  coworker: 'hsl(199 56% 64%)',
  professional: 'hsl(265 41% 64%)',
  unknown: 'hsl(268 8% 60%)',
};

export default function RelationshipProfiles({ corpus }) {
  const [profiles, setProfiles] = useState(null);
  const [building, setBuilding] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await base44.entities.RelationshipCommProfile.list('-updated_date', 50);
      setProfiles(data);
    })();
  }, []);

  const uniqueRelationships = () => {
    const seen = new Map();
    corpus.forEach(c => {
      if (!c.relationship_name) return;
      const key = c.relationship_name.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, { name: c.relationship_name, category: c.relationship_category });
      }
    });
    return Array.from(seen.values());
  };

  const handleBuildProfile = async (rel) => {
    setBuilding(rel.name);
    try {
      const relCorpus = corpus.filter(c => (c.relationship_name || '').toLowerCase() === rel.name.toLowerCase() && c.is_analyzed);
      if (relCorpus.length === 0) return;

      const { buildRelationshipProfile } = await import('@/lib/bison/communicationEngine');
      const result = await buildRelationshipProfile(corpus, rel.name, rel.category);

      const existing = profiles?.find(p => (p.relationship_name || '').toLowerCase() === rel.name.toLowerCase());
      if (existing) {
        await base44.entities.RelationshipCommProfile.update(existing.id, {
          communication_style: result.communication_style || '',
          formality_level: result.formality_level || 5,
          warmth_level: result.warmth_level || 5,
          humor_frequency: result.humor_frequency || 'occasional',
          vocabulary_distinctive: result.vocabulary_distinctive || [],
          sample_count: relCorpus.length,
          confidence_level: result.confidence_level || 'LOW',
        });
      } else {
        await base44.entities.RelationshipCommProfile.create({
          relationship_name: rel.name,
          relationship_category: rel.category,
          communication_style: result.communication_style || '',
          formality_level: result.formality_level || 5,
          warmth_level: result.warmth_level || 5,
          humor_frequency: result.humor_frequency || 'occasional',
          vocabulary_distinctive: result.vocabulary_distinctive || [],
          sample_count: relCorpus.length,
          confidence_level: result.confidence_level || 'LOW',
        });
      }

      const data = await base44.entities.RelationshipCommProfile.list('-updated_date', 50);
      setProfiles(data);
    } catch (e) {}
    setBuilding(null);
  };

  const relationships = uniqueRelationships();

  return (
    <div>
      <PageHeader title="Relationship Profiles" subtitle="How your voice adapts to each person" accent="hsl(199 56% 64%)" />

      <div className="px-6 lg:px-10 pb-4 space-y-4">
        {/* Existing profiles */}
        <div className="space-y-3">
          {profiles === null ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading profiles...</p>
          ) : profiles.length === 0 ? (
            <EmptyState icon={Users} title="No profiles yet" subtitle="Build profiles from your corpus samples" />
          ) : (
            profiles.map((p, i) => {
              const color = CATEGORY_COLORS[p.relationship_category] || CATEGORY_COLORS.unknown;
              return (
                <StaggeredItem key={p.id} index={i}>
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <h4 className="text-sm font-semibold">{p.relationship_name}</h4>
                        <span className="text-[10px] text-muted-foreground capitalize">{p.relationship_category}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        p.confidence_level === 'HIGH' ? 'bg-leaf/10 text-leaf' :
                        p.confidence_level === 'MEDIUM' ? 'bg-gold/10 text-gold' :
                        'bg-muted/30 text-muted-foreground'
                      }`}>
                        {p.confidence_level} · {p.sample_count} samples
                      </span>
                    </div>

                    {p.communication_style && (
                      <p className="text-xs text-foreground/70 mb-3">{p.communication_style}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Formality:</span>
                        <div className="w-16 h-1 rounded-full bg-secondary/40 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(p.formality_level || 5) * 10}%`, backgroundColor: color }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Warmth:</span>
                        <div className="w-16 h-1 rounded-full bg-secondary/40 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(p.warmth_level || 5) * 10}%`, backgroundColor: color }} />
                        </div>
                      </div>
                      <span className="text-muted-foreground">Humor: <span style={{ color }}>{p.humor_frequency}</span></span>
                    </div>

                    {p.vocabulary_distinctive?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.vocabulary_distinctive.map((v, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/30 text-muted-foreground">{v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </StaggeredItem>
              );
            })
          )}
        </div>

        {/* Unprofiled relationships from corpus */}
        {relationships.filter(r => !profiles?.find(p => (p.relationship_name || '').toLowerCase() === r.name.toLowerCase())).length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Build profiles for:</p>
            <div className="flex flex-wrap gap-2">
              {relationships
                .filter(r => !profiles?.find(p => (p.relationship_name || '').toLowerCase() === r.name.toLowerCase()))
                .map(r => (
                  <button
                    key={r.name}
                    onClick={() => handleBuildProfile(r)}
                    disabled={building === r.name}
                    className="px-3 py-1.5 rounded-full text-xs bg-secondary/30 text-muted-foreground hover:bg-secondary/50 transition-colors flex items-center gap-1"
                  >
                    {building === r.name && <Loader2 className="w-3 h-3 animate-spin" />}
                    {r.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}