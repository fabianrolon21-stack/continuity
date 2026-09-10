import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HUBS } from '@/lib/navigation';

export default function SidebarNav({ activeHub }) {
  return (
    <nav className="flex-1 px-3 space-y-1">
      {HUBS.map(hub => {
        const Icon = hub.icon;
        const active = activeHub.id === hub.id;
        return (
          <Link
            key={hub.id}
            to={hub.root}
            className="relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors duration-500 hover:text-foreground"
            style={{ color: active ? hub.color : 'hsl(268 8% 60%)' }}
          >
            {active && (
              <motion.span
                layoutId="sidebar-hub-pill"
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: `${hub.color}14`, boxShadow: `inset 0 0 0 1px ${hub.color}30, 0 0 24px ${hub.color}20` }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              />
            )}
            <Icon className="w-4 h-4 shrink-0 relative z-10" style={active ? { filter: `drop-shadow(0 0 6px ${hub.color})` } : {}} />
            <span className="relative z-10 font-medium">{hub.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}