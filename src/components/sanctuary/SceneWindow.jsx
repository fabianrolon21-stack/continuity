import { motion } from 'framer-motion';

// Space B — the window. Reflects time of day, weather,
// and the outside world. Always matches the world state.

export default function SceneWindow({ worldState }) {
  const { sky, weather } = worldState;
  const isNight = sky.isNight;
  const w = weather.current;

  return (
    <div
      className="relative rounded-t-[48px] rounded-b-lg overflow-hidden border-4"
      style={{
        width: 150,
        height: 180,
        borderColor: 'hsl(25 20% 20%)',
        boxShadow: 'inset 0 0 24px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.3)',
        background: `linear-gradient(to bottom, ${sky.top}, ${sky.mid}, ${sky.bottom})`,
        transition: 'background 3s ease-in-out',
      }}
    >
      {/* Sun / Moon */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: isNight ? 22 : 28,
          height: isNight ? 22 : 28,
          left: sky.sunPosition.x,
          top: sky.sunPosition.y,
          background: sky.sunColor,
          boxShadow: `0 0 ${isNight ? 12 : 24}px ${sky.sunColor}`,
          transition: 'all 3s ease-in-out',
        }}
        animate={{ opacity: w === 'fog' ? 0.3 : ['storm', 'rain', 'cloudy'].includes(w) ? 0.4 : 1 }}
      />

      {/* Stars at night */}
      {isNight && [...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ width: 2, height: 2, left: `${(i * 37) % 90 + 5}%`, top: `${(i * 23) % 55 + 5}%` }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* Clouds */}
      {['cloudy', 'rain', 'storm', 'snow'].includes(w) && (
        <motion.div
          className="absolute top-3 flex gap-2"
          animate={{ x: [-20, 20] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="w-14 h-6 rounded-full" style={{ background: 'hsl(220 15% 40% / 0.7)' }} />
          <div className="w-10 h-5 rounded-full mt-1" style={{ background: 'hsl(220 15% 35% / 0.6)' }} />
        </motion.div>
      )}

      {/* Rain streaks on glass */}
      {['rain', 'storm'].includes(w) && [...Array(7)].map((_, i) => (
        <motion.div
          key={`r${i}`}
          className="absolute w-px"
          style={{ left: `${8 + i * 13}%`, height: 14, background: 'hsl(200 60% 75% / 0.5)' }}
          animate={{ y: [-20, 190] }}
          transition={{ duration: 0.9 + (i % 3) * 0.3, repeat: Infinity, delay: i * 0.25, ease: 'linear' }}
        />
      ))}

      {/* Snow in the window */}
      {w === 'snow' && [...Array(8)].map((_, i) => (
        <motion.div
          key={`s${i}`}
          className="absolute rounded-full bg-white/80"
          style={{ width: 3, height: 3, left: `${5 + i * 12}%` }}
          animate={{ y: [-10, 185], x: [0, i % 2 ? 8 : -8] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.5, ease: 'linear' }}
        />
      ))}

      {/* Fog */}
      {w === 'fog' && (
        <motion.div
          className="absolute inset-0"
          style={{ background: 'hsl(220 15% 60% / 0.35)', backdropFilter: 'blur(1px)' }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      )}

      {/* Window cross frame */}
      <div className="absolute inset-x-0 top-1/2 h-1" style={{ background: 'hsl(25 20% 20%)' }} />
      <div className="absolute inset-y-0 left-1/2 w-1" style={{ background: 'hsl(25 20% 20%)' }} />
    </div>
  );
}