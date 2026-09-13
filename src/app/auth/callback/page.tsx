'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('Memproses otorisasi akun Aruta...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      const displayErr = errorDescription || error;
      setErrorMessage(`Otorisasi dibatalkan atau gagal: ${displayErr}`);
      if (window.opener) {
        try {
          window.opener.postMessage(
            {
              type: 'ARUTA_SSO_CALLBACK',
              error: displayErr,
            },
            window.location.origin
          );
        } catch {
          // ignore
        }
        setTimeout(() => {
          window.close();
        }, 2000);
      }
      return;
    }

    if (!code) {
      setErrorMessage('Authorization code tidak ditemukan dalam URL callback.');
      return;
    }

    // 1. Jika dijalankan di dalam Popup Window: kirim pesan ke Window Opener lalu tutup
    if (window.opener) {
      setStatusMessage('Autentikasi berhasil! Mengalihkan kembali...');
      try {
        window.opener.postMessage(
          {
            type: 'ARUTA_SSO_CALLBACK',
            code,
            state,
          },
          window.location.origin
        );
      } catch (err) {
        console.error('Gagal mengirim postMessage ke opener:', err);
      }

      // Berikan jeda sejenak untuk memastikan postMessage terkirim sebelum window ditutup
      setTimeout(() => {
        window.close();
      }, 300);
      return;
    }

    // 2. Fallback jika dibuka langsung (bukan popup mode): proses penukaran langsung via API
    setStatusMessage('Memvalidasi kredensial dan membuat sesi aman...');
    fetch('/api/auth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal memproses sesi autentikasi.');
        }
        setStatusMessage('Login berhasil! Mengalihkan ke portal...');
        router.push('/portal');
      })
      .catch((err) => {
        console.error('Exchange error in direct fallback:', err);
        setErrorMessage(err.message || 'Terjadi kesalahan sistem saat memproses login.');
      });
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#1E293B',
          borderRadius: '16px',
          border: '1px solid #334155',
          padding: '32px 28px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Shield Icon SVG */}
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 18px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0D9488 0%, #065F46 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(13, 148, 136, 0.4)',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>
          Aruta Single Sign-On
        </h2>

        {errorMessage ? (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            {errorMessage}
          </div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                display: 'inline-block',
                width: '24px',
                height: '24px',
                border: '3px solid rgba(255,255,255,0.2)',
                borderTopColor: '#14B8A6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '12px',
              }}
            />
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: 0 }}>
              {statusMessage}
            </p>
          </div>
        )}

        <style jsx global>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0F172A',
            color: '#94A3B8',
          }}
        >
          Memuat...
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
