// ═══════════════════════════════════════════════
// LOCALIZATION (Package O — Localization)
// Lightweight i18n module. Stores language preference
// on the user entity. Falls back to English.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const TRANSLATIONS = {
  en: {
    'sanctuary.title': 'Sanctuary',
    'sanctuary.subtitle': 'Your private space for continuity',
    'sanctuary.greeting_morning': 'Good morning',
    'sanctuary.greeting_afternoon': 'Good afternoon',
    'sanctuary.greeting_evening': 'Good evening',
    'bison.title': 'Bison',
    'checkin.title': 'Check-in',
    'journal.title': 'Journal',
    'reflect.title': 'Reflect',
    'archives.title': 'Archives',
    'insights.title': 'Insights',
    'community.title': 'Community',
    'settings.title': 'Settings',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
  },
  es: {
    'sanctuary.title': 'Santuario',
    'sanctuary.subtitle': 'Tu espacio privado para la continuidad',
    'sanctuary.greeting_morning': 'Buenos días',
    'sanctuary.greeting_afternoon': 'Buenas tardes',
    'sanctuary.greeting_evening': 'Buenas noches',
    'bison.title': 'Bison',
    'checkin.title': 'Registro',
    'journal.title': 'Diario',
    'reflect.title': 'Reflexionar',
    'archives.title': 'Archivos',
    'insights.title': 'Perspectivas',
    'community.title': 'Comunidad',
    'settings.title': 'Ajustes',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.loading': 'Cargando...',
  },
  he: {
    'sanctuary.title': 'מקלט',
    'sanctuary.subtitle': 'המרחב הפרטי שלך להמשכיות',
    'sanctuary.greeting_morning': 'בוקר טוב',
    'sanctuary.greeting_afternoon': 'צהריים טובים',
    'sanctuary.greeting_evening': 'ערב טוב',
    'bison.title': 'ביזון',
    'checkin.title': 'צ׳ק-אין',
    'journal.title': 'יומן',
    'reflect.title': 'התבוננות',
    'archives.title': 'ארכיון',
    'insights.title': 'תובנות',
    'community.title': 'קהילה',
    'settings.title': 'הגדרות',
    'common.save': 'שמור',
    'common.cancel': 'ביטול',
    'common.delete': 'מחק',
    'common.edit': 'ערוך',
    'common.loading': 'טוען...',
  },
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'he', label: 'עברית', flag: '🇮🇱', rtl: true },
];

let currentLang = 'en';

export function setLanguage(lang) {
  currentLang = TRANSLATIONS[lang] ? lang : 'en';
  base44.auth.updateMe({ language: currentLang }).catch(() => {});
}

export function getLanguage() {
  return currentLang;
}

export function isRTL() {
  return SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.rtl || false;
}

export function t(key) {
  const lang = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return lang[key] || TRANSLATIONS.en[key] || key;
}

export async function initLanguage() {
  try {
    const user = await base44.auth.me();
    if (user?.language && TRANSLATIONS[user.language]) {
      currentLang = user.language;
    }
  } catch (e) {}
}

export function Translate({ children, k }) {
  return t(k) || children;
}