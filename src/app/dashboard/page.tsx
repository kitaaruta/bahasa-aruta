'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const area = searchParams.get('area');
    if (area) {
      router.replace(`/portal?area=${area}`);
    } else {
      router.replace('/portal');
    }
  }, [router, searchParams]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏛️</div>
        Dialihkan ke Portal Basa Arut...
      </div>
    </div>
  );
}

export default function DashboardRedirectPage() {
  return (
    <Suspense fallback={null}>
      <RedirectContent />
    </Suspense>
  );
}
