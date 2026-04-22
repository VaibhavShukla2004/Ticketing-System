'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ticketApi, userApi } from '@/lib/endpoints';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { Ticket, User, TicketStatus } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MessageSquare, Paperclip, Star, Clock,
  User as UserIcon, Edit3, Check, X, Upload, Download, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function TicketDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const currentUser = getUser();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>('OPEN');
  const [editAssignee, setEditAssignee] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isAgent = currentUser?.role === 'SUPPORT_AGENT';
  const isOwner = ticket?.owner?.id === currentUser?.id;
  const canChangeStatus = isAdmin || isAgent;
  const canComment = ticket != null;
  const canRate = isOwner && (ticket?.status === 'RESOLVED' || ticket?.status === 'CLOSED') && !ticket?.rating;

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    fetchTicket();
    if (currentUser?.role !== 'USER') {
      userApi.getAgents().then(r => setAgents(r.data)).catch(() => {});
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await ticketApi.getById(Number(id));
      setTicket(res.data);
      setNewStatus(res.data.status);
    } catch (err: any) {
      toast.error('Ticket not found or access denied');
      router.push('/dashboard');
    } finally { setLoading(false); }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await ticketApi.addComment(Number(id), comment);
      setTicket(res.data);
      setComment('');
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmittingComment(false); }
  };

  const handleStatusChange = async () => {
    try {
      const res = await ticketApi.update(Number(id), { status: newStatus });
      setTicket(res.data);
      setEditStatus(false);
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleAssigneeChange = async (agentId: string) => {
    try {
      const res = await ticketApi.update(Number(id), { assigneeId: agentId ? Number(agentId) : undefined });
      setTicket(res.data);
      setEditAssignee(false);
      toast.success('Assignee updated');
    } catch { toast.error('Failed to update assignee'); }
  };

  const handleRate = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    try {
      const res = await ticketApi.rate(Number(id), rating, ratingFeedback);
      setTicket(res.data);
      setShowRating(false);
      toast.success('Thank you for your feedback! ⭐');
    } catch { toast.error('Failed to submit rating'); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      await ticketApi.uploadAttachment(Number(id), file);
      await fetchTicket();
      toast.success('File uploaded successfully');
    } catch { toast.error('Failed to upload file'); }
    finally { setUploadingFile(false); e.target.value = ''; }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await ticketApi.delete(Number(id));
      toast.success('Ticket deleted successfully');
      router.push('/tickets');
    } catch {
      toast.error('Failed to delete ticket');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main className="main-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
          </div>
        </main>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content animate-fade-in" style={{ maxWidth: 'calc(100vw - 260px)' }}>
        {/* Back + header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href={currentUser?.role === 'USER' ? '/dashboard' : '/tickets'}>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
                <ArrowLeft size={15} />
              </button>
            </Link>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#f1f5f9' }}>
                  Ticket #{ticket.id}
                </h1>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                Created {format(new Date(ticket.createdAt), 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isAdmin && (
              <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 size={15} /> {isDeleting ? 'Deleting...' : 'Delete Ticket'}
              </button>
            )}
            {canRate && (
              <button className="btn btn-primary" onClick={() => setShowRating(true)}>
                <Star size={15} /> Rate Resolution
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Ticket body */}
            <div className="card">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '0.75rem' }}>
                {ticket.subject}
              </h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {ticket.description}
              </p>
            </div>

            {/* Attachments */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#f1f5f9' }}>
                  <Paperclip size={16} /> Attachments ({ticket.attachments.length})
                </h3>
                <label style={{ cursor: 'pointer' }}>
                  <input type="file" hidden onChange={handleFileUpload} disabled={uploadingFile} />
                  <button className="btn btn-secondary" style={{ pointerEvents: 'none', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                    <Upload size={14} /> {uploadingFile ? 'Uploading...' : 'Upload'}
                  </button>
                </label>
              </div>
              {ticket.attachments.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '0.875rem', fontStyle: 'italic' }}>No attachments yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {ticket.attachments.map(att => (
                    <a
                      key={att.id}
                      href={`${API_URL}/api/tickets/attachments/${att.storedFileName || att.fileName}`}
                      target="_blank" rel="noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.625rem 0.875rem',
                        background: 'var(--bg-secondary)', borderRadius: 8,
                        border: '1px solid var(--border)', textDecoration: 'none',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <Paperclip size={14} color="#64748b" />
                      <span style={{ flex: 1, color: '#94a3b8', fontSize: '0.875rem' }}>{att.fileName}</span>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : ''}
                      </span>
                      <Download size={14} color="#3b82f6" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem' }}>
                <MessageSquare size={16} /> Comments ({ticket.comments.length})
              </h3>

              {ticket.comments.length === 0 && (
                <p style={{ color: '#475569', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  No comments yet. Be the first to comment.
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: ticket.comments.length > 0 ? '1.5rem' : 0 }}>
                {ticket.comments.map(c => (
                  <div key={c.id} style={{
                    display: 'flex', gap: '0.875rem',
                    padding: '1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: c.author.role === 'ADMIN'
                        ? 'linear-gradient(135deg, #f43f5e, #f97316)'
                        : c.author.role === 'SUPPORT_AGENT'
                          ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                          : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8125rem', fontWeight: 700, color: 'white',
                    }}>
                      {c.author.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f1f5f9' }}>{c.author.fullName}</span>
                        <span style={{
                          fontSize: '0.68rem', padding: '0.1rem 0.4rem',
                          background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                          borderRadius: 99, fontWeight: 500, textTransform: 'capitalize',
                        }}>
                          {c.author.role.replace('_', ' ').toLowerCase()}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#475569' }}>
                          {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {canComment && (
                <form onSubmit={handleAddComment}>
                  <label className="label">Add Comment</label>
                  <textarea
                    className="input"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Write your comment..."
                    style={{ minHeight: 100, marginBottom: '0.75rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={submittingComment || !comment.trim()}>
                      <MessageSquare size={15} />
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Rating display */}
            {ticket.rating && (
              <div className="card" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
                <h3 style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={16} color="#f59e0b" /> Resolution Rating
                </h3>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={20} fill={s <= ticket.rating! ? '#f59e0b' : 'none'} color={s <= ticket.rating! ? '#f59e0b' : '#334155'} />
                  ))}
                  <span style={{ marginLeft: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>{ticket.rating}/5</span>
                </div>
                {ticket.ratingFeedback && (
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic' }}>"{ticket.ratingFeedback}"</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Status control */}
            <div className="card">
              <h3 style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '1rem', fontSize: '0.9375rem' }}>
                Ticket Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Status */}
                <div>
                  <label className="label">Status</label>
                  {editStatus && canChangeStatus ? (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem' }}>
                      <select className="input" value={newStatus} onChange={e => setNewStatus(e.target.value as TicketStatus)}
                        style={{ flex: 1, fontSize: '0.8125rem' }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                      <button onClick={handleStatusChange} className="btn btn-success" style={{ padding: '0.4rem 0.5rem' }}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditStatus(false)} className="btn btn-danger" style={{ padding: '0.4rem 0.5rem' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
                      <StatusBadge status={ticket.status} />
                      {canChangeStatus && (
                        <button onClick={() => setEditStatus(true)} className="btn btn-secondary"
                          style={{ marginLeft: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <Edit3 size={12} /> Change
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="label">Priority</label>
                  <div style={{ marginTop: '0.375rem' }}>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>

                <hr className="divider" style={{ margin: '0.25rem 0' }} />

                {/* Owner */}
                <div>
                  <label className="label"><UserIcon size={11} style={{ display: 'inline', marginRight: 3 }} />Owner</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: 'white',
                    }}>
                      {ticket.owner.fullName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#f1f5f9' }}>{ticket.owner.fullName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{ticket.owner.email}</div>
                    </div>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="label">Assignee</label>
                  {editAssignee && canChangeStatus ? (
                    <div style={{ marginTop: '0.375rem' }}>
                      <select className="input" style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}
                        defaultValue={ticket.assignee?.id || ''}
                        onChange={e => handleAssigneeChange(e.target.value)}>
                        <option value="">Unassigned</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                      </select>
                      <button onClick={() => setEditAssignee(false)} className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
                      {ticket.assignee ? (
                        <>
                          <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: 'white',
                          }}>
                            {ticket.assignee.fullName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#f1f5f9' }}>{ticket.assignee.fullName}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{ticket.assignee.email}</div>
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#475569', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                      {canChangeStatus && (
                        <button onClick={() => setEditAssignee(true)} className="btn btn-secondary"
                          style={{ marginLeft: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <Edit3 size={12} /> {ticket.assignee ? 'Change' : 'Assign'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <hr className="divider" style={{ margin: '0.25rem 0' }} />

                <div>
                  <label className="label">Last Updated</label>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.375rem' }}>
                    {format(new Date(ticket.updatedAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating modal */}
        {showRating && (
          <div className="modal-overlay" onClick={() => setShowRating(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="modal-header">
                <h3 style={{ fontWeight: 600, color: '#f1f5f9' }}>Rate Your Experience</h3>
                <button onClick={() => setShowRating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: '#94a3b8', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                  How satisfied are you with the resolution of Ticket #{ticket.id}?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}>
                      <Star size={32} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#334155'}
                        style={{ transition: 'all 0.15s' }} />
                    </button>
                  ))}
                </div>
                <label className="label">Feedback (Optional)</label>
                <textarea className="input" value={ratingFeedback} onChange={e => setRatingFeedback(e.target.value)}
                  placeholder="Tell us about your experience..." style={{ minHeight: 80 }} />
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowRating(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleRate} className="btn btn-primary" disabled={!rating}>
                  <Star size={15} /> Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
