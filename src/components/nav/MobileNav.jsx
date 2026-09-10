import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HUBS } from '@/lib/navigation';

export default function MobileNav({ activeHub }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md mb-2 glass glass-glow rounded-2xl flex items-center justify-around px-1">
        {HUBS.map(hub => {
          const Icon = hub.icon;
          const active = activeHub.id === hub.id;
          return (
            <Link
              key={hub.id}
              to={hub.root}
              className="relative flex flex-col items-center gap-1 py-2.5 flex-1 touch-target no-tap-highlight transition-colors duration-500"
              style={{ color: active ? hub.color : 'hsl(268 8% 50%)' }}
            >
              {active && (
                <motion.span
                  layoutId="mobile-hub-glow"
                  className="absolute top-1 w-8 h-8 rounded-full"
                  style={{ backgroundColor: `${hub.color}22`, boxShadow: `0 0 20px ${hub.color}40` }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="text-[10px] font-medium relative z-10">{hub.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}