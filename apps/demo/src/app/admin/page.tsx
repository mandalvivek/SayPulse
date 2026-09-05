'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('saypulse_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === 'superadmin' || user.phone?.includes('9013793020')) {
          router.replace('/admin/master');
          return;
        }
        if (user.organization?.slug) {
          router.replace(`/admin/${user.organization.slug}`);
          return;
        }
      }
    } catch (e) {}

    // Fallback default: redirect to demo sandbox
    router.replace('/admin/demo');
  }, [router]);

  return (
    <div style={{ padding: 60, textAlign: 'center', color: '#64748B', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🎙️</div>
      <p>Redirecting to your SayPulse workspace…</p>
    </div>
  );
}
