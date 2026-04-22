'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      if (user?.role === 'ADMIN') router.push('/admin');
      else router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="skeleton" style={{ width: 200, height: 40 }} />
    </div>
  );
}
