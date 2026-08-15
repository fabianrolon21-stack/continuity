import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function PermissionProfile() {
  const [record, setRecord] = useState(null); const [profile, setProfile] = useState('STANDARD');
  useEffect(() => { base44.entities.BisonPermissionProfile.list('-updated_date', 1).then(items => { if (items[0]) { setRecord(items[0]); setProfile(items[0].profile); } }); }, []);
  const save = async () => { const data = { profile, approved_capabilities: record?.approved_capabilities || [] }; const next = record ? await base44.entities.BisonPermissionProfile.update(record.id, data) : await base44.entities.BisonPermissionProfile.create(data); setRecord(next); await base44.entities.BisonTask.updateMany({ status: 'WAITING_FOR_PERMISSION' }, { $set: { status: 'QUEUED' } }); };
  return <section className="glass rounded-xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-heading font-semibold">Permission profile</h2><p className="mt-1 text-xs text-muted-foreground">Financial actions are permanently outside Bison’s authority.</p></div><div className="flex gap-2"><select value={profile} onChange={event => setProfile(event.target.value)} className="rounded-md border border-input bg-background px-3 text-sm"><option value="RESTRICTED">Restricted</option><option value="STANDARD">Standard</option><option value="AUTONOMOUS">Autonomous</option><option value="CUSTOM">Custom</option></select><Button onClick={save} variant="outline">Save</Button></div></div></section>;
}