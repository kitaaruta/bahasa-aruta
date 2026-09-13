'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ArutaSsoButtonProps {
  onSuccess?: (user: any, needsOnboarding: boolean) => void;
  onError?: (errorMessage: string) => void;
  redirectTo?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  variant?: 'primary' | 'secondary' | 'dark';
}

export const ArutaSsoButton: React.FC<ArutaSsoButtonProps> = ({
  onSuccess,
  onError,
  redirectTo = '/portal',
  className = '',
  style = {},
  label = 'Masuk/Daftar Akun Aruta',
  variant = 'primary',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [popupActive, setPopupActive] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Bersihkan event listener dan interval saat unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const handleLoginClick = async () => {
    if (isLoading || popupActive) return;

    setIsLoading(true);

    try {
      // 1. Ambil authorization URL dan set CSRF cookie di backend
      const res = await fetch('/api/auth/authorize-url');
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Respons server tidak valid (${res.status}): ${text.substring(0, 100) || 'Kosong'}`);
      }

      if (!res.ok || !data.success || !data.authUrl) {
        throw new Error(data.message || `Gagal memulai koneksi ke Aruta SSO (${res.status}).`);
      }

      const { authUrl, state } = data;

      // 2. Hitung posisi tengah layar untuk popup
      const width = 520;
      const height = 660;
      const left = Math.max(0, Math.round((window.screen.width - width) / 2));
      const top = Math.max(0, Math.round((window.screen.height - height) / 2));

      // 3. Buka popup window
      const popup = window.open(
        authUrl,
        'aruta_sso_login_window',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,status=yes`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error(
          'Popup login terblokir oleh browser. Harap izinkan pop-up (pop-up blocker) untuk situs ini.'
        );
      }

      popupRef.current = popup;
      setPopupActive(true);

      // 4. Daftarkan message listener dari popup window
      const handleMessage = async (event: MessageEvent) => {
        // Hanya terima pesan dari origin aplikasi kita sendiri
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === 'ARUTA_SSO_CALLBACK') {
          window.removeEventListener('message', handleMessage);
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setPopupActive(false);

          if (event.data.error) {
            setIsLoading(false);
            const errText = event.data.error_description || event.data.error;
            if (onError) onError(errText);
            return;
          }

          const { code, state: returnedState } = event.data;

          try {
            // 5. Tukarkan code ke backend kita (aman, client secret tetap di server)
            const exchangeRes = await fetch('/api/auth/exchange', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, state: returnedState || state }),
            });

            const exchangeText = await exchangeRes.text();
            let exchangeData: any = {};
            try {
              exchangeData = exchangeText ? JSON.parse(exchangeText) : {};
            } catch {
              throw new Error(`Respons token tidak valid (${exchangeRes.status}): ${exchangeText.substring(0, 100) || 'Kosong'}`);
            }

            if (!exchangeRes.ok || !exchangeData.success) {
              const errDesc = exchangeData.message || 'Gagal memvalidasi otorisasi Aruta SSO.';
              setIsLoading(false);
              if (onError) onError(errDesc);
              return;
            }

            setIsLoading(false);

            if (onSuccess) {
              onSuccess(exchangeData.user, exchangeData.needsOnboarding);
            } else {
              // Jika tidak ada custom callback, redirect standar
              window.location.href = redirectTo;
            }
          } catch (err: any) {
            setIsLoading(false);
            if (onError) onError(err.message || 'Terjadi gangguan jaringan saat memverifikasi sesi.');
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // 6. Polling untuk mendeteksi jika popup ditutup manual oleh pengguna sebelum login selesai
      pollTimerRef.current = setInterval(() => {
        if (popup && popup.closed) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          window.removeEventListener('message', handleMessage);
          setPopupActive(false);
          setIsLoading(false);
        }
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      setPopupActive(false);
      if (onError) onError(err.message || 'Gagal membuka layanan Aruta SSO.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleLoginClick}
      disabled={isLoading || popupActive}
      className={`aruta-sso-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        padding: '13px 20px',
        fontSize: '0.95rem',
        fontWeight: 700,
        borderRadius: '12px',
        cursor: isLoading || popupActive ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        background:
          variant === 'primary'
            ? 'linear-gradient(135deg, #0F766E 0%, #065F46 100%)'
            : variant === 'dark'
            ? '#0F172A'
            : '#FFFFFF',
        color: variant === 'secondary' ? '#0F172A' : '#FFFFFF',
        border:
          variant === 'secondary'
            ? '1.5px solid #E2E8F0'
            : '1.5px solid rgba(255, 255, 255, 0.15)',
        boxShadow:
          variant === 'primary'
            ? '0 4px 14px 0 rgba(13, 148, 136, 0.35)'
            : '0 2px 6px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Aruta Shield Official Logo SVG */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          flexShrink: 0,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Perisai Luar */}
          <path
            d="M12 2L4 5.5V11.5C4 16.5 7.5 21.2 12 22.5C16.5 21.2 20 16.5 20 11.5V5.5L12 2Z"
            fill={variant === 'secondary' ? '#0D9488' : '#F8FAFC'}
          />
          {/* Motif Ukir Dayak / Aruta Internal Core */}
          <path
            d="M12 5L7 7.5V11.5C7 15 9.2 18.5 12 19.8C14.8 18.5 17 15 17 11.5V7.5L12 5Z"
            fill={variant === 'secondary' ? '#FFFFFF' : '#0F766E'}
          />
          {/* Lingkaran Pusat Kebudayaan */}
          <circle cx="12" cy="11.5" r="2.2" fill="#F59E0B" />
        </svg>
      </span>

      {/* Label Text / Loading State */}
      <span style={{ letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
        {isLoading || popupActive ? 'Menghubungkan ke Aruta SSO...' : label}
      </span>

      {/* Spinner Animasi saat Loading */}
      {(isLoading || popupActive) && (
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#FFFFFF',
            borderRadius: '50%',
            animation: 'arutaSpin 0.7s linear infinite',
            marginLeft: '4px',
          }}
        />
      )}

      <style jsx>{`
        @keyframes arutaSpin {
          to {
            transform: rotate(360deg);
          }
        }
        .aruta-sso-btn:hover:not(:disabled) {
          transform: translateY(-1.5px);
          filter: brightness(1.06);
          box-shadow: 0 6px 20px 0 rgba(13, 148, 136, 0.45);
        }
        .aruta-sso-btn:active:not(:disabled) {
          transform: translateY(0.5px);
        }
      `}</style>
    </button>
  );
};
