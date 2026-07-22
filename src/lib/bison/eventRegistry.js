// ═══════════════════════════════════════════════
// EVENT REGISTRY (Universal Event Engine)
// 18 event types with classification, priority
// assignment, context integration, and impact
// assessment.
// ═══════════════════════════════════════════════

export const EVENT_TYPES = {
  calendar:          { label: 'Calendar',     icon: 'Calendar',  defaultPriority: 'medium',    classification: 'actionable' },
  reminder:          { label: 'Reminder',      icon: 'Bell',      defaultPriority: 'medium',    classification: 'actionable' },
  goal:              { label: 'Goal',          icon: 'Target',    defaultPriority: 'high',      classification: 'actionable' },
  habit:             { label: 'Habit',         icon: 'Repeat',    defaultPriority: 'low',       classification: 'informational' },
  time:              { label: 'Time',          icon: 'Clock',     defaultPriority: 'low',       classification: 'system' },
  weather:           { label: 'Weather',       icon: 'Cloud',     defaultPriority: 'low',       classification: 'informational', requiresPermission: true },
  device:            { label: 'Device',        icon: 'Smartphone',defaultPriority: 'low',       classification: 'system' },
  battery:           { label: 'Battery',       icon: 'Battery',   defaultPriority: 'low',       classification: 'system' },
  location:          { label: 'Location',      icon: 'MapPin',    defaultPriority: 'low',       classification: 'informational', requiresPermission: true },
  travel:            { label: 'Travel',        icon: 'Plane',     defaultPriority: 'medium',    classification: 'actionable' },
  learning:          { label: 'Learning',      icon: 'BookOpen',  defaultPriority: 'low',       classification: 'informational' },
  health:            { label: 'Health',        icon: 'Heart',     defaultPriority: 'high',      classification: 'actionable' },
  financial:         { label: 'Financial',     icon: 'DollarSign', defaultPriority: 'medium',   classification: 'actionable' },
  project_milestone: { label: 'Project',       icon: 'Flag',      defaultPriority: 'medium',    classification: 'actionable' },
  communication:     { label: 'Communication', icon: 'MessageCircle', defaultPriority: 'medium', classification: 'actionable' },
  security:          { label: 'Security',      icon: 'Shield',    defaultPriority: 'high',      classification: 'urgent' },
  achievement:       { label: 'Achievement',   icon: 'Trophy',    defaultPriority: 'medium',    classification: 'informational' },
  user_defined:      { label: 'Custom',        icon: 'Star',      defaultPriority: 'medium',    classification: 'actionable' },
};

export const PRIORITY_LEVELS = {
  critical: { weight: 4, color: 'hsl(0 70% 50%)', label: 'Critical' },
  high:     { weight: 3, color: 'hsl(21 73% 69%)', label: 'High' },
  medium:   { weight: 2, color: 'hsl(42 63% 55%)', label: 'Medium' },
  low:      { weight: 1, color: 'hsl(199 56% 64%)', label: 'Low' },
};

export const IMPACT_AREAS = [
  'relationships', 'goals', 'schedule', 'emotional', 'memory', 'planning', 'health', 'security',
];

// Classify and assign priority to an incoming event
export function classifyEvent(eventType, rawEvent) {
  const typeConfig = EVENT_TYPES[eventType] || EVENT_TYPES.user_defined;
  const detectedPriority = detectPriority(eventType, rawEvent);
  const impactAreas = detectImpactAreas(eventType, rawEvent);

  return {
    event_type: eventType,
    title: rawEvent.title || typeConfig.label,
    description: rawEvent.description || '',
    priority: detectedPriority || typeConfig.defaultPriority,
    classification: typeConfig.classification,
    context_data: JSON.stringify(rawEvent.context || {}),
    impact_areas: impactAreas,
    companion_action: suggestCompanionAction(eventType, detectedPriority, impactAreas),
    is_processed: false,
  };
}

function detectPriority(eventType, rawEvent) {
  const text = `${rawEvent.title || ''} ${rawEvent.description || ''}`.toLowerCase();
  const urgencyWords = ['urgent', 'critical', 'emergency', 'immediately', 'deadline', 'overdue', 'alert', 'warning'];
  if (urgencyWords.some(w => text.includes(w))) return 'critical';
  if (eventType === 'security' && rawEvent.severity === 'high') return 'critical';
  if (eventType === 'health' && rawEvent.severity === 'high') return 'high';
  if (rawEvent.overdue) return 'high';
  return null;
}

function detectImpactAreas(eventType, rawEvent) {
  const areas = [];
  const map = {
    calendar: ['schedule', 'planning'],
    reminder: ['schedule', 'planning'],
    goal: ['goals', 'planning'],
    habit: ['health', 'goals'],
    health: ['health', 'emotional'],
    security: ['security', 'memory'],
    achievement: ['emotional', 'goals'],
    communication: ['relationships', 'emotional'],
    financial: ['planning', 'goals'],
    location: ['schedule', 'planning'],
    travel: ['schedule', 'planning'],
    learning: ['goals', 'memory'],
    project_milestone: ['goals', 'planning'],
    device: ['security'],
    battery: ['security'],
  };
  return map[eventType] || ['planning'];
}

function suggestCompanionAction(eventType, priority, impactAreas) {
  if (priority === 'critical') return 'GROUND — stabilize and alert immediately';
  if (priority === 'high') return 'STABILIZE — acknowledge and offer support';
  if (impactAreas.includes('emotional')) return 'AFFIRM — validate and reflect';
  if (impactAreas.includes('goals')) return 'EXPLORE — connect to user goals';
  if (eventType === 'achievement') return 'CELEBRATE — acknowledge growth';
  return 'REFLECT — acknowledge and store';
}

export function getEventColor(eventType, priority) {
  if (priority) return PRIORITY_LEVELS[priority].color;
  return EVENT_TYPES[eventType]?.color || 'hsl(268 8% 60%)';
}