import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { collectDashboardState } from '@/lib/bison/dashboardDataCollector';
import { PageHeader } from '@/components/MicroAnimations';
import TrustDashboard from '@/components/TrustDashboard';
import { Eye, ToggleLeft, ToggleRight } from 'lucide-react';

export default function TrustDashboardPage() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardEnabled, setDashboardEnabled] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      const enabled = user?.dashboard_enabled ?? false;
      setDashboardEnabled(enabled);
      if (!enabled) {
        setLoading(false);
        return;
      }
      collectDashboardState().then(dashState => {
        setState(dashState);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    const newValue = !dashboardEnabled;
    setDashboardEnabled(newValue);
    try {
      await base44.auth.updateMe({ dashboard_enabled: newValue });
      if (!newValue) {
        setState(null);
      } else {
        setLoading(true);
        const dashState = await collectDashboardState();
        setState(dashState);
        setLoading(false);
      }
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-sky-accent/30 border-t-sky-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Trust Dashboard"
        subtitle="Radical transparency — what Bison sees, knows, and upholds"
        accent="hsl(199 56% 64%)"
      />
      <div className="px-6 lg:px-10 pb-4">
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-sky-accent" />
            <span className="text-sm text-muted-foreground">Dashboard is {dashboardEnabled ? 'enabled' : 'disabled'}</span>
          </div>
          <button onClick={handleToggle} className="flex items-center gap-2 text-sm">
            {dashboardEnabled
              ? <ToggleRight className="w-6 h-6 text-sky-accent" />
              : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
          </button>
        </div>
      </div>
      {dashboardEnabled ? (
        <TrustDashboard state={state} onToggle={handleToggle} />
      ) : (
        <div className="px-6 lg:px-10 pb-8">
          <div className="glass rounded-xl p-8 text-center">
            <Eye className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Dashboard is off</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm mx-auto">
              Enable the dashboard to see what Bison observes, remembers, and how it upholds its constitutional promises.
              This is an accountability tool, not a surveillance tool. Bison never mentions it unprompted.
            </p>
            <button
              onClick={handleToggle}
              className="mt-4 px-4 py-2 rounded-lg bg-sky-accent/15 text-sky-accent text-sm font-medium hover:bg-sky-accent/25 transition-colors"
            >
              Enable Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}