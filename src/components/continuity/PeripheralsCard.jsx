import { ArrowLeft, ArrowRight, Crosshair } from 'lucide-react';

export default function PeripheralsCard({ peripherals }) {
  if (!peripherals) {
    return <div className="glass rounded-xl p-4 text-xs text-muted-foreground">Peripheral vision withheld — reliability is below the lateral-options threshold (60%).</div>;
  }
  return (
    <div className="glass rounded-xl p-4 space-y-2 text-xs">
      <div className="flex items-center gap-2"><ArrowLeft className="w-3.5 h-3.5 text-sky-accent shrink-0" /><span>{peripherals.lookLeft}</span></div>
      <div className="flex items-center gap-2"><Crosshair className="w-3.5 h-3.5 text-gold shrink-0" /><span className="font-medium">{peripherals.center}</span></div>
      <div className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-sky-accent shrink-0" /><span>{peripherals.lookRight}</span></div>
    </div>
  );
}