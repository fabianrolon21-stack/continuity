// ═══════════════════════════════════════════════
// BACKGROUND LAYER (Package 018 — Immersive Environment)
// Orchestrates all 4 layers + weather + Bison environment.
// Replaces the old simple BackgroundLayer with a full
// immersive environment system.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import LivingWorld from '@/components/world/LivingWorld';
import SymbolDriftLayer from '@/components/environment/SymbolDriftLayer';
import DecorativePatternLayer from '@/components/environment/DecorativePatternLayer';
import AmbientLightingLayer from '@/components/environment/AmbientLightingLayer';
import WeatherOverlay from '@/components/environment/WeatherOverlay';
import BisonEnvironment from '@/components/environment/BisonEnvironment';
import { autoDetectPerformanceMode } from '@/lib/world/performanceModes';
import { getThemeProperties } from '@/lib/environment/themeProperties';
import { getEnvironment } from '@/lib/environment/environmentDefinitions';
import { getWeatherState } from '@/lib/environment/weatherEngine';
import { computeWorldState } from '@/lib/world/worldStateEngine';
import { base44 } from '@/api/base44Client';

export default function BackgroundLayer() {
  const [settings, setSettings] = useState({
    performanceMode: 'balanced',
    activeTheme: 'classic',
    activeEnvironment: null,
    weatherPermission: false,
    accessibility: {},
    userBirthday: null,
  });
  const [weatherCondition, setWeatherCondition] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setSettings({
        performanceMode: user?.performance_mode || autoDetectPerformanceMode(),
        activeTheme: user?.active_theme || 'classic',
        activeEnvironment: user?.active_environment || null,
        weatherPermission: user?.weather_permission || false,
        accessibility: user?.accessibility_settings || {},
        userBirthday: user?.birthday || null,
      });
    }).catch(() => {
      setSettings(prev => ({ ...prev, performanceMode: autoDetectPerformanceMode() }));
    });
  }, []);

  useEffect(() => {
    if (settings.weatherPermission && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const weather = await getWeatherState({
            useRealWeather: true,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
          setWeatherCondition(weather.condition);
        },
        () => {
          const ws = computeWorldState({ userBirthday: settings.userBirthday });
          setWeatherCondition(ws.weather.current);
        },
        { timeout: 10000, maximumAge: 600000 }
      );
    } else {
      const ws = computeWorldState({ userBirthday: settings.userBirthday });
      setWeatherCondition(ws.weather.current);
    }
  }, [settings.weatherPermission, settings.userBirthday]);

  const { performanceMode, activeTheme, activeEnvironment, accessibility, userBirthday } = settings;
  const themeProps = getThemeProperties(activeTheme);
  const env = activeEnvironment ? getEnvironment(activeEnvironment) : null;

  const particleType = env?.particleType || themeProps.particleType;
  const particleColor = env?.particleColor || themeProps.particleColor;

  const reduceMotion = accessibility.reduced_motion || false;
  const disableWeather = accessibility.disable_weather_effects || false;
  const disableDecorative = accessibility.disable_decorative_patterns || false;
  const staticBackground = accessibility.static_background_mode || false;

  return (
    <>
      <LivingWorld performanceMode={performanceMode} userBirthday={userBirthday} />
      <SymbolDriftLayer disabled={disableDecorative} reduceMotion={reduceMotion} />
      <BisonEnvironment themeId={activeTheme} reduceMotion={reduceMotion} />
      <DecorativePatternLayer
        themeId={activeTheme}
        performanceMode={performanceMode}
        disableDecorativePatterns={disableDecorative}
        reduceMotion={reduceMotion}
      />
      <AmbientLightingLayer
        themeId={activeTheme}
        weatherCondition={weatherCondition}
        staticBackground={staticBackground}
      />
      <WeatherOverlay
        particleType={particleType}
        particleColor={particleColor}
        performanceMode={performanceMode}
        disableWeather={disableWeather}
        reduceMotion={reduceMotion}
      />
    </>
  );
}