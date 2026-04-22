export type Role = 'USER' | 'SUPPORT_AGENT' | 'ADMIN';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export interface UserSummary {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  author: UserSummary;
  createdAt: string;
}

export interface AttachmentResponse {
  id: number;
  fileName: string;
  storedFileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  owner: UserSummary;
  assignee?: UserSummary;
  comments: CommentResponse[];
  attachments: AttachmentResponse[];
  rating?: number;
  ratingFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  userId: number;
}

export interface AdminStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  totalUsers: number;
}
