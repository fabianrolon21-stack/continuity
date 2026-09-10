import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Sub-navigation inside a hub: a single glass rail with a sliding active pill.
export default function SectionNav({ hub, sections }) {
  const { pathname } = useLocation();
  if (!sections?.length) return null;
  return (
    <div className="px-4 lg:px-10 pt-4 lg:pt-6">
      <div className="glass glass-glow rounded-full p-1 flex gap-1 overflow-x-auto scrollbar-hide w-fit max-w-full">
        {sections.map(s => {
          const Icon = s.icon;
          const active = pathname === s.path;
          return (
            <Link
              key={s.path}
              to={s.path}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-500 no-tap-highlight"
              style={{ color: active ? hub.color : 'hsl(268 8% 60%)' }}
            >
              {active && (
                <motion.span
                  layoutId={`section-pill-${hub.id}`}
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: `${hub.color}1f`, boxShadow: `0 0 18px ${hub.color}30` }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              )}
              <Icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">{s.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}