import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function GoalForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const submit = event => { event.preventDefault(); if (!title.trim()) return; onCreate(title.trim()); setTitle(''); };
  return <form onSubmit={submit} className="flex gap-2"><Input value={title} onChange={event => setTitle(event.target.value)} placeholder="Add a goal for Bison" /><Button type="submit">Add goal</Button></form>;
}