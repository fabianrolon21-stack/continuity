// ═══════════════════════════════════════════════
// MEMORY TREE GROVE (Phase 31 — Living World)
// Every meaningful achievement becomes a visible tree.
// The user walks through their life, not statistics.
//   Finished school → Oak
//   Started new job → Maple
//   Recovered → Cherry Blossom
//   Completed long goal → Redwood
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { EmptyState } from '@/components/MicroAnimations';
import { TreeDeciduous, Trees, Flower2 } from 'lucide-react';

const TREE_SPECIES_CONFIG = {
  oak: { name: 'Oak', color: 'hsl(30 50% 35%)', leafColor: 'hsl(100 40% 30%)', icon: TreeDeciduous },
  maple: { name: 'Maple', color: 'hsl(25 55% 40%)', leafColor: 'hsl(15 65% 45%)', icon: TreeDeciduous },
  cherry_blossom: { name: 'Cherry Blossom', color: 'hsl(330 50% 60%)', leafColor: 'hsl(330 60% 75%)', icon: Flower2 },
  redwood: { name: 'Redwood', color: 'hsl(15 40% 25%)', leafColor: 'hsl(120 30% 25%)', icon: Trees },
  willow: { name: 'Willow', color: 'hsl(90 40% 35%)', leafColor: 'hsl(90 45% 40%)', icon: TreeDeciduous },
  birch: { name: 'Birch', color: 'hsl(0 0% 80%)', leafColor: 'hsl(100 40% 35%)', icon: TreeDeciduous },
  pine: { name: 'Pine', color: 'hsl(120 35% 25%)', leafColor: 'hsl(120 35% 25%)', icon: Trees },
  bonsai: { name: 'Bonsai', color: 'hsl(30 40% 30%)', leafColor: 'hsl(100 40% 30%)', icon: TreeDeciduous },
};

const GROWTH_STAGE_SCALE = {
  sapling: 0.4,
  young: 0.65,
  mature: 0.85,
  ancient: 1.0,
};

export default function MemoryTreeGrove({ compact = false }) {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrees();
  }, []);

  async function loadTrees() {
    try {
      const result = await base44.entities.MemoryTree.list('-created_date', 20);
      setTrees(result || []);
    } catch (e) {
      setTrees([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <EmptyState
        icon={TreeDeciduous}
        title="Your Memory Grove is empty"
        subtitle="As you achieve milestones, trees will grow here — each one a living memory."
      />
    );
  }

  if (compact) {
    return (
      <div className="flex items-end justify-center gap-2 h-32 overflow-hidden">
        {trees.slice(0, 5).map((tree, i) => (
          <TreeSprite key={tree.id} tree={tree} index={i} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {trees.map((tree, i) => (
        <TreeCard key={tree.id} tree={tree} index={i} />
      ))}
    </div>
  );
}

function TreeSprite({ tree, index, compact = false }) {
  const config = TREE_SPECIES_CONFIG[tree.tree_species] || TREE_SPECIES_CONFIG.oak;
  const scale = GROWTH_STAGE_SCALE[tree.growth_stage] || 0.5;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 60 }}
      className="flex flex-col items-center justify-end"
      style={{ height: compact ? '100%' : '120px' }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'bottom' }}>
        <Icon
          className="w-12 h-12"
          style={{ color: config.leafColor }}
          strokeWidth={1.5}
        />
      </div>
      {!compact && (
        <p className="text-[10px] text-muted-foreground mt-1 text-center truncate max-w-[80px]">
          {tree.title}
        </p>
      )}
    </motion.div>
  );
}

function TreeCard({ tree, index }) {
  const config = TREE_SPECIES_CONFIG[tree.tree_species] || TREE_SPECIES_CONFIG.oak;
  const scale = GROWTH_STAGE_SCALE[tree.growth_stage] || 0.5;
  const Icon = config.icon;
  const plantDate = tree.plant_date ? new Date(tree.plant_date).toLocaleDateString() : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-xl p-4 flex flex-col items-center text-center hover:scale-[1.03] transition-transform"
    >
      <div
        className="rounded-full p-3 mb-3"
        style={{ backgroundColor: `${config.leafColor}15` }}
      >
        <div style={{ transform: `scale(${scale})` }}>
          <Icon className="w-10 h-10" style={{ color: config.leafColor }} strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-xs font-medium text-foreground truncate max-w-full">{tree.title}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{config.name}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
          {tree.growth_stage?.replace(/_/g, ' ')}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
          {tree.achievement_type?.replace(/_/g, ' ')}
        </span>
      </div>
      <p className="text-[9px] text-muted-foreground/50 mt-1.5">{plantDate}</p>
    </motion.div>
  );
}