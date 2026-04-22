'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ticketApi, userApi } from '@/lib/endpoints';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { Ticket, User, TicketStatus, Priority } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import toast from 'react-hot-toast';
import { Search, Filter, PlusCircle, Ticket as TicketIcon, ArrowRight, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

interface TicketListPageProps { myOnly?: boolean; }

export default function TicketsPage({ myOnly = false }: TicketListPageProps) {
  const router = useRouter();
  const user = getUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [agentFilter, setAgentFilter] = useState<number | ''>('');
  
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params: any = {
        page, size: 10, sortBy: 'createdAt', sortDir: 'desc',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(agentFilter && { assigneeId: agentFilter }),
      };

      const endpoint = myOnly || user?.role === 'USER' ? ticketApi.getMy : ticketApi.getAll;
      const res = await endpoint(params);
      setTickets(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
      setSelectedTickets([]);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    if (user?.role !== 'USER') {
      userApi.getAgents().then(r => setAgents(r.data)).catch(() => {});
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [page, statusFilter, priorityFilter, agentFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); fetchTickets(); };
  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setPriorityFilter(''); setAgentFilter(''); setPage(0);
  };
  const hasFilters = search || statusFilter || priorityFilter || agentFilter;

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTickets.length} tickets? This action cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await ticketApi.deleteBulk(selectedTickets);
      toast.success('Tickets deleted successfully');
      setSelectedTickets([]);
      fetchTickets();
    } catch {
      toast.error('Failed to delete tickets');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedTickets(tickets.map(t => t.id));
    else setSelectedTickets([]);
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) setSelectedTickets(prev => [...prev, id]);
    else setSelectedTickets(prev => prev.filter(tId => tId !== id));
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content animate-fade-in">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">
              {myOnly || user?.role === 'USER' ? 'My Tickets' : 'All Tickets'}
            </h1>
            <p className="page-subtitle">
              {totalElements} ticket{totalElements !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link href="/tickets/new">
            <button className="btn btn-primary"><PlusCircle size={16} /> New Ticket</button>
          </Link>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="label"><Search size={12} style={{ display: 'inline', marginRight: 4 }} />Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input className="input" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by subject..." style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>

            <div style={{ minWidth: 140 }}>
              <label className="label">Status</label>
              <select className="input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(0); }}>
                <option value="">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div style={{ minWidth: 130 }}>
              <label className="label">Priority</label>
              <select className="input" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value as any); setPage(0); }}>
                <option value="">All Priority</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {user?.role !== 'USER' && agents.length > 0 && (
              <div style={{ minWidth: 150 }}>
                <label className="label">Assignee</label>
                <select className="input" value={agentFilter} onChange={e => { setAgentFilter(e.target.value ? Number(e.target.value) : ''); setPage(0); }}>
                  <option value="">All Agents</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                </select>
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              <Filter size={14} /> Apply
            </button>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="btn btn-secondary">
                <X size={14} /> Clear
              </button>
            )}
          </form>
        </div>

        {/* Bulk Actions */}
        {user?.role === 'ADMIN' && selectedTickets.length > 0 && (
          <div className="card animate-fade-in" style={{ marginBottom: '1.5rem', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f1f5f9' }}>
              {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} selected
            </span>
            <button 
              className="btn btn-danger" 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        )}

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <TicketIcon size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8' }}>No tickets found</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  {user?.role === 'ADMIN' && (
                    <th style={{ width: 40 }}>
                      <input 
                        type="checkbox" 
                        checked={tickets.length > 0 && selectedTickets.length === tickets.length}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                  )}
                  <th>#ID</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Owner</th>
                  <th>Assignee</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id} style={{ background: selectedTickets.includes(ticket.id) ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                    {user?.role === 'ADMIN' && (
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={(e) => handleSelectOne(e, ticket.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>#{ticket.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#f1f5f9', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.subject}
                      </div>
                    </td>
                    <td><StatusBadge status={ticket.status} /></td>
                    <td><PriorityBadge priority={ticket.priority} /></td>
                    <td style={{ color: '#94a3b8' }}>{ticket.owner.fullName}</td>
                    <td style={{ color: ticket.assignee ? '#94a3b8' : '#475569' }}>
                      {ticket.assignee?.fullName || <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Unassigned</span>}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
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
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Page {page + 1} of {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
