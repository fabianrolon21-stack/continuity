// ═══════════════════════════════════════════════
// BUILT-IN MODULES (Base 44.4)
// Registers all existing Bison subsystems with the
// module registry. Each module reports version,
// dependencies, priority, frequency, and resources.
// ═══════════════════════════════════════════════

import { registerModule } from './moduleRegistry';
import { RUNTIME_PRIORITIES, FREQUENCY_MS } from './priorities';

let registered = false;

export function registerBuiltinModules() {
  if (registered) return;
  registered = true;

  // Identity Runtime — core identity continuity
  registerModule({
    name: 'identity_runtime',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.HIGH,
    frequency: FREQUENCY_MS.MINUTE,
    dependencies: [],
    estimatedResources: { memory: 'low', battery: 'low' },
    execute: async () => {
      // Identity context is loaded on-demand by the pipeline
      return null;
    },
  });

  // Human State — cognitive load, energy, stress
  registerModule({
    name: 'human_state',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.HIGH,
    frequency: FREQUENCY_MS.FAST,
    dependencies: [],
    estimatedResources: { memory: 'low', battery: 'low' },
    execute: async () => null,
  });

  // Weather — environmental context
  registerModule({
    name: 'weather',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.NORMAL,
    frequency: FREQUENCY_MS.MINUTE,
    dependencies: [],
    estimatedResources: { network: 'optional', battery: 'low', memory: 'low' },
    execute: async () => null,
  });

  // Garden — growth and care
  registerModule({
    name: 'garden',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.LOW,
    frequency: FREQUENCY_MS.HOURLY,
    dependencies: [],
    estimatedResources: { memory: 'low', battery: 'low' },
    execute: async () => null,
  });

  // Immune System — threat detection
  registerModule({
    name: 'immune_system',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.HIGH,
    frequency: FREQUENCY_MS.FAST,
    dependencies: [],
    estimatedResources: { memory: 'low', battery: 'low' },
    execute: async () => null,
  });

  // Knowledge — curated knowledge refresh
  registerModule({
    name: 'knowledge',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.LOW,
    frequency: FREQUENCY_MS.HOURLY,
    dependencies: [],
    estimatedResources: { network: 'required', battery: 'medium', memory: 'medium' },
    execute: async () => null,
  });

  // Meta Intelligence — systemic insight
  registerModule({
    name: 'meta_intelligence',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.NORMAL,
    frequency: FREQUENCY_MS.MINUTE,
    dependencies: ['identity_runtime', 'human_state'],
    estimatedResources: { memory: 'medium', battery: 'medium' },
    execute: async () => null,
  });

  // Calendar — events and reminders
  registerModule({
    name: 'calendar',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.NORMAL,
    frequency: FREQUENCY_MS.MINUTE,
    dependencies: [],
    estimatedResources: { network: 'optional', battery: 'low', memory: 'low' },
    execute: async () => null,
  });

  // Reflection — identity reflection cycle
  registerModule({
    name: 'reflection',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.NORMAL,
    frequency: FREQUENCY_MS.MINUTE,
    dependencies: ['identity_runtime'],
    estimatedResources: { memory: 'low', battery: 'low' },
    execute: async () => null,
  });

  // Ambient Runtime — background lighting, themes, animations
  registerModule({
    name: 'ambient_runtime',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.LOW,
    frequency: FREQUENCY_MS.FAST,
    dependencies: [],
    estimatedResources: { memory: 'low', battery: 'low' },
    execute: async () => null,
  });

  // Memory Maintenance — daily cleanup
  registerModule({
    name: 'memory_maintenance',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.LOW,
    frequency: FREQUENCY_MS.DAILY,
    dependencies: [],
    estimatedResources: { memory: 'medium', battery: 'medium' },
    execute: async () => null,
  });

  // Continuity Audit — daily identity audit
  registerModule({
    name: 'continuity_audit',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.LOW,
    frequency: FREQUENCY_MS.DAILY,
    dependencies: ['identity_runtime'],
    estimatedResources: { memory: 'low', battery: 'low' },
    execute: async () => null,
  });

  // Forecast Engine — predictive modeling
  registerModule({
    name: 'forecast_engine',
    version: '1.0.0',
    priority: RUNTIME_PRIORITIES.NORMAL,
    frequency: FREQUENCY_MS.HOURLY,
    dependencies: ['identity_runtime', 'human_state'],
    estimatedResources: { memory: 'medium', battery: 'medium' },
    execute: async () => null,
  });
}