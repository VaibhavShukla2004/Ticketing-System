'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ticketApi, userApi } from '@/lib/endpoints';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { User } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const user = getUser();
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: '', description: '', priority: 'MEDIUM', assigneeId: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    if (user?.role !== 'USER') {
      userApi.getAgents().then(r => setAgents(r.data)).catch(() => {});
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        subject: form.subject,
        description: form.description,
        priority: form.priority,
      };
      if (form.assigneeId) payload.assigneeId = Number(form.assigneeId);
      const res = await ticketApi.create(payload);
      toast.success('Ticket created successfully!');
      router.push(`/tickets/${res.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors: Record<string, string> = {
    LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', URGENT: '#f43f5e',
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content animate-fade-in">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link href="/dashboard">
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
                <ArrowLeft size={15} />
              </button>
            </Link>
            <h1 className="page-title" style={{ margin: 0 }}>Create New Ticket</h1>
          </div>
          <p className="page-subtitle">Fill in the details to submit a new support request</p>
        </div>

        <div style={{ maxWidth: 700 }}>
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Subject *</label>
                <input className="input" name="subject" value={form.subject}
                  onChange={handleChange} required minLength={5}
                  placeholder="Brief description of your issue..." />
              </div>

              <div className="form-group">
                <label className="label">Description *</label>
                <textarea className="input" name="description" value={form.description}
                  onChange={handleChange} required minLength={10}
                  placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, and what you've already tried..."
                  style={{ minHeight: 160 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label">Priority *</label>
                  <select className="input" name="priority" value={form.priority} onChange={handleChange}>
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: priorityColors[form.priority],
                    }} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {form.priority === 'LOW' && 'Can wait, no immediate impact'}
                      {form.priority === 'MEDIUM' && 'Moderate impact, address soon'}
                      {form.priority === 'HIGH' && 'Significant impact, urgent attention'}
                      {form.priority === 'URGENT' && 'Critical — immediate action required'}
                    </span>
                  </div>
                </div>

                {user?.role !== 'USER' && agents.length > 0 && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Assign To (Optional)</label>
                    <select className="input" name="assigneeId" value={form.assigneeId} onChange={handleChange}>
                      <option value="">Unassigned</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Link href="/dashboard">
                  <button type="button" className="btn btn-secondary">Cancel</button>
                </Link>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <PlusCircle size={16} />
                  {loading ? 'Creating...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
