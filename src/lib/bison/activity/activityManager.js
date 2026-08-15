import { base44 } from '@/api/base44Client';
export function recordActivity(type, title, detail = '', extras = {}) {
  return base44.entities.BisonActivity.create({ type, title, detail, severity: type.includes('FAILED') ? 'error' : type.includes('WAITING') || type.includes('PERMISSION') ? 'warning' : 'success', ...extras });
}