// ═══════════════════════════════════════════════
// DEVICE CAPABILITY REGISTRY
// Browser/web platform capabilities only.
// Native-only capabilities return NOT_AVAILABLE.
// Permissions are requested contextually, never during onboarding.
// ═══════════════════════════════════════════════

export const PERMISSION_STATES = {
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  NOT_REQUESTED: 'NOT_REQUESTED',
  DENIED: 'DENIED',
  LIMITED: 'LIMITED',
  AUTHORIZED: 'AUTHORIZED',
  RESTRICTED: 'RESTRICTED',
};

const BROWSER_CAPABILITIES = [
  { id: 'camera', label: 'Camera', browserAPI: 'navigator.mediaDevices', readAllowed: true, writeAllowed: false, requiresConfirmation: true, nativeOnly: false },
  { id: 'microphone', label: 'Microphone', browserAPI: 'navigator.mediaDevices', readAllowed: true, writeAllowed: false, requiresConfirmation: true, nativeOnly: false },
  { id: 'geolocation', label: 'Location', browserAPI: 'navigator.geolocation', readAllowed: true, writeAllowed: false, requiresConfirmation: true, nativeOnly: false },
  { id: 'notifications', label: 'Notifications', browserAPI: 'window.Notification', readAllowed: true, writeAllowed: true, requiresConfirmation: true, nativeOnly: false },
  { id: 'clipboard', label: 'Clipboard / Paste', browserAPI: 'navigator.clipboard', readAllowed: true, writeAllowed: true, requiresConfirmation: false, nativeOnly: false },
  { id: 'speech_recognition', label: 'Speech Recognition', browserAPI: 'window.SpeechRecognition', readAllowed: true, writeAllowed: false, requiresConfirmation: true, nativeOnly: false },
  { id: 'speech_synthesis', label: 'Text-to-Speech', browserAPI: 'window.speechSynthesis', readAllowed: false, writeAllowed: true, requiresConfirmation: false, nativeOnly: false },
  { id: 'file_access', label: 'Files / Documents', browserAPI: 'File API', readAllowed: true, writeAllowed: true, requiresConfirmation: true, nativeOnly: false },
];

const NATIVE_ONLY_CAPABILITIES = [
  { id: 'contacts', label: 'Contacts', nativeOnly: true },
  { id: 'calendar', label: 'Calendar', nativeOnly: true },
  { id: 'reminders', label: 'Reminders', nativeOnly: true },
  { id: 'health_fitness', label: 'Health / Fitness Data', nativeOnly: true },
  { id: 'motion_activity', label: 'Motion / Activity', nativeOnly: true },
  { id: 'biometric_auth', label: 'Biometric Authentication', nativeOnly: true },
  { id: 'live_activities', label: 'Live Activities / Widgets', nativeOnly: true },
  { id: 'background_activity', label: 'Background App Activity', nativeOnly: true },
  { id: 'bluetooth', label: 'Bluetooth / Nearby Devices', nativeOnly: true },
  { id: 'siri_integration', label: 'Siri / System Assistant', nativeOnly: true },
  { id: 'system_indexing', label: 'System Search / Indexing', nativeOnly: true },
  { id: 'document_scanning', label: 'Document Scanning', nativeOnly: true },
];

export const ALL_CAPABILITIES = [...BROWSER_CAPABILITIES, ...NATIVE_ONLY_CAPABILITIES];

const PERM_NAME_MAP = { camera: 'camera', microphone: 'microphone', geolocation: 'geolocation', notifications: 'notifications' };

function isBrowserCapAvailable(cap) {
  if (cap.id === 'camera' || cap.id === 'microphone') return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  if (cap.id === 'geolocation') return typeof navigator !== 'undefined' && !!navigator.geolocation;
  if (cap.id === 'notifications') return typeof window !== 'undefined' && 'Notification' in window;
  if (cap.id === 'clipboard') return typeof navigator !== 'undefined' && !!navigator.clipboard;
  if (cap.id === 'speech_recognition') return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  if (cap.id === 'speech_synthesis') return typeof window !== 'undefined' && 'speechSynthesis' in window;
  if (cap.id === 'file_access') return typeof window !== 'undefined';
  return false;
}

export async function getCapabilityStatus(capabilityId) {
  const cap = ALL_CAPABILITIES.find(c => c.id === capabilityId);
  if (!cap) return { id: capabilityId, label: capabilityId, permissionStatus: PERMISSION_STATES.NOT_AVAILABLE, available: false };
  if (cap.nativeOnly) return { ...cap, permissionStatus: PERMISSION_STATES.NOT_AVAILABLE, available: false };
  const available = isBrowserCapAvailable(cap);
  if (!available) return { ...cap, permissionStatus: PERMISSION_STATES.NOT_AVAILABLE, available: false };
  const permName = PERM_NAME_MAP[capabilityId];
  if (permName && navigator.permissions?.query) {
    try {
      const result = await navigator.permissions.query({ name: permName });
      let status = PERMISSION_STATES.NOT_REQUESTED;
      if (result.state === 'granted') status = PERMISSION_STATES.AUTHORIZED;
      else if (result.state === 'denied') status = PERMISSION_STATES.DENIED;
      return { ...cap, permissionStatus: status, available: true };
    } catch (e) {
      return { ...cap, permissionStatus: PERMISSION_STATES.NOT_REQUESTED, available: true };
    }
  }
  return { ...cap, permissionStatus: PERMISSION_STATES.NOT_REQUESTED, available: true };
}

export async function requestCapability(capabilityId) {
  const cap = ALL_CAPABILITIES.find(c => c.id === capabilityId);
  if (!cap || cap.nativeOnly) return { allowed: false, reason: 'Not available on web platform. Requires native app.' };
  if (!isBrowserCapAvailable(cap)) return { allowed: false, reason: 'Capability not available in this browser.' };
  try {
    if (capabilityId === 'camera' || capabilityId === 'microphone') {
      await navigator.mediaDevices.getUserMedia({ [capabilityId === 'camera' ? 'video' : 'audio']: true });
      return { allowed: true, permissionStatus: PERMISSION_STATES.AUTHORIZED };
    }
    if (capabilityId === 'geolocation') {
      return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
          () => resolve({ allowed: true, permissionStatus: PERMISSION_STATES.AUTHORIZED }),
          (err) => resolve({ allowed: false, permissionStatus: PERMISSION_STATES.DENIED, reason: err.message }),
          { timeout: 10000 }
        );
      });
    }
    if (capabilityId === 'notifications') {
      const perm = await Notification.requestPermission();
      return { allowed: perm === 'granted', permissionStatus: perm === 'granted' ? PERMISSION_STATES.AUTHORIZED : PERMISSION_STATES.DENIED };
    }
    return { allowed: true, permissionStatus: PERMISSION_STATES.NOT_REQUESTED };
  } catch (e) {
    return { allowed: false, permissionStatus: PERMISSION_STATES.DENIED, reason: e.message || 'Permission denied' };
  }
}

export async function listCapabilities() {
  return Promise.all(ALL_CAPABILITIES.map(cap => getCapabilityStatus(cap.id)));
}