import { base44 } from '@/api/base44Client';

export async function permissionFor(capability) {
  const profiles = await base44.entities.BisonPermissionProfile.list('-updated_date', 1);
  const profile = profiles[0] || { profile: 'STANDARD', approved_capabilities: [] };
  const approved = profile.approved_capabilities?.includes(capability.id);
  if (capability.riskLevel === 'HIGH') return { allowed: false, reason: 'High-risk work always requires explicit confirmation.' };
  if (profile.profile === 'RESTRICTED') return { allowed: approved, reason: 'Restricted profile requires approval.' };
  if (profile.profile === 'CUSTOM') return { allowed: approved, reason: 'Capability is not approved in your custom profile.' };
  if (profile.profile === 'STANDARD') return { allowed: capability.riskLevel === 'LOW' || approved, reason: 'Medium-risk work needs approval.' };
  return { allowed: capability.riskLevel === 'LOW' || approved, reason: 'This capability has not been authorized yet.' };
}