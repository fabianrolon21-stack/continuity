import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Fingerprint, RefreshCw } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/MicroAnimations';

const FIELDS = [
  { key: 'vocabulary_patterns', label: 'Vocabulary', color: 'hsl(42 63% 55%)' },
  { key: 'sentence_structure', label: 'Sentence Structure', color: 'hsl(199 56% 64%)' },
  { key: 'punctuation_habits', label: 'Punctuation', color: 'hsl(120 40% 58%)' },
  { key: 'emoji_usage', label: 'Emoji Usage', color: 'hsl(265 41% 64%)' },
  { key: 'humor_style', label: 'Humor Style', color: 'hsl(21 73% 69%)' },
  { key: 'code_switching', label: 'Code-Switching', color: 'hsl(48 67% 74%)' },
  { key: 'slang_regional', label: 'Slang & Regional', color: 'hsl(199 56% 64%)' },
  { key: 'response_rhythm', label: 'Response Rhythm', color: 'hsl(120 40% 58%)' },
  { key: 'emotional_patterns', label: 'Emotional Patterns', color: 'hsl(265 41% 64%)' },
  { key: 'context_references', label: 'Context References', color: 'hsl(21 73% 69%)' },
];

export default function FingerprintView({ fingerprint, analyzedCount, onRefresh }) {
  const [building, setBuilding] = useState(false);

  const handleBuild = async () => {
    setBuilding(true);
    try {
      const analyzed = await base44.entities.CommunicationCorpus.filter({ is_analyzed: true }, '-created_date', 50);
      if (analyzed.length === 0) return;

      const { buildFingerprint } = await import('@/lib/bison/communicationEngine');
      const result = await buildFingerprint(analyzed);

      if (fingerprint) {
        await base44.entities.CommunicationFingerprint.update(fingerprint.id, {
          vocabulary_patterns: result.vocabulary_patterns || '',
          sentence_structure: result.sentence_structure || '',
          punctuation_habits: result.punctuation_habits || '',
          emoji_usage: result.emoji_usage || '',
          humor_style: result.humor_style || '',
          code_switching: result.code_switching || '',
          slang_regional: result.slang_regional || '',
          response_rhythm: result.response_rhythm || '',
          emotional_patterns: result.emotional_patterns || '',
          context_references: result.context_references || '',
          confidence_score: result.confidence_score || 0,
          sample_count: analyzed.length,
        });
      } else {
        await base44.entities.CommunicationFingerprint.create({
          vocabulary_patterns: result.vocabulary_patterns || '',
          sentence_structure: result.sentence_structure || '',
          punctuation_habits: result.punctuation_habits || '',
          emoji_usage: result.emoji_usage || '',
          humor_style: result.humor_style || '',
          code_switching: result.code_switching || '',
          slang_regional: result.slang_regional || '',
          response_rhythm: result.response_rhythm || '',
          emotional_patterns: result.emotional_patterns || '',
          context_references: result.context_references || '',
          confidence_score: result.confidence_score || 0,
          sample_count: analyzed.length,
        });
      }
      onRefresh();
    } catch (e) {}
    setBuilding(false);
  };

  return (
    <div>
      <PageHeader title="Communication Fingerprint" subtitle="Your unified voice pattern across all contexts" accent="hsl(48 67% 74%)" />

      <div className="px-6 lg:px-10 pb-4 space-y-4">
        <div className="glass rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fingerprint className="w-6 h-6 text-starlight" />
            <div>
              <p className="text-sm font-medium">{analyzedCount} analyzed samples</p>
              <p className="text-xs text-muted-foreground">
                {fingerprint ? `${fingerprint.confidence_score || 0}% confidence` : 'No fingerprint built yet'}
              </p>
            </div>
          </div>
          <button
            onClick={handleBuild}
            disabled={analyzedCount === 0 || building}
            className="px-4 py-2 rounded-lg bg-starlight/15 text-starlight text-sm font-medium hover:bg-starlight/25 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {building ? <Loader2 className="w-4 h-4 animate-spin" /> : fingerprint ? <RefreshCw className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
            {fingerprint ? 'Rebuild' : 'Build Fingerprint'}
          </button>
        </div>

        {fingerprint ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FIELDS.map(field => {
              const value = fingerprint[field.key];
              if (!value) return null;
              return (
                <div key={field.key} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: field.color }} />
                    <h4 className="text-xs font-semibold" style={{ color: field.color }}>{field.label}</h4>
                  </div>
                  <p className="text-sm text-foreground/70">{value}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Fingerprint} title="No fingerprint yet" subtitle="Analyze corpus samples, then build your fingerprint" />
        )}
      </div>
    </div>
  );
}