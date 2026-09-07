'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AkunRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const destination = qs ? `/profil?${qs}` : '/profil';
    router.replace(destination);
  }, [router, searchParams]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👤</div>
        Mengalihkan ke halaman profil publik...
      </div>
    </div>
  );
}

export default function AkunRedirectPage() {
  return (
    <Suspense fallback={null}>
      <AkunRedirectContent />
    </Suspense>
  );
}
