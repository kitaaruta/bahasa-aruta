'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function DonasiPage() {
  const { t, language } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank' | 'ewallet'>('qris');
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const presetAmounts = [25000, 50000, 100000, 250000];

  const recentDonations = [
    {
      name: language === 'en' ? 'Dayak Arut Heritage Family' : 'Keluarga Adat Dayak Arut',
      amount: 250000,
      date: language === 'en' ? '1 day ago' : '1 hari lalu',
      message: language === 'en' ? 'May the native lore of Arut thrive for upcoming generations.' : 'Semoga tutur lisan Arut terus lestari dipelajari anak cucu.'
    },
    {
      name: language === 'en' ? 'Rian (Arut Diaspora)' : 'Rian Perantau Kobar',
      amount: 50000,
      date: language === 'en' ? '2 days ago' : '2 hari lalu',
      message: language === 'en' ? 'Proud to see an international platform dedicated to our native Borneo language.' : 'Bangga ada platform bahasa daerah asal kami di Kalteng!'
    },
    {
      name: language === 'en' ? 'Borneo Linguistic Circle' : 'Sahabat Literasi Nusantara',
      amount: 100000,
      date: language === 'en' ? '4 days ago' : '4 hari lalu',
      message: language === 'en' ? 'Supporting lexicographical documentation of Central Kalimantan dialects.' : 'Dukungan untuk digitalisasi kamus leksikal Dayak.'
    },
  ];

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(Number(e.target.value) || 0);
  };

  const handleCopyAccount = (number: string, bankName: string) => {
    navigator.clipboard.writeText(number);
    setCopiedBank(bankName);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmount && !customAmount) return;
    setIsSuccess(true);
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Page Header */}
      <div style={{ margin: '24px 0 20px', textAlign: 'center' }}>
        <div className="hero-tag" style={{ marginBottom: '8px' }}>
          {t('donate.tag')}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {t('donate.title')}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '4px auto 0', lineHeight: 1.55 }}>
          {t('donate.subtitle')}
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Donation Form */}
        <div className="card-box">
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)' }}>
              1. {t('donate.selectNominal')}
            </h2>
          </div>

          {isSuccess ? (
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✓</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {language === 'en' ? 'Thank You for Your Generosity!' : 'Terima Kasih Banyak atas Kebaikan Anda!'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                {language === 'en'
                  ? `Your donation pledge of IDR ${(selectedAmount || 0).toLocaleString('id-ID')} has been recorded. Your contribution directly supports Dayak Arut indigenous preservation.`
                  : `Komitmen donasi sebesar Rp ${(selectedAmount || 0).toLocaleString('id-ID')} atas nama ${donorName || 'Hamba Allah'} telah tercatat. Bantuan Anda sangat berarti bagi kelestarian tutur adat Dayak Arut.`}
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="btn btn-primary btn-sm"
              >
                {language === 'en' ? 'Make Another Contribution' : 'Salurkan Donasi Lainnya'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitDonation}>
              {/* Preset Buttons */}
              <div className="donation-options">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`donation-btn ${selectedAmount === amt && !customAmount ? 'active' : ''}`}
                    onClick={() => handlePresetClick(amt)}
                  >
                    Rp {amt.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>

              {/* Custom Nominal */}
              <div className="form-group">
                <label className="form-label">{t('donate.freeNominal')}</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 75000"
                  value={customAmount}
                  onChange={handleCustomChange}
                  min="10000"
                />
              </div>

              {/* Step 2: Payment Method */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '14px', marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 750 }}>
                  2. {t('donate.paymentMethod')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`btn btn-sm ${paymentMethod === 'qris' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    📱 QRIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`btn btn-sm ${paymentMethod === 'bank' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    🏦 Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ewallet')}
                    className={`btn btn-sm ${paymentMethod === 'ewallet' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    👛 E-Wallet
                  </button>
                </div>
              </div>

              {/* Payment Details with Click-to-Copy */}
              {paymentMethod === 'qris' && (
                <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'inline-block', background: '#FFFFFF', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '6px' }}>
                    <div style={{ width: '130px', height: '130px', background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2.2rem' }}>📷</span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '4px' }}>QRIS RESMI</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Scan QRIS via BCA Mobile, GoPay, OVO, ShopeePay, DANA, Livin, BRImo
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '0.825rem' }}>
                  {/* Bank Kalteng */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 650, color: 'var(--text-primary)' }}>Bank Kalteng (BPD)</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 750, color: 'var(--text-primary)' }}>102-003-88912</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount('10200388912', 'kalteng')}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                    >
                      {copiedBank === 'kalteng' ? '✓ Tersalin!' : '📋 Salin'}
                    </button>
                  </div>

                  {/* Bank Mandiri */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <div>
                      <div style={{ fontWeight: 650, color: 'var(--text-primary)' }}>Bank Mandiri</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 750, color: 'var(--text-primary)' }}>142-00-1928374-1</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount('1420019283741', 'mandiri')}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                    >
                      {copiedBank === 'mandiri' ? '✓ Tersalin!' : '📋 Salin'}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    a.n. Komunitas Pelestari Budaya & Bahasa Arut
                  </div>
                </div>
              )}

              {paymentMethod === 'ewallet' && (
                <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>{language === 'en' ? 'E-Wallet (GoPay / DANA / OVO):' : 'Nomor Akun E-Wallet (GoPay / DANA / OVO):'}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--text-primary)', marginTop: '2px' }}>0812-5544-9988</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount('081255449988', 'ewallet')}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                    >
                      {copiedBank === 'ewallet' ? '✓ Tersalin!' : '📋 Salin'}
                    </button>
                  </div>
                </div>
              )}

              {/* Personal Info */}
              <div className="form-group">
                <label className="form-label">{t('donate.donorName')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={language === 'en' ? 'Your name or alias' : 'Nama Anda atau Hamba Allah'}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('donate.donorEmail')}</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@domain.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('donate.donorMsg')}</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder={language === 'en' ? 'Words of support for the elder preservation team...' : 'Tuliskan kata-kata penyemangat untuk para tetua adat...'}
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {t('donate.submitBtn')} (Rp {(selectedAmount || 0).toLocaleString('id-ID')})
              </button>
            </form>
          )}
        </div>

        {/* Transparency & Impact Section */}
        <div>
          <div className="card-box" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {t('donate.transparency')}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              {language === 'en'
                ? 'Every contribution is transparently deployed for linguistic research, community archives, and elementary textbooks:'
                : 'Setiap rupiah yang terkumpul dilaporkan secara terbuka untuk program-program kerja berikut:'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 650, color: 'var(--text-primary)' }}>
                  <span>50% • {language === 'en' ? 'Fieldwork & Elder Oral Lore Recording' : 'Riset Leksikon & Tutur Lisan Desa'}</span>
                  <span className="badge">{language === 'en' ? 'Priority' : 'Prioritas'}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                  {language === 'en'
                    ? 'Transport by river canoe to remote upstream villages (Pangkut, Gandis, Sukarami, Sambi) for elder interviews.'
                    : 'Biaya transportasi perahu klotok ke desa hulu Arut untuk wawancara tetua adat.'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 650, color: 'var(--text-primary)' }}>
                  <span>30% • {language === 'en' ? 'Elementary School Language Booklets' : 'Cetak Buku Saku Bahasa Sekolah'}</span>
                  <span className="badge">{language === 'en' ? 'Education' : 'Edukasi'}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                  {language === 'en'
                    ? 'Publishing free illustrated vocabulary booklets for rural elementary schools in North Arut.'
                    : 'Mencetak modul leksikon bergambar gratis untuk siswa SD di pedalaman Arut.'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 650, color: 'var(--text-primary)' }}>
                  <span>20% • {language === 'en' ? 'Digital Platform & Server Infrastructure' : 'Digitalisasi & Pemeliharaan Server'}</span>
                  <span className="badge">{language === 'en' ? 'System' : 'Sistem'}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                  {language === 'en'
                    ? 'Cloud server hosting, high-fidelity audio storage, and international linguistic archive maintenance.'
                    : 'Pemeliharaan server cloud, repositori audio, dan domain platform.'}
                </div>
              </div>
            </div>
          </div>

          {/* Donor Wall */}
          <div className="card-box">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {t('donate.donorWall')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentDonations.map((d, idx) => (
                <div key={idx} style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 650, color: 'var(--text-primary)' }}>
                    <span>{d.name}</span>
                    <span>Rp {d.amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>
                    "{d.message}"
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {d.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
