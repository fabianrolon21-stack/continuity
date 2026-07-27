// ═══════════════════════════════════════════════
// ACHIEVEMENT ENGINE (Package F — Achievements)
// Recognizes genuine milestones — consistency, growth, reflection depth.
//
// Anti-manipulation: No FOMO, no artificial scarcity, no fear-based retention.
// Achievements recognize real engagement, not addictive patterns.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { emit } from '@/lib/events/eventBus';
import { EVENT_TYPES } from '@/lib/events/eventTypes';

// ── Achievement Definitions ──

export const ACHIEVEMENTS = [
  {
    id: 'first_checkin',
    title: 'First Step',
    description: 'Completed your first daily check-in.',
    icon: 'check',
    color: 'hsl(42 63% 55%)',
  },
  {
    id: 'streak_7',
    title: 'Consistent',
    description: 'Checked in 7 times. Patterns are forming.',
    icon: 'flame',
    color: 'hsl(21 73% 69%)',
  },
  {
    id: 'streak_30',
    title: 'Dedicated',
    description: 'Checked in 30 times. The journey deepens.',
    icon: 'flame',
    color: 'hsl(0 70% 55%)',
  },
  {
    id: 'first_journal',
    title: 'Reflective',
    description: 'Wrote your first journal entry.',
    icon: 'book',
    color: 'hsl(48 67% 74%)',
  },
  {
    id: 'journal_10',
    title: 'Deep Thinker',
    description: 'Wrote 10 journal entries.',
    icon: 'book',
    color: 'hsl(48 67% 74%)',
  },
  {
    id: 'first_memory',
    title: 'Memory Keeper',
    description: 'Saved your first memory.',
    icon: 'bookmark',
    color: 'hsl(120 40% 58%)',
  },
  {
    id: 'first_philosophy',
    title: 'Philosopher',
    description: 'Recorded your first philosophy statement.',
    icon: 'lightbulb',
    color: 'hsl(265 41% 64%)',
  },
  {
    id: 'first_ethics',
    title: 'Ethical Mirror',
    description: 'Completed your first ethical self-assessment.',
    icon: 'scale',
    color: 'hsl(199 56% 64%)',
  },
  {
    id: 'level_1',
    title: 'Reflective Self',
    description: 'Ascended to Level 1 — beginning to observe your reactions.',
    icon: 'trending-up',
    color: 'hsl(265 41% 64%)',
  },
  {
    id: 'level_5',
    title: 'Continuity Being',
    description: 'Ascended to Level 5 — integrated, self-aware identity.',
    icon: 'star',
    color: 'hsl(48 67% 74%)',
  },
  {
    id: 'first_insight',
    title: 'Pattern Seer',
    description: 'Bison generated your first insight gem.',
    icon: 'sparkles',
    color: 'hsl(265 41% 64%)',
  },
  {
    id: 'first_bison',
    title: 'Hello, Bison',
    description: 'Had your first conversation with Bison.',
    icon: 'message-circle',
    color: 'hsl(42 63% 55%)',
  },
  {
    id: 'community_profile',
    title: 'Community Member',
    description: 'Created your community profile.',
    icon: 'users',
    color: 'hsl(21 73% 69%)',
  },
  {
    id: 'theme_purchased',
    title: 'Patron',
    description: 'Purchased your first theme.',
    icon: 'palette',
    color: 'hsl(265 41% 64%)',
  },
  {
    id: 'relationship_added',
    title: 'Connected',
    description: 'Added your first relationship to the archive.',
    icon: 'heart',
    color: 'hsl(21 73% 69%)',
  },
  {
    id: 'grass_toucher',
    title: 'Grass Toucher',
    description: 'Seven check-ins. "The grass says hello."',
    icon: 'sprout',
    color: 'hsl(120 40% 58%)',
  },
  {
    id: 'window_watcher',
    title: 'Window Watcher',
    description: 'Experienced every weather type in the Sanctuary.',
    icon: 'cloud',
    color: 'hsl(199 56% 64%)',
  },
  {
    id: 'tiny_forest',
    title: 'Tiny Forest',
    description: 'Grew twenty plants in your garden.',
    icon: 'trees',
    color: 'hsl(140 45% 45%)',
  },
  {
    id: 'professional_overthinker',
    title: 'Professional Overthinker',
    description: '200 journal entries. It shows.',
    icon: 'brain',
    color: 'hsl(265 41% 64%)',
  },
  {
    id: 'one_more_entry',
    title: 'One More Entry',
    description: '365 journals. A full year of words.',
    icon: 'book',
    color: 'hsl(48 67% 74%)',
  },
  {
    id: 'cave_explorer',
    title: 'Cave Explorer',
    description: 'Unlocked the Cave habitat.',
    icon: 'gem',
    color: 'hsl(265 41% 64%)',
  },
  {
    id: 'castle_resident',
    title: 'Castle Resident',
    description: 'Unlocked the Castle habitat.',
    icon: 'castle',
    color: 'hsl(42 63% 55%)',
  },
  {
    id: 'sleep_is_important',
    title: 'Sleep Is Important',
    description: 'Watched Bison fall asleep fifty times. "Please lower your voice."',
    icon: 'moon',
    color: 'hsl(240 40% 70%)',
  },
  {
    id: 'constant_companion',
    title: 'Constant Companion',
    description: 'One year together. Thank you.',
    icon: 'heart',
    color: 'hsl(42 63% 55%)',
  },
];

// ── Load / Save ──

export async function loadAchievements() {
  try {
    const user = await base44.auth.me();
    return user?.achievements || [];
  } catch (e) {
    return [];
  }
}

export async function unlockAchievement(achievementId) {
  try {
    const user = await base44.auth.me();
    const existing = user?.achievements || [];
    if (existing.includes(achievementId)) return false;

    const updated = [...existing, achievementId];
    await base44.auth.updateMe({ achievements: updated });

    // Emit achievement event
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement) {
      emit(EVENT_TYPES.ACHIEVEMENT_UNLOCKED, { achievement }, 'achievement_engine');
    }

    return true;
  } catch (e) {
    return false;
  }
}

// ── Condition Checks ──
// Each function takes entity counts and returns which achievements to unlock

export async function checkAchievements(context = {}) {
  const unlocked = [];

  if (context.firstCheckIn) unlocked.push('first_checkin');
  if (context.checkInCount >= 7) unlocked.push('streak_7');
  if (context.checkInCount >= 30) unlocked.push('streak_30');
  if (context.firstJournal) unlocked.push('first_journal');
  if (context.journalCount >= 10) unlocked.push('journal_10');
  if (context.firstMemory) unlocked.push('first_memory');
  if (context.firstPhilosophy) unlocked.push('first_philosophy');
  if (context.firstEthics) unlocked.push('first_ethics');
  if (context.firstBison) unlocked.push('first_bison');
  if (context.communityProfile) unlocked.push('community_profile');
  if (context.themePurchased) unlocked.push('theme_purchased');
  if (context.firstRelationship) unlocked.push('relationship_added');
  if (context.firstInsight) unlocked.push('first_insight');
  if (context.ascensionLevel >= 1) unlocked.push('level_1');
  if (context.ascensionLevel >= 5) unlocked.push('level_5');
  if (context.checkInCount >= 7) unlocked.push('grass_toucher');
  if (context.weatherTypesSeen >= 8) unlocked.push('window_watcher');
  if (context.plantCount >= 20) unlocked.push('tiny_forest');
  if (context.journalCount >= 200) unlocked.push('professional_overthinker');
  if (context.journalCount >= 365) unlocked.push('one_more_entry');
  if (context.unlockedHabitats?.includes('cave')) unlocked.push('cave_explorer');
  if (context.unlockedHabitats?.includes('castle')) unlocked.push('castle_resident');
  if (context.sleepWatchCount >= 50) unlocked.push('sleep_is_important');
  if (context.accountAgeDays >= 365) unlocked.push('constant_companion');

  const newlyUnlocked = [];
  for (const id of unlocked) {
    const wasNew = await unlockAchievement(id);
    if (wasNew) newlyUnlocked.push(id);
  }

  return newlyUnlocked;
}

// ── Get Unlocked Achievements with Details ──

export async function getUnlockedAchievements() {
  const unlocked = await loadAchievements();
  return ACHIEVEMENTS.filter(a => unlocked.includes(a.id));
}

export function getLockedAchievements(unlockedIds) {
  return ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));
}