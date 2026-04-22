'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ticketApi } from '@/lib/endpoints';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { Ticket } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import {
  Ticket as TicketIcon, PlusCircle, Clock, CheckCircle2,
  AlertCircle, XCircle, TrendingUp, ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
  };

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    const fetchTickets = async () => {
      try {
        const res = await ticketApi.getMy({ size: 50 });
        setTickets(res.data.content);
      } catch { } finally { setLoading(false); }
    };
    fetchTickets();
  }, [router]);

  const statCards = [
    { label: 'Open', value: stats.open, icon: AlertCircle, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
    { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Closed', value: stats.closed, icon: XCircle, color: '#94a3b8', bg: 'rgba(100,116,139,0.1)' },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content animate-fade-in">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},&nbsp;
              <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span> 👋
            </h1>
            <p className="page-subtitle">Here's an overview of your support tickets</p>
          </div>
          <Link href="/tickets/new">
            <button className="btn btn-primary">
              <PlusCircle size={16} /> New Ticket
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9' }}>
                  {loading ? <div className="skeleton" style={{ width: 40, height: 32 }} /> : value}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent tickets */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TicketIcon size={18} color="#3b82f6" />
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>Recent Tickets</span>
              <span style={{
                fontSize: '0.75rem', padding: '0.1rem 0.5rem',
                background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                borderRadius: 99, fontWeight: 600,
              }}>{tickets.length}</span>
            </div>
            <Link href="/tickets/my" style={{
              fontSize: '0.8125rem', color: '#3b82f6', display: 'flex',
              alignItems: 'center', gap: '0.25rem', textDecoration: 'none',
            }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <TicketIcon size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8' }}>No tickets yet</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Create your first support ticket to get started</p>
              <Link href="/tickets/new">
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  <PlusCircle size={16} /> Create Ticket
                </button>
              </Link>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 8).map(ticket => (
                    <tr key={ticket.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: '#f1f5f9' }}>
                          #{ticket.id} {ticket.subject}
                        </div>
                      </td>
                      <td><StatusBadge status={ticket.status} /></td>
                      <td><PriorityBadge priority={ticket.priority} /></td>
                      <td style={{ color: '#94a3b8' }}>
                        {ticket.assignee?.fullName || <span style={{ color: '#475569', fontStyle: 'italic' }}>Unassigned</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.8125rem' }}>
                          <Clock size={13} />
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </div>
                      </td>
                      <td>
                        <Link href={`/tickets/${ticket.id}`}>
                          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                            View <ArrowRight size={13} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
