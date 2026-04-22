'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Ticket, PlusCircle, Users,
  BarChart3, LogOut, Settings, ChevronRight
} from 'lucide-react';
import { getUser, logout, isAuthenticated } from '@/lib/auth';
import type { Role } from '@/lib/types';

const navItems = (role: Role) => {
  const items = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['USER', 'SUPPORT_AGENT', 'ADMIN'] },
    { href: '/tickets', icon: Ticket, label: 'All Tickets', roles: ['SUPPORT_AGENT', 'ADMIN'] },
    { href: '/tickets/new', icon: PlusCircle, label: 'New Ticket', roles: ['USER', 'SUPPORT_AGENT', 'ADMIN'] },
    { href: '/admin', icon: BarChart3, label: 'Admin Panel', roles: ['ADMIN'] },
    { href: '/admin/users', icon: Users, label: 'Manage Users', roles: ['ADMIN'] },
  ];
  return items.filter(i => i.roles.includes(role));
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login');
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{
        padding: '1.5rem 1rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59,130,246,0.3)',
            flexShrink: 0,
          }}>
            <Ticket size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f1f5f9' }}>SupportDesk</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ticketing System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.5rem 0' }}>
        {navItems(user.role as Role).map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span style={{ flex: 1 }}>{label}</span>
              {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '1rem',
        marginTop: 'auto',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.625rem 0.5rem',
          borderRadius: 8,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8125rem', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.fullName}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>
              {user.role?.replace('_', ' ').toLowerCase()}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', marginTop: '0.25rem' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
