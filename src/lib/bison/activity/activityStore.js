import { base44 } from '@/api/base44Client';
export const listActivities = () => base44.entities.BisonActivity.list('-created_date', 30);