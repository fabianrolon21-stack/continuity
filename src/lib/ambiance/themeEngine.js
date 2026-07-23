// ═══════════════════════════════════════════════
// THEME ENGINE (Package C — Theme Engine)
// Runtime CSS token swapping for visual themes.
// No CSS file changes needed — themes override :root tokens at runtime.
//
// Themes:
//   Classic          (free)     — Default warm palette
//   Deep Ocean       (100 tok)  — Blue/teal depths
//   Enchanted Forest (100 tok)  — Green/earth warmth
//   Golden Sunset    (150 tok)  — Orange/pink dusk
//   Midnight Sky      (150 tok)  — Deep blue/indigo night
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

// ── Theme Definitions ──
// Each theme overrides the :root HSL tokens from index.css

export const THEMES = {
  classic: {
    id: 'classic',
    label: 'Classic',
    cost: 0,
    color: 'hsl(42 63% 55%)',
    tokens: {
      '--background': '268 16% 10%',
      '--foreground': '40 20% 92%',
      '--card': '268 14% 14%',
      '--card-foreground': '40 20% 92%',
      '--popover': '268 14% 12%',
      '--popover-foreground': '40 20% 92%',
      '--primary': '42 63% 55%',
      '--primary-foreground': '268 16% 10%',
      '--secondary': '268 10% 18%',
      '--secondary-foreground': '40 20% 92%',
      '--muted': '268 8% 22%',
      '--muted-foreground': '268 8% 60%',
      '--accent': '120 40% 58%',
      '--accent-foreground': '268 16% 10%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '40 20% 92%',
      '--border': '268 10% 22%',
      '--input': '268 10% 22%',
      '--ring': '42 63% 55%',
      '--gold': '42 63% 55%',
      '--leaf': '120 40% 58%',
      '--sky': '199 56% 64%',
      '--purple': '265 41% 64%',
      '--peach': '21 73% 69%',
      '--starlight': '48 67% 74%',
    },
  },
  deep_ocean: {
    id: 'deep_ocean',
    label: 'Deep Ocean',
    cost: 100,
    color: 'hsl(199 56% 64%)',
    tokens: {
      '--background': '210 30% 8%',
      '--foreground': '200 30% 92%',
      '--card': '210 28% 12%',
      '--card-foreground': '200 30% 92%',
      '--popover': '210 28% 10%',
      '--popover-foreground': '200 30% 92%',
      '--primary': '199 56% 54%',
      '--primary-foreground': '210 30% 8%',
      '--secondary': '210 22% 16%',
      '--secondary-foreground': '200 30% 92%',
      '--muted': '210 20% 20%',
      '--muted-foreground': '200 20% 58%',
      '--accent': '180 45% 50%',
      '--accent-foreground': '210 30% 8%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '200 30% 92%',
      '--border': '210 22% 20%',
      '--input': '210 22% 20%',
      '--ring': '199 56% 54%',
      '--gold': '199 56% 54%',
      '--leaf': '180 45% 50%',
      '--sky': '199 56% 64%',
      '--purple': '220 40% 60%',
      '--peach': '15 60% 65%',
      '--starlight': '190 50% 72%',
    },
  },
  enchanted_forest: {
    id: 'enchanted_forest',
    label: 'Enchanted Forest',
    cost: 100,
    color: 'hsl(120 40% 58%)',
    tokens: {
      '--background': '140 20% 8%',
      '--foreground': '80 20% 92%',
      '--card': '140 18% 12%',
      '--card-foreground': '80 20% 92%',
      '--popover': '140 18% 10%',
      '--popover-foreground': '80 20% 92%',
      '--primary': '120 40% 50%',
      '--primary-foreground': '140 20% 8%',
      '--secondary': '140 14% 16%',
      '--secondary-foreground': '80 20% 92%',
      '--muted': '140 12% 20%',
      '--muted-foreground': '100 14% 58%',
      '--accent': '80 35% 55%',
      '--accent-foreground': '140 20% 8%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '80 20% 92%',
      '--border': '140 14% 20%',
      '--input': '140 14% 20%',
      '--ring': '120 40% 50%',
      '--gold': '60 50% 55%',
      '--leaf': '120 40% 50%',
      '--sky': '90 30% 60%',
      '--purple': '280 30% 55%',
      '--peach': '30 50% 60%',
      '--starlight': '70 50% 72%',
    },
  },
  golden_sunset: {
    id: 'golden_sunset',
    label: 'Golden Sunset',
    cost: 150,
    color: 'hsl(21 73% 69%)',
    tokens: {
      '--background': '20 20% 9%',
      '--foreground': '35 25% 93%',
      '--card': '20 18% 13%',
      '--card-foreground': '35 25% 93%',
      '--popover': '20 18% 11%',
      '--popover-foreground': '35 25% 93%',
      '--primary': '25 75% 58%',
      '--primary-foreground': '20 20% 9%',
      '--secondary': '20 14% 17%',
      '--secondary-foreground': '35 25% 93%',
      '--muted': '20 12% 21%',
      '--muted-foreground': '25 18% 58%',
      '--accent': '340 50% 55%',
      '--accent-foreground': '20 20% 9%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '35 25% 93%',
      '--border': '20 14% 21%',
      '--input': '20 14% 21%',
      '--ring': '25 75% 58%',
      '--gold': '35 75% 58%',
      '--leaf': '120 35% 48%',
      '--sky': '200 45% 60%',
      '--purple': '300 40% 58%',
      '--peach': '15 73% 69%',
      '--starlight': '45 70% 74%',
    },
  },
  midnight_sky: {
    id: 'midnight_sky',
    label: 'Midnight Sky',
    cost: 150,
    color: 'hsl(265 41% 64%)',
    tokens: {
      '--background': '250 25% 6%',
      '--foreground': '250 20% 92%',
      '--card': '250 22% 10%',
      '--card-foreground': '250 20% 92%',
      '--popover': '250 22% 8%',
      '--popover-foreground': '250 20% 92%',
      '--primary': '265 50% 60%',
      '--primary-foreground': '250 25% 6%',
      '--secondary': '250 18% 14%',
      '--secondary-foreground': '250 20% 92%',
      '--muted': '250 16% 18%',
      '--muted-foreground': '250 14% 56%',
      '--accent': '220 50% 58%',
      '--accent-foreground': '250 25% 6%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '250 20% 92%',
      '--border': '250 18% 18%',
      '--input': '250 18% 18%',
      '--ring': '265 50% 60%',
      '--gold': '45 50% 60%',
      '--leaf': '160 40% 50%',
      '--sky': '220 50% 58%',
      '--purple': '265 50% 60%',
      '--peach': '15 60% 65%',
      '--starlight': '240 40% 72%',
    },
  },
  mountain_cabin: {
    id: 'mountain_cabin',
    label: 'Mountain Cabin',
    cost: 150,
    color: 'hsl(30 50% 60%)',
    tokens: {
      '--background': '25 15% 8%',
      '--foreground': '30 20% 90%',
      '--card': '25 14% 12%',
      '--card-foreground': '30 20% 90%',
      '--popover': '25 14% 10%',
      '--popover-foreground': '30 20% 90%',
      '--primary': '30 50% 55%',
      '--primary-foreground': '25 15% 8%',
      '--secondary': '25 10% 16%',
      '--secondary-foreground': '30 20% 90%',
      '--muted': '25 8% 20%',
      '--muted-foreground': '25 12% 56%',
      '--accent': '120 30% 48%',
      '--accent-foreground': '25 15% 8%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '30 20% 90%',
      '--border': '25 10% 20%',
      '--input': '25 10% 20%',
      '--ring': '30 50% 55%',
      '--gold': '35 50% 55%',
      '--leaf': '120 30% 48%',
      '--sky': '200 30% 58%',
      '--purple': '280 25% 50%',
      '--peach': '20 50% 60%',
      '--starlight': '40 40% 72%',
    },
  },
  autumn_leaves: {
    id: 'autumn_leaves',
    label: 'Autumn Leaves',
    cost: 150,
    color: 'hsl(30 70% 50%)',
    tokens: {
      '--background': '25 20% 9%',
      '--foreground': '35 25% 90%',
      '--card': '25 18% 13%',
      '--card-foreground': '35 25% 90%',
      '--popover': '25 18% 11%',
      '--popover-foreground': '35 25% 90%',
      '--primary': '30 70% 50%',
      '--primary-foreground': '25 20% 9%',
      '--secondary': '25 14% 17%',
      '--secondary-foreground': '35 25% 90%',
      '--muted': '25 12% 21%',
      '--muted-foreground': '30 18% 56%',
      '--accent': '15 60% 50%',
      '--accent-foreground': '25 20% 9%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '35 25% 90%',
      '--border': '25 14% 21%',
      '--input': '25 14% 21%',
      '--ring': '30 70% 50%',
      '--gold': '35 70% 55%',
      '--leaf': '120 35% 42%',
      '--sky': '200 35% 55%',
      '--purple': '290 30% 52%',
      '--peach': '20 60% 60%',
      '--starlight': '45 50% 72%',
    },
  },
  sakura_spring: {
    id: 'sakura_spring',
    label: 'Sakura Spring',
    cost: 200,
    color: 'hsl(330 50% 70%)',
    tokens: {
      '--background': '330 15% 10%',
      '--foreground': '340 20% 92%',
      '--card': '330 13% 14%',
      '--card-foreground': '340 20% 92%',
      '--popover': '330 13% 12%',
      '--popover-foreground': '340 20% 92%',
      '--primary': '330 50% 65%',
      '--primary-foreground': '330 15% 10%',
      '--secondary': '330 10% 18%',
      '--secondary-foreground': '340 20% 92%',
      '--muted': '330 8% 22%',
      '--muted-foreground': '330 12% 58%',
      '--accent': '120 40% 55%',
      '--accent-foreground': '330 15% 10%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '340 20% 92%',
      '--border': '330 10% 22%',
      '--input': '330 10% 22%',
      '--ring': '330 50% 65%',
      '--gold': '42 60% 58%',
      '--leaf': '120 40% 55%',
      '--sky': '200 40% 60%',
      '--purple': '280 30% 58%',
      '--peach': '20 60% 65%',
      '--starlight': '50 50% 74%',
    },
  },
  cozy_library: {
    id: 'cozy_library',
    label: 'Cozy Library',
    cost: 200,
    color: 'hsl(35 40% 55%)',
    tokens: {
      '--background': '30 18% 8%',
      '--foreground': '40 22% 90%',
      '--card': '30 16% 12%',
      '--card-foreground': '40 22% 90%',
      '--popover': '30 16% 10%',
      '--popover-foreground': '40 22% 90%',
      '--primary': '35 45% 52%',
      '--primary-foreground': '30 18% 8%',
      '--secondary': '30 12% 16%',
      '--secondary-foreground': '40 22% 90%',
      '--muted': '30 10% 20%',
      '--muted-foreground': '35 15% 55%',
      '--accent': '15 50% 50%',
      '--accent-foreground': '30 18% 8%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '40 22% 90%',
      '--border': '30 12% 20%',
      '--input': '30 12% 20%',
      '--ring': '35 45% 52%',
      '--gold': '40 50% 55%',
      '--leaf': '120 30% 45%',
      '--sky': '200 30% 55%',
      '--purple': '280 25% 52%',
      '--peach': '20 55% 60%',
      '--starlight': '45 45% 72%',
    },
  },
  northern_lights: {
    id: 'northern_lights',
    label: 'Northern Lights',
    cost: 200,
    color: 'hsl(150 50% 50%)',
    tokens: {
      '--background': '160 25% 6%',
      '--foreground': '150 20% 90%',
      '--card': '160 22% 10%',
      '--card-foreground': '150 20% 90%',
      '--popover': '160 22% 8%',
      '--popover-foreground': '150 20% 90%',
      '--primary': '150 50% 50%',
      '--primary-foreground': '160 25% 6%',
      '--secondary': '160 18% 14%',
      '--secondary-foreground': '150 20% 90%',
      '--muted': '160 16% 18%',
      '--muted-foreground': '155 14% 55%',
      '--accent': '200 45% 55%',
      '--accent-foreground': '160 25% 6%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '150 20% 90%',
      '--border': '160 18% 18%',
      '--input': '160 18% 18%',
      '--ring': '150 50% 50%',
      '--gold': '48 50% 58%',
      '--leaf': '150 50% 50%',
      '--sky': '200 45% 55%',
      '--purple': '265 35% 55%',
      '--peach': '15 55% 60%',
      '--starlight': '160 50% 72%',
    },
  },
};

// ── Theme Application ──

export function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.classic;
  const root = document.documentElement;
  for (const [token, value] of Object.entries(theme.tokens)) {
    root.style.setProperty(token, value);
  }
}

// ── Theme Management ──

export async function loadUserTheme() {
  try {
    const user = await base44.auth.me();
    const activeTheme = user?.active_theme || 'classic';
    applyTheme(activeTheme);
    return {
      activeTheme,
      purchasedThemes: user?.purchased_themes || ['classic'],
    };
  } catch (e) {
    applyTheme('classic');
    return { activeTheme: 'classic', purchasedThemes: ['classic'] };
  }
}

export async function setActiveTheme(themeId) {
  try {
    await base44.auth.updateMe({ active_theme: themeId });
    applyTheme(themeId);
    return true;
  } catch (e) {
    return false;
  }
}

export async function purchaseTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return { success: false, error: 'Unknown theme' };

  try {
    const user = await base44.auth.me();
    const purchased = user?.purchased_themes || ['classic'];
    if (purchased.includes(themeId)) {
      return { success: false, error: 'Already owned' };
    }

    const balance = user?.token_balance || 0;
    if (balance < theme.cost) {
      return { success: false, error: 'Insufficient tokens' };
    }

    // Deduct tokens
    await base44.entities.TokenTransaction.create({ amount: theme.cost, type: 'spend', reason: `Purchased ${theme.label} theme` });
    await base44.auth.updateMe({ token_balance: balance - theme.cost });

    // Add to purchased
    const updatedPurchased = [...purchased, themeId];
    await base44.auth.updateMe({ purchased_themes: updatedPurchased });

    // Auto-activate
    await base44.auth.updateMe({ active_theme: themeId });
    applyTheme(themeId);

    return { success: true, newBalance: balance - theme.cost };
  } catch (e) {
    return { success: false, error: 'Transaction failed' };
  }
}