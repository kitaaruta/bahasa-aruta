'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TranslatorBox } from '@/components/TranslatorBox';
import { WordCard } from '@/components/WordCard';
import { ARUT_DICTIONARY } from '@/data/arutDictionary';
import { CONTRIBUTORS_DATA } from '@/data/contributors';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { t, language } = useLanguage();
  const [wordOfTheDay] = useState(ARUT_DICTIONARY[31]); // Bahalap (Bagus / Indah / Beautiful)
  const featuredWords = ARUT_DICTIONARY.slice(0, 6);

  return (
    <div className="container">
      {/* Hero Section (Harmonized Minimalist) */}
      <section className="hero-box">
        <div className="hero-tag">
          {t('hero.tag')}
        </div>
        <h1 className="hero-title">
          {t('hero.title')}
        </h1>
        <p className="hero-desc">
          {t('hero.desc')}
        </p>

        {/* Action quick links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/terjemahan" className="btn btn-primary">
            {t('hero.btnTranslate')}
          </Link>
          <Link href="/kamus" className="btn btn-outline">
            {t('hero.btnDictionary')} ({ARUT_DICTIONARY.length}+)
          </Link>
          <Link href="/donasi" className="btn btn-outline">
            {t('hero.btnDonate')}
          </Link>
        </div>
      </section>

      {/* Main Interactive Translator Showcase */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 750, color: 'var(--text-primary)' }}>
              {t('trans.title')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('trans.subtitle')}
            </p>
          </div>
          <Link href="/terjemahan" style={{ fontSize: '0.825rem', fontWeight: 650, color: 'var(--text-primary)' }}>
            {t('trans.fullMode')}
          </Link>
        </div>

        <TranslatorBox />
      </section>

      {/* Word of the Day & Ecosystem Overview */}
      <section style={{ marginBottom: '40px' }}>
        <div className="dashboard-grid">
          {/* Word of the Day */}
          <div className="card-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                {t('home.wordOfDay')}
              </span>
              <span className="badge">{wordOfTheDay.category}</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
              {wordOfTheDay.wordArut}
            </h3>
            <div className="word-phonetic">
              /{wordOfTheDay.phonetic}/
            </div>
            <div style={{ margin: '6px 0 10px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {wordOfTheDay.wordId}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {wordOfTheDay.wordEn}
              </div>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              {language === 'en' ? wordOfTheDay.meaningEn : wordOfTheDay.meaning}
            </p>
            <div className="word-example" style={{ marginBottom: '14px' }}>
              <div className="word-example-arut">"{wordOfTheDay.exampleArut}"</div>
              <div className="word-example-id">{wordOfTheDay.exampleId}</div>
              {wordOfTheDay.exampleEn && (
                <div className="word-example-en"><em>En: {wordOfTheDay.exampleEn}</em></div>
              )}
            </div>
            <Link href="/kamus" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
              {t('home.openInDict')}
            </Link>
          </div>

          {/* Community Overview */}
          <div className="card-box">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 750, marginBottom: '10px', color: 'var(--text-primary)' }}>
              {t('home.preservationTitle')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '18px' }}>
              {t('home.preservationDesc')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 6px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {ARUT_DICTIONARY.length}+
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('home.statWords')}</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 6px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {CONTRIBUTORS_DATA.length}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('home.statContributors')}</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 6px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  100%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('home.statAccess')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/kontributor" className="btn btn-outline btn-sm" style={{ flexGrow: 1 }}>
                {t('nav.contributors')}
              </Link>
              <Link href="/masuk" className="btn btn-primary btn-sm" style={{ flexGrow: 1 }}>
                {t('nav.auth')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dictionary Entries */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 750, color: 'var(--text-primary)' }}>
              {t('home.popularSnippet')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('home.popularDesc')}
            </p>
          </div>
          <Link href="/kamus" className="btn btn-outline btn-sm">
            {t('home.seeAllWords')}
          </Link>
        </div>

        <div className="words-grid">
          {featuredWords.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      </section>

      {/* Harmonious Call to Action */}
      <section className="card-box" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          {t('home.ctaTitle')}
        </h2>
        <p style={{ maxWidth: '600px', margin: '0 auto 18px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {t('home.ctaDesc')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/donasi" className="btn btn-primary">
            {t('home.ctaDonate')}
          </Link>
          <Link href="/area-kontributor" className="btn btn-outline">
            {t('home.ctaPropose')}
          </Link>
        </div>
      </section>
    </div>
  );
}
