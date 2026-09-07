import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🍃</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
        404 — Halaman Tidak Ditemukan
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 28px auto' }}>
        Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan ke portal baru.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-outline">
          Kembali ke Beranda
        </Link>
        <Link href="/portal" className="btn btn-primary">
          Buka Portal
        </Link>
      </div>
    </div>
  );
}
