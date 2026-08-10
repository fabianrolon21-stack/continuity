import { useState } from 'react';
import { PageHeader } from '@/components/MicroAnimations';
import MemoryMatch from '@/components/games/MemoryMatch';
import { awardTokens } from '@/lib/tokens';
import { emit } from '@/lib/events/eventBus';

const ACCENT = 'hsl(21 73% 69%)';

export default function Games() {
  const [reward, setReward] = useState(null);

  const handleComplete = async (moves) => {
    // Fewer moves, better reward — 6 pairs is 6 moves at best
    const earned = Math.max(3, 20 - Math.max(0, moves - 6));
    const balance = await awardTokens(earned, 'Memory Match completed');
    setReward({ earned, balance });
    emit('BISON_CARE_ACTION', { action: 'play', prop: 'ball' }, 'Games');
  };

  return (
    <div>
      <PageHeader title="Games" subtitle="Play together" accent={ACCENT} />
      <div className="px-6 lg:px-10 pb-8 space-y-4">
        <div className="glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-1">Memory Match</h3>
          <p className="text-xs text-muted-foreground mb-4">Turn over the cards and find every pair. Bison watches along.</p>
          <MemoryMatch pairCount={6} onComplete={handleComplete} />
          {reward && (
            <p className="text-xs text-gold mt-4 text-center">
              +{reward.earned} tokens{reward.balance != null ? ` · balance ${reward.balance}` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}