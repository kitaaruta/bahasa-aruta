'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AreaAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/portal?area=admin');
  }, [router]);

  return (
    <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🛡️ ➡️ 🏛️</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Mengarahkan ke Portal Admin...
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
        Area Admin sekarang telah disatukan dalam Portal Basa Arut.
      </p>
      <Link href="/portal?area=admin" className="btn btn-primary btn-sm" style={{ background: '#0D9488', borderColor: '#0D9488' }}>
        Buka Portal Admin Sekarang →
      </Link>
    </div>
  );
}
