'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi, ticketApi } from '@/lib/endpoints';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { AdminStats, Ticket } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import {
  BarChart3, Users, Ticket as TicketIcon, AlertCircle,
  TrendingUp, CheckCircle2, XCircle, ArrowRight, Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    Promise.all([
      adminApi.getStats().then(r => setStats(r.data)),
      ticketApi.getAll({ page: 0, size: 8, sortBy: 'createdAt', sortDir: 'desc' })
        .then(r => setRecentTickets(r.data.content)),
    ]).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Tickets', value: stats.totalTickets, icon: TicketIcon, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', href: '/tickets' },
    { label: 'Open', value: stats.openTickets, icon: AlertCircle, color: '#fb7185', bg: 'rgba(244,63,94,0.1)', href: '/tickets?status=OPEN' },
    { label: 'In Progress', value: stats.inProgressTickets, icon: TrendingUp, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', href: '/tickets?status=IN_PROGRESS' },
    { label: 'Resolved', value: stats.resolvedTickets, icon: CheckCircle2, color: '#34d399', bg: 'rgba(16,185,129,0.1)', href: '/tickets?status=RESOLVED' },
    { label: 'Closed', value: stats.closedTickets, icon: XCircle, color: '#94a3b8', bg: 'rgba(100,116,139,0.1)', href: '/tickets?status=CLOSED' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', href: '/admin/users' },
  ] : [];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">
            <span className="gradient-text">Admin</span> Dashboard
          </h1>
          <p className="page-subtitle">System-wide overview and management</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {loading
            ? [1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />
              ))
            : statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
                <Link key={label} href={href} style={{ textDecoration: 'none' }}>
                  <div className="stat-card" style={{ cursor: 'pointer' }}>
                    <div className="stat-icon" style={{ background: bg }}>
                      <Icon size={22} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9' }}>{value}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{label}</div>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {/* Recent Tickets */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#3b82f6" />
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>Recent Activity</span>
            </div>
            <Link href="/tickets" style={{ fontSize: '0.8125rem', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Owner</th>
                    <th>Assignee</th>
                    <th>Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.8rem' }}>#{ticket.id}</td>
                      <td>
                        <div style={{ fontWeight: 500, color: '#f1f5f9', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.subject}
                        </div>
                      </td>
                      <td><StatusBadge status={ticket.status} /></td>
                      <td><PriorityBadge priority={ticket.priority} /></td>
                      <td style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{ticket.owner.fullName}</td>
                      <td style={{ color: ticket.assignee ? '#94a3b8' : '#475569', fontSize: '0.8125rem' }}>
                        {ticket.assignee?.fullName || <span style={{ fontStyle: 'italic', fontSize: '0.75rem' }}>Unassigned</span>}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                      </td>
                      <td>
                        <Link href={`/tickets/${ticket.id}`}>
                          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                            View <ArrowRight size={12} />
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
