export default function StatTile({ label, value, color = 'text-foreground' }) {
  return <div className="rounded-lg bg-secondary/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p></div>;
}