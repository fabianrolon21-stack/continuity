export default function TaskList({ tasks }) {
  if (!tasks.length) return <p className="text-sm text-muted-foreground">No tasks yet.</p>;
  return <div className="space-y-2">{tasks.slice(0, 6).map(task => <div key={task.id} className="rounded-lg bg-secondary/30 p-3"><p className="text-sm font-medium">{task.title}</p><p className="mt-1 text-xs text-muted-foreground">{task.status.replaceAll('_', ' ')} · {task.capability_id.replaceAll('_', ' ')}</p>{task.result && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{task.result}</p>}</div>)}</div>;
}