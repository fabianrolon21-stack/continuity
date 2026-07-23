// ═══════════════════════════════════════════════
// RESOURCE MANAGER (Base 44.4)
// Tracks CPU, memory, battery, network, storage,
// temperature. Dynamically adjusts runtime frequency.
// ═══════════════════════════════════════════════

const resourceState = {
  batteryLevel: null,
  batteryCharging: null,
  networkOnline: true,
  connectionType: null,
  memoryUsage: null,
  thermalState: 'nominal',
  storageAvailable: null,
};

let batteryManager = null;

export async function initResources() {
  // Battery API (Chrome/Edge)
  if (navigator.getBattery) {
    try {
      batteryManager = await navigator.getBattery();
      const updateBattery = () => {
        resourceState.batteryLevel = batteryManager.level;
        resourceState.batteryCharging = batteryManager.charging;
      };
      updateBattery();
      batteryManager.addEventListener('levelchange', updateBattery);
      batteryManager.addEventListener('chargingchange', updateBattery);
    } catch (e) {}
  }

  // Network status
  resourceState.networkOnline = navigator.onLine;
  if (navigator.connection) {
    resourceState.connectionType = navigator.connection.effectiveType;
    navigator.connection.addEventListener('change', () => {
      resourceState.connectionType = navigator.connection.effectiveType;
    });
  }
  window.addEventListener('online', () => { resourceState.networkOnline = true; });
  window.addEventListener('offline', () => { resourceState.networkOnline = false; });

  // Memory (Chrome only)
  if (performance.memory) {
    resourceState.memoryUsage =
      performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
  }

  // Storage estimate
  if (navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate();
      resourceState.storageAvailable = est.quota - est.usage;
    } catch (e) {}
  }
}

export function getResources() {
  if (performance.memory) {
    resourceState.memoryUsage =
      performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
  }
  resourceState.networkOnline = navigator.onLine;
  return { ...resourceState };
}

export function getBatteryLevel() {
  return resourceState.batteryLevel;
}

export function isBatteryCritical() {
  return (
    resourceState.batteryLevel !== null &&
    resourceState.batteryLevel < 0.15 &&
    !resourceState.batteryCharging
  );
}

export function isBatteryLow() {
  return (
    resourceState.batteryLevel !== null &&
    resourceState.batteryLevel < 0.30 &&
    !resourceState.batteryCharging
  );
}

export function isNetworkAvailable() {
  return resourceState.networkOnline;
}

export function canExecute(estimatedResources = {}) {
  if (isBatteryCritical()) {
    if (estimatedResources.battery !== 'critical-ok') return false;
  }
  if (!resourceState.networkOnline && estimatedResources.network === 'required')
    return false;
  if (resourceState.memoryUsage > 0.85 && estimatedResources.memory === 'high')
    return false;
  return true;
}

export function getRecommendedFrequencyMultiplier() {
  if (isBatteryCritical()) return 4;
  if (isBatteryLow()) return 2;
  return 1;
}

export function buildResourceContextString() {
  const r = getResources();
  const battery =
    r.batteryLevel !== null
      ? `${Math.round(r.batteryLevel * 100)}%${r.batteryCharging ? ' ⚡' : ''}`
      : 'unknown';
  const mem = r.memoryUsage ? `${Math.round(r.memoryUsage * 100)}%` : 'unknown';
  return `\nRUNTIME RESOURCES:\n- Battery: ${battery}\n- Network: ${r.networkOnline ? 'online' : 'offline'}\n- Connection: ${r.connectionType || 'unknown'}\n- Memory: ${mem}\n- Thermal: ${r.thermalState}\n`;
}