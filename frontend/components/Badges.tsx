import type { TicketStatus, Priority, Role } from '@/lib/types';

export function StatusBadge({ status }: { status: TicketStatus }) {
  const labels: Record<TicketStatus, string> = {
    OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed',
  };
  const dotColors: Record<TicketStatus, string> = {
    OPEN: '#60a5fa', IN_PROGRESS: '#fbbf24', RESOLVED: '#34d399', CLOSED: '#94a3b8',
  };
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColors[status], display: 'inline-block' }} />
      {labels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const labels: Record<Priority, string> = {
    LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent',
  };
  return (
    <span className={`badge badge-${priority.toLowerCase()}`}>
      {labels[priority]}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const labels: Record<string, string> = {
    USER: 'User', SUPPORT_AGENT: 'Agent', ADMIN: 'Admin',
  };
  return (
    <span className={`badge badge-${role.toLowerCase()}`}>
      {labels[role] || role}
    </span>
  );
}
