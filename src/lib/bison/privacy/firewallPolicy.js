// ═══════════════════════════════════════════════
// EXTERNAL COMMUNICATION POLICY (Package 44)
// The firewall is ON by default. Nothing leaves the
// runtime until the user opens a specific channel.
// Lockdown overrides every other setting, always.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

export const CHANNELS = [
  { id: 'weather', label: 'Weather', note: 'Approximate location only. Never stored.' },
  { id: 'web', label: 'Web / Wikipedia', note: 'Your current question only. No memories.' },
  { id: 'external_ai', label: 'External AI', note: 'Current query only. No journal, no memories.' },
  { id: 'oracle', label: 'Oracle Consultation', note: 'Sanitized question sent to another model.' },
  { id: 'news', label: 'News', note: 'Topic keywords only.' },
  { id: 'community', label: 'Community Sharing', note: 'Anonymous achievements only.' },
  { id: 'updates', label: 'Update Checks', note: 'Version numbers only. No personal data.' },
  { id: 'tools', label: 'External Tools', note: 'Only the parameters a tool requires.' },
  { id: 'custom_api', label: 'Custom APIs', note: 'Whatever you explicitly configure.' },
  { id: 'sync', label: 'Sync', note: 'Encrypted copies of data you choose to sync.' },
];

export const DEFAULT_POLICY = {
  master_firewall: true, // true = block everything
  lockdown: false,
  channels: CHANNELS.reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
};

let cached = null;

export function readCached() {
  return cached || DEFAULT_POLICY;
}

export async function loadPolicy({ force = false } = {}) {
  if (cached && !force) return cached;
  try {
    const user = await base44.auth.me();
    const stored = user?.privacy_policy || {};
    cached = {
      ...DEFAULT_POLICY,
      ...stored,
      channels: { ...DEFAULT_POLICY.channels, ...(stored.channels || {}) },
    };
  } catch (e) {
    cached = DEFAULT_POLICY;
  }
  return cached;
}

export async function savePolicy(next) {
  cached = {
    ...DEFAULT_POLICY,
    ...next,
    channels: { ...DEFAULT_POLICY.channels, ...(next.channels || {}) },
  };
  try {
    await base44.auth.updateMe({ privacy_policy: cached });
  } catch (e) {}
  return cached;
}

export async function setChannel(channelId, enabled) {
  const policy = await loadPolicy();
  return savePolicy({ ...policy, channels: { ...policy.channels, [channelId]: enabled } });
}

export async function setMasterFirewall(on) {
  const policy = await loadPolicy();
  return savePolicy({ ...policy, master_firewall: on });
}

// Emergency lockdown — closes everything at once and cannot be
// lifted by anything but a deliberate action on this device.
export async function engageLockdown() {
  const policy = await loadPolicy();
  return savePolicy({
    ...policy,
    lockdown: true,
    master_firewall: true,
    channels: CHANNELS.reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
  });
}

export async function liftLockdown() {
  const policy = await loadPolicy();
  return savePolicy({ ...policy, lockdown: false });
}

// 'LOCAL' when nothing can leave, otherwise the open channels.
export function connectivityState(policy = readCached()) {
  if (policy.lockdown) return { mode: 'LOCKDOWN', open: [] };
  if (policy.master_firewall) return { mode: 'LOCAL', open: [] };
  const open = CHANNELS.filter(c => policy.channels?.[c.id]);
  return { mode: open.length ? 'ONLINE' : 'LOCAL', open };
}