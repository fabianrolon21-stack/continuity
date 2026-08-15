import { prioritize } from './taskPlanner';
export function nextReadyTask(tasks, goals) {
  const completed = new Set(tasks.filter(task => task.status === 'COMPLETED').map(task => task.id));
  return prioritize(tasks.filter(task => task.status === 'QUEUED' && (task.depends_on || []).every(id => completed.has(id))), goals)[0] || null;
}