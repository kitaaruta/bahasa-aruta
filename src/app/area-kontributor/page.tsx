'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AreaKontributorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/portal?area=kontributor');
  }, [router]);

  return (
    <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌿 ➡️ 🏛️</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Mengarahkan ke Portal Terpadu...
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
        Area Kontributor sekarang telah disatukan dalam Portal Basa Arut.
      </p>
      <Link href="/portal?area=kontributor" className="btn btn-primary btn-sm">
        Buka Portal Kontributor Sekarang →
      </Link>
    </div>
  );
}
