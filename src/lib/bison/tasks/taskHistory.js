import { base44 } from '@/api/base44Client';
export const getTaskHistory = () => base44.entities.BisonTask.list('-updated_date', 50);