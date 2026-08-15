export function scoreTask(task, goal = {}) {
  const ageHours = Math.min(20, (Date.now() - new Date(task.created_date || Date.now()).getTime()) / 3600000);
  const urgency = goal.deadline ? Math.max(0, 30 - (new Date(goal.deadline).getTime() - Date.now()) / 86400000) : 0;
  return (goal.priority || 0) + (task.priority || 0) + urgency + ageHours - (task.requires_user_approval ? 15 : 0);
}
export function prioritize(tasks, goals) {
  const goalById = Object.fromEntries(goals.map(goal => [goal.id, goal]));
  return [...tasks].sort((a, b) => scoreTask(b, goalById[b.goal_id]) - scoreTask(a, goalById[a.goal_id]));
}