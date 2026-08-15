export default function ActivityList({ activities }) {
  if (!activities.length) return <p className="text-sm text-muted-foreground">Useful work and permission updates will appear here.</p>;
  return <div className="space-y-2">{activities.slice(0, 8).map(activity => <div key={activity.id} className="border-l-2 border-gold/50 pl-3"><p className="text-sm font-medium">{activity.title}</p><p className="text-xs text-muted-foreground">{activity.detail}</p></div>)}</div>;
}