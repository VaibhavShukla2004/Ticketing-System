'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/endpoints';
import { saveAuth } from '@/lib/auth';
import { Ticket, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    username: '', password: '', email: '', fullName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await authApi.login(form.username, form.password);
        saveAuth(res.data);
        toast.success(`Welcome back, ${res.data.fullName}!`);
        if (res.data.role === 'ADMIN') router.push('/admin');
        else router.push('/dashboard');
      } else {
        const res = await authApi.register(form);
        saveAuth(res.data);
        toast.success('Account created! Welcome aboard 🎉');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0f172a 100%)',
      padding: '1rem',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 30px rgba(59,130,246,0.4)',
          }}>
            <Ticket size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>
            Support<span className="gradient-text">Desk</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Professional IT Ticketing System
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* Tab toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg-secondary)',
            borderRadius: 8, padding: 4, marginBottom: '1.5rem',
          }}>
            {[
              { label: 'Sign In', value: true, icon: LogIn },
              { label: 'Register', value: false, icon: UserPlus },
            ].map(({ label, value, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setIsLogin(value)}
                className="btn"
                style={{
                  flex: 1, justifyContent: 'center',
                  background: isLogin === value
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))'
                    : 'transparent',
                  color: isLogin === value ? '#60a5fa' : '#64748b',
                  border: isLogin === value ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                  padding: '0.5rem',
                }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="label">Full Name</label>
                <input className="input" name="fullName" placeholder="John Doe"
                  value={form.fullName} onChange={handleChange} required />
              </div>
            )}

            <div className="form-group">
              <label className="label">Username</label>
              <input className="input" name="username" placeholder="johndoe"
                autoComplete="username"
                value={form.username} onChange={handleChange} required />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" name="email" type="email" placeholder="john@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
            )}

            <div className="form-group">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input" name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" autoComplete="current-password"
                  value={form.password} onChange={handleChange} required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem' }}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Default creds hint */}
          {isLogin && (
            <div style={{
              marginTop: '1.25rem', padding: '0.875rem', background: 'var(--bg-secondary)',
              borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.8rem', color: '#64748b'
            }}>
              <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>Demo Credentials:</p>
              <div style={{ display: 'grid', gap: '0.2rem' }}>
                <span>🔑 <strong>admin</strong> / admin123 (Admin)</span>
                <span>🛡️ <strong>agent1</strong> / agent123 (Support Agent)</span>
                <span>👤 <strong>user1</strong> / user123 (User)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
