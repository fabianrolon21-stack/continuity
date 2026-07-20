import { motion } from 'framer-motion';

const MOOD_COLORS = {
  happy: '#6BBF6B',
  calm: '#D4A843',
  sad: '#6CB4D9',
  anxious: '#9B7EC8',
  angry: '#E8A07A',
  neutral: '#D4A843',
};

export default function BisonCompanion({ mood = 'neutral', size = 'md' }) {
  const sizes = { sm: 'w-16 h-16', md: 'w-32 h-32', lg: 'w-48 h-48', xl: 'w-64 h-64' };
  const color = MOOD_COLORS[mood] || MOOD_COLORS.neutral;

  return (
    <motion.div
      className={`${sizes[size]} relative mx-auto`}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: `drop-shadow(0 4px 20px ${color}40)` }}>
        <motion.g
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '100px', originY: '120px' }}
        >
          {/* Body */}
          <path
            d="M 45 125 Q 50 85 95 82 Q 135 82 148 115 L 152 135 Q 150 148 135 150 L 60 150 Q 45 148 43 138 Z"
            fill={color}
            opacity="0.92"
          />
          {/* Head */}
          <path
            d="M 138 95 Q 168 95 170 118 Q 170 135 155 138 L 140 132 Q 135 120 138 95 Z"
            fill={color}
          />
          {/* Horns */}
          <path d="M 160 92 Q 178 80 182 68" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 168 92 Q 185 82 190 72" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Legs */}
          <line x1="60" y1="148" x2="58" y2="172" stroke={color} strokeWidth="7" strokeLinecap="round" />
          <line x1="82" y1="150" x2="80" y2="178" stroke={color} strokeWidth="7" strokeLinecap="round" />
          <line x1="112" y1="150" x2="114" y2="178" stroke={color} strokeWidth="7" strokeLinecap="round" />
          <line x1="134" y1="148" x2="136" y2="172" stroke={color} strokeWidth="7" strokeLinecap="round" />
          {/* Tail */}
          <path d="M 45 130 Q 35 135 32 150" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Eye */}
          <motion.circle
            cx="158"
            cy="112"
            r="3.5"
            fill="#1A1520"
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, times: [0, 0.85, 0.9, 0.95] }}
            style={{ originY: '112px' }}
          />
          {/* Nose */}
          <circle cx="168" cy="128" r="2.5" fill="#1A1520" opacity="0.6" />
        </motion.g>
      </svg>
    </motion.div>
  );
}