import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader } from '@/components/MicroAnimations';
import { runNextTask, createTask } from '@/lib/bison/tasks/taskManager';
import { recordActivity } from '@/lib/bison/activity/activityManager';
import StatTile from '@/components/autonomy/StatTile';
import TaskList from '@/components/autonomy/TaskList';
import ActivityList from '@/components/autonomy/ActivityList';
import GoalForm from '@/components/autonomy/GoalForm';
import PermissionProfile from '@/components/autonomy/PermissionProfile';
import { Button } from '@/components/ui/button';

export default function BisonWork() {
  const [goals, setGoals] = useState([]); const [tasks, setTasks] = useState([]); const [activities, setActivities] = useState([]); const [working, setWorking] = useState(false);
  const load = () => Promise.all([base44.entities.BisonGoal.list('-priority', 20), base44.entities.BisonTask.list('-updated_date', 20), base44.entities.BisonActivity.list('-created_date', 20)]).then(([g, t, a]) => { setGoals(g); setTasks(t); setActivities(a); });
  useEffect(() => { load(); }, []);
  const addGoal = async title => { const goal = await base44.entities.BisonGoal.create({ title, priority: 50, status: 'ACTIVE' }); await recordActivity('GOAL_CREATED', `Bison received the goal “${title}”`, 'Add a task when you are ready to begin.'); setGoals([goal, ...goals]); load(); };
  const work = async () => { setWorking(true); await runNextTask(); setWorking(false); load(); };
  const makeChecklist = async () => { const goal = goals.find(goal => goal.status === 'ACTIVE'); await createTask({ title: 'Create next-steps checklist', description: 'Turn the active goal into a checklist.', capability_id: 'CREATE_CHECKLIST', goal_id: goal?.id, priority: 60, requires_user_approval: false, input: goal?.description || goal?.title || 'Define the next practical steps.' }); load(); };
  const active = goals.filter(goal => goal.status === 'ACTIVE'); const waiting = tasks.filter(task => task.status === 'WAITING_FOR_PERMISSION').length; const completed = tasks.filter(task => task.status === 'COMPLETED').length;
  return <div><PageHeader title="Bison Work" subtitle="Governed goals, useful tasks, and clear permission boundaries." /><div className="space-y-5 px-6 pb-8 lg:px-10"><PermissionProfile /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatTile label="State" value={working ? 'Working' : 'Ready'} color="text-leaf" /><StatTile label="Active goals" value={active.length} /><StatTile label="Completed" value={completed} color="text-gold" /><StatTile label="Needs you" value={waiting} color={waiting ? 'text-peach' : 'text-foreground'} /></div><GoalForm onCreate={addGoal} /><div className="flex flex-wrap gap-2"><Button onClick={makeChecklist} variant="outline">Create next-steps task</Button><Button onClick={work} disabled={working}>{working ? 'Working…' : 'Run next permitted task'}</Button></div><section className="glass rounded-xl p-5"><h2 className="mb-3 font-heading font-semibold">Goals</h2>{active.length ? <div className="space-y-2">{active.map(goal => <div key={goal.id} className="rounded-lg bg-secondary/30 p-3 text-sm">{goal.title}</div>)}</div> : <p className="text-sm text-muted-foreground">Set a goal to give Bison useful, bounded work.</p>}</section><section className="glass rounded-xl p-5"><h2 className="mb-3 font-heading font-semibold">Task queue</h2><TaskList tasks={tasks} /></section><section className="glass rounded-xl p-5"><h2 className="mb-3 font-heading font-semibold">Activity</h2><ActivityList activities={activities} /></section></div></div>;
}