import api from './api';
import type {
  AuthResponse, Ticket, User, AdminStats,
  PageResponse, Priority, TicketStatus
} from './types';

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),
  register: (data: { username: string; password: string; email: string; fullName: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  me: () => api.get<User>('/me'),
};

// Tickets
export const ticketApi = {
  create: (data: { subject: string; description: string; priority: string; assigneeId?: number }) =>
    api.post<Ticket>('/tickets', data),
  getAll: (params?: {
    status?: TicketStatus; priority?: Priority; assigneeId?: number;
    search?: string; page?: number; size?: number; sortBy?: string; sortDir?: string;
  }) =>
    api.get<PageResponse<Ticket>>('/tickets', { params }),
  getMy: (params?: {
    status?: TicketStatus; priority?: Priority;
    search?: string; page?: number; size?: number; sortBy?: string; sortDir?: string;
  }) =>
    api.get<PageResponse<Ticket>>('/tickets/my', { params }),
  getById: (id: number) => api.get<Ticket>(`/tickets/${id}`),
  update: (id: number, data: Partial<{
    subject: string; description: string; priority: string;
    status: string; assigneeId: number;
  }>) =>
    api.put<Ticket>(`/tickets/${id}`, data),
  addComment: (id: number, content: string) =>
    api.post<Ticket>(`/tickets/${id}/comments`, { content }),
  rate: (id: number, rating: number, feedback?: string) =>
    api.post<Ticket>(`/tickets/${id}/rate`, { rating, feedback }),
  delete: (id: number) => api.delete(`/tickets/${id}`),
  deleteBulk: (ids: number[]) => api.delete('/tickets/bulk', { params: { ids: ids.join(',') } }),
  uploadAttachment: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/tickets/${id}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadAttachment: (storedFileName: string) =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/tickets/attachments/${storedFileName}`,
};

// Users
export const userApi = {
  getAgents: () => api.get<User[]>('/users/agents'),
};

// Admin
export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats'),
  getUsers: (params?: { search?: string; page?: number; size?: number }) =>
    api.get<PageResponse<User>>('/admin/users', { params }),
  getUserById: (id: number) => api.get<User>(`/admin/users/${id}`),
  updateRole: (id: number, role: string) =>
    api.put<User>(`/admin/users/${id}/role`, { role }),
  toggleEnabled: (id: number) => api.put<User>(`/admin/users/${id}/toggle`),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
};
