import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, EmptyState } from '@/components/MicroAnimations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Users, Shield, ArrowLeft, Plus } from 'lucide-react';
import CommunityMatch from '@/components/CommunityMatch';
import CommunitySharingPanel from '@/components/community/CommunitySharingPanel';

const VIBE_OPTIONS = ['calm', 'reflective', 'deep', 'playful', 'energetic'];
const DEFAULT_CHANNELS = [
  { name: 'Philosophy Garden', description: 'Discuss meaning, existence, and ideas', theme: 'philosophy' },
  { name: 'Daily Reflections', description: 'Share your everyday moments', theme: 'daily' },
  { name: 'Creative Flow', description: 'Art, writing, and expression', theme: 'creative' },
  { name: 'Growth Path', description: 'Personal development and habits', theme: 'growth' },
];

export default function Community() {
  const [profile, setProfile] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState('');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({ display_name: '', bio: '', values: [], interests: [], preferred_vibe: 'calm' });
  const [valueInput, setValueInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    Promise.all([
      base44.entities.CommunityProfile.list('-created_date', 1).catch(() => []),
      base44.entities.Channel.list('-created_date', 50).catch(() => []),
    ]).then(([profiles, chans]) => {
      setProfile(profiles?.[0] || null);
      if (profiles?.[0]) setProfileForm(profiles[0]);
      if (!chans || chans.length === 0) {
        base44.entities.Channel.bulkCreate(DEFAULT_CHANNELS).then(created => setChannels(created || [])).catch(() => setChannels(DEFAULT_CHANNELS));
      } else {
        setChannels(chans);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeChannel) {
      base44.entities.ChannelMessage.filter({ channel_id: activeChannel.id }).then(msgs => {
        setMessages(msgs || []);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [activeChannel]);

  const handleSaveProfile = async () => {
    if (!profileForm.display_name.trim()) return;
    try {
      if (profile) {
        const updated = await base44.entities.CommunityProfile.update(profile.id, profileForm);
        setProfile(updated);
      } else {
        const created = await base44.entities.CommunityProfile.create(profileForm);
        setProfile(created);
      }
      setShowProfileForm(false);
    } catch (e) {}
  };

  const handleSendMsg = async () => {
    if (!msgText.trim() || !activeChannel) return;
    try {
      const msg = await base44.entities.ChannelMessage.create({ channel_id: activeChannel.id, text: msgText, author_display_name: profile?.display_name || 'Anonymous' });
      setMessages(prev => [...prev, msg]);
      setMsgText('');
    } catch (e) {}
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-peach/30 border-t-peach rounded-full animate-spin" /></div>;
  }

  const accent = 'hsl(21 73% 69%)';

  if (!activeChannel) {
    return (
      <div>
        <PageHeader title="Community" subtitle="Connect through shared values" accent={accent} />
        <div className="px-6 lg:px-10 pb-8">
          <div className="glass rounded-xl p-4 mb-4 flex items-start gap-3">
            <Shield className="w-4 h-4 text-peach shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">Community is separate from your private data. Your check-ins, journal, and Bison conversations are never shared. Only your opt-in profile fields appear here.</p>
          </div>

          {!profile ? (
            <div className="glass rounded-2xl p-6 space-y-4">
              <p className="text-sm font-medium text-peach">Create your community profile to join the conversation.</p>
              <CommunityProfileForm form={profileForm} setForm={setProfileForm} valueInput={valueInput} setValueInput={setValueInput} interestInput={interestInput} setInterestInput={setInterestInput} onSave={handleSaveProfile} accent={accent} />
            </div>
          ) : showProfileForm ? (
            <div className="glass rounded-2xl p-6 space-y-4 mb-4">
              <CommunityProfileForm form={profileForm} setForm={setProfileForm} valueInput={valueInput} setValueInput={setValueInput} interestInput={interestInput} setInterestInput={setInterestInput} onSave={handleSaveProfile} accent={accent} />
            </div>
          ) : (
            <div className="glass rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{profile.display_name}</p>
                <p className="text-xs text-muted-foreground">{profile.bio || 'No bio yet'}</p>
              </div>
              <Button onClick={() => setShowProfileForm(true)} variant="outline" className="border-border text-xs">Edit</Button>
            </div>
          )}

          {profile && (
            <>
            <CommunitySharingPanel />
            <CommunityMatch />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {channels.map(ch => (
                <button key={ch.id} onClick={() => setActiveChannel(ch)} className="glass rounded-xl p-5 text-left hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4" style={{ color: accent }} />
                    <p className="font-heading font-semibold text-sm">{ch.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{ch.description}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-peach/10 text-peach capitalize mt-2 inline-block">{ch.theme}</span>
                </button>
              ))}
            </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 lg:px-10 pt-8 pb-3 flex items-center gap-3">
        <button onClick={() => setActiveChannel(null)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-heading text-xl font-bold" style={{ color: accent }}>{activeChannel.name}</h1>
          <p className="text-xs text-muted-foreground">{activeChannel.description}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-4 space-y-3">
        {messages.length === 0 ? (
          <EmptyState icon={Users} title="No messages yet" subtitle="Be the first to start the conversation." />
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="glass rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-peach mb-1">{msg.author_display_name}</p>
              <p className="text-sm">{msg.text}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-6 lg:px-10 pb-24 lg:pb-6">
        <div className="flex gap-2">
          <Input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMsg()} placeholder="Type a message..." className="bg-secondary/50" />
          <button onClick={handleSendMsg} disabled={!msgText.trim()} className="w-12 h-12 rounded-xl bg-peach text-background flex items-center justify-center disabled:opacity-30 shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommunityProfileForm({ form, setForm, valueInput, setValueInput, interestInput, setInterestInput, onSave, accent }) {
  return (
    <>
      <div>
        <Label className="text-xs text-muted-foreground">Display Name</Label>
        <Input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="How others see you..." className="mt-1 bg-secondary/50" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Bio</Label>
        <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2} placeholder="A short introduction..." className="mt-1 bg-secondary/50" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Values</Label>
        <div className="flex gap-2 mt-1">
          <Input value={valueInput} onChange={e => setValueInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && valueInput.trim()) { setForm({ ...form, values: [...(form.values || []), valueInput.trim()] }); setValueInput(''); } }} placeholder="Add a value..." className="bg-secondary/50" />
          <button onClick={() => { if (valueInput.trim()) { setForm({ ...form, values: [...(form.values || []), valueInput.trim()] }); setValueInput(''); } }} className="px-3 rounded-lg bg-secondary/50"><Plus className="w-4 h-4" /></button>
        </div>
        {form.values?.length > 0 && <div className="flex gap-1.5 mt-2 flex-wrap">{form.values.map((v, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-peach/15 text-peach cursor-pointer" onClick={() => setForm({ ...form, values: form.values.filter((_, j) => j !== i) })}>{v}</span>)}</div>}
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Interests</Label>
        <div className="flex gap-2 mt-1">
          <Input value={interestInput} onChange={e => setInterestInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && interestInput.trim()) { setForm({ ...form, interests: [...(form.interests || []), interestInput.trim()] }); setInterestInput(''); } }} placeholder="Add an interest..." className="bg-secondary/50" />
          <button onClick={() => { if (interestInput.trim()) { setForm({ ...form, interests: [...(form.interests || []), interestInput.trim()] }); setInterestInput(''); } }} className="px-3 rounded-lg bg-secondary/50"><Plus className="w-4 h-4" /></button>
        </div>
        {form.interests?.length > 0 && <div className="flex gap-1.5 mt-2 flex-wrap">{form.interests.map((v, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-peach/15 text-peach cursor-pointer" onClick={() => setForm({ ...form, interests: form.interests.filter((_, j) => j !== i) })}>{v}</span>)}</div>}
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Preferred Vibe</Label>
        <div className="flex gap-2 mt-1 flex-wrap">
          {VIBE_OPTIONS.map(v => <button key={v} onClick={() => setForm({ ...form, preferred_vibe: v })} className={`text-xs px-3 py-1 rounded-full capitalize transition-all ${form.preferred_vibe === v ? 'bg-peach/20 text-peach' : 'bg-secondary/50 text-muted-foreground'}`}>{v}</button>)}
        </div>
      </div>
      <Button onClick={onSave} className="w-full" style={{ backgroundColor: accent, color: 'hsl(268 16% 10%)' }} disabled={!form.display_name.trim()}>Save Profile</Button>
    </>
  );
}