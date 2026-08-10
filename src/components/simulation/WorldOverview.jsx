import { Building2, Users, Landmark, TrendingUp } from 'lucide-react';

export default function WorldOverview({ summary }) {
  const stats = [
    { icon: Users, label: 'Agents', value: summary.agents },
    { icon: Landmark, label: 'Organizations', value: summary.organizations },
    { icon: Building2, label: 'Avg condition', value: `${summary.avgCondition}%` },
    { icon: TrendingUp, label: 'Economy', value: summary.economyIndex },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="glass framed rounded-xl p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[11px]">{s.label}</span>
            </div>
            <p className="text-lg font-heading font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        );
      })}
    </div>
  );
}