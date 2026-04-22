import type { AuthResponse, User } from './types';

export const saveAuth = (auth: AuthResponse) => {
  localStorage.setItem('token', auth.token);
  localStorage.setItem('user', JSON.stringify({
    id: auth.userId,
    username: auth.username,
    email: auth.email,
    fullName: auth.fullName,
    role: auth.role,
  }));
};

export const getUser = (): Partial<User> | null => {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => !!getToken();
