// ═══════════════════════════════════════════════
// WINDOW VIEW (Phase 31 — Living World)
// The room has a window. That window always reflects
// reality — rain, snow, sunset, stars, storm.
// ═══════════════════════════════════════════════

import WorldParticles from './WorldParticles';

export default function WindowView({ worldState, performanceMode = 'balanced' }) {
  const { sky, weather, time } = worldState;

  // What's visible outside the window
  const outsideParticles = [];
  if (weather.current === 'rain' || weather.current === 'storm') outsideParticles.push('rain');
  if (weather.current === 'snow') outsideParticles.push('snow');
  if (sky.isNight) outsideParticles.push('stars');
  if (weather.current === 'fog') outsideParticles.push('mist');

  // Window frame color based on time
  const frameColor = sky.isNight ? 'hsl(25 30% 12%)' : 'hsl(25 40% 20%)';

  // Interior light glow on window frame
  const interiorGlow = sky.isNight ? 'hsl(45 60% 50% / 0.15)' : 'transparent';

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        width: '100%',
        height: '100%',
        border: `8px solid ${frameColor}`,
        boxShadow: `inset 0 0 20px hsl(0 0% 0% / 0.3), 0 4px 20px hsl(0 0% 0% / 0.4), 0 0 30px ${interiorGlow}`,
      }}
    >
      {/* Sky gradient — matches the world sky */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 50%, ${sky.bottom} 100%)`,
          transition: 'background 3s ease-in-out',
        }}
      />

      {/* Sun or moon */}
      {!sky.isNight ? (
        <div
          className="absolute rounded-full"
          style={{
            left: sky.sunPosition.x,
            top: sky.sunPosition.y,
            width: '30px',
            height: '30px',
            background: `radial-gradient(circle, ${sky.sunColor} 0%, ${sky.sunColor}88 50%, transparent 100%)`,
            boxShadow: `0 0 25px ${sky.sunColor}66`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 3s ease-in-out',
          }}
        />
      ) : (
        <div
          className="absolute rounded-full"
          style={{
            right: '25%',
            top: '20%',
            width: '25px',
            height: '25px',
            background: 'radial-gradient(circle, hsl(48 67% 85%) 0%, hsl(48 50% 70%) 70%, transparent 100%)',
            boxShadow: '0 0 15px hsl(48 50% 70% / 0.4)',
          }}
        />
      )}

      {/* Distant hills / silhouette */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ height: '35%' }}>
        <path
          d="M0,30 L0,20 Q15,12 30,16 T60,14 T100,18 L100,30 Z"
          fill={sky.isNight ? 'hsl(250 30% 8%)' : 'hsl(260 20% 15%)'}
          opacity="0.8"
        />
        <path
          d="M0,30 L0,24 Q20,18 40,21 T80,20 T100,22 L100,30 Z"
          fill={sky.isNight ? 'hsl(250 25% 5%)' : 'hsl(260 20% 10%)'}
        />
      </svg>

      {/* Outside weather particles */}
      <WorldParticles particleTypes={outsideParticles} performanceMode={performanceMode} />

      {/* Window cross frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{ width: '4px', height: '100%', background: frameColor }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{ height: '4px', width: '100%', background: frameColor }} />
      </div>

      {/* Rain streaks on glass */}
      {(weather.current === 'rain' || weather.current === 'storm') && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 70%, hsl(200 50% 60% / 0.08) 100%)',
          }}
        />
      )}

      {/* Fog on glass */}
      {weather.current === 'fog' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'hsl(0 0% 80% / 0.15)',
            backdropFilter: 'blur(1px)',
          }}
        />
      )}
    </div>
  );
}