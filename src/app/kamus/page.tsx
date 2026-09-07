'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ARUT_DICTIONARY } from '@/data/arutDictionary';
import { WordCard } from '@/components/WordCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function KamusPage() {
  const { favorites } = useAuth();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedDialect, setSelectedDialect] = useState<string>('Semua');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const alphabet = ['Semua', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  const categories = [
    'Semua',
    'Nomina',
    'Verba',
    'Adjektiva',
    'Pronomina',
    'Numeralia',
    'Sapaan',
    'Ungkapan Adat'
  ];
  const dialects = ['Semua', 'Arut Umum', 'Arut Utara', 'Pangkut', 'Kobar', 'Tomun'];

  const filteredWords = useMemo(() => {
    return ARUT_DICTIONARY.filter((word) => {
      // 3-way search: Arut, Indonesian, English
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchArut = word.wordArut.toLowerCase().includes(q);
        const matchId = word.wordId.toLowerCase().includes(q);
        const matchEn = word.wordEn.toLowerCase().includes(q);
        const matchMeaning = word.meaning.toLowerCase().includes(q);
        const matchMeaningEn = word.meaningEn?.toLowerCase().includes(q);
        if (!matchArut && !matchId && !matchEn && !matchMeaning && !matchMeaningEn) {
          return false;
        }
      }

      // Letter match
      if (selectedLetter !== 'Semua') {
        if (!word.wordArut.toUpperCase().startsWith(selectedLetter)) return false;
      }

      // Category match
      if (selectedCategory !== 'Semua') {
        if (word.category !== selectedCategory) return false;
      }

      // Dialect match
      if (selectedDialect !== 'Semua') {
        if (!word.dialect?.toLowerCase().includes(selectedDialect.toLowerCase())) return false;
      }

      // Favorites match
      if (showOnlyFavorites) {
        if (!favorites.includes(word.id)) return false;
      }

      return true;
    });
  }, [searchQuery, selectedLetter, selectedCategory, selectedDialect, showOnlyFavorites, favorites]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLetter('Semua');
    setSelectedCategory('Semua');
    setSelectedDialect('Semua');
    setShowOnlyFavorites(false);
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Page Header */}
      <div style={{ margin: '28px 0 20px' }}>
        <div className="hero-tag" style={{ marginBottom: '8px' }}>
          {t('dict.tag')}
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {t('dict.title')}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '720px', marginTop: '4px' }}>
          {t('dict.subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-bar-wrap">
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={t('dict.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="icon-btn"
            style={{ padding: '2px 6px' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Alphabet Index */}
      <div className="alphabet-bar">
        {alphabet.map((letter) => (
          <button
            key={letter}
            type="button"
            className={`letter-btn ${selectedLetter === letter ? 'active' : ''}`}
            onClick={() => setSelectedLetter(letter)}
          >
            {letter === 'Semua' ? (language === 'en' ? 'All' : 'Semua') : letter}
          </button>
        ))}
      </div>

      {/* Category Pills & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div className="category-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'Semua' ? (language === 'en' ? 'All Categories' : 'Semua') : cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Dialect Filter */}
          <select
            value={selectedDialect}
            onChange={(e) => setSelectedDialect(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '0.8rem' }}
          >
            <option value="Semua">{language === 'en' ? 'All Dialects' : 'Semua Dialek'}</option>
            <option value="Arut Umum">Arut Umum</option>
            <option value="Arut Utara">Arut Utara</option>
            <option value="Pangkut">Pangkut</option>
            <option value="Kobar">Kobar</option>
            <option value="Tomun">Tomun / Arut Hulu</option>
          </select>

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`btn btn-sm ${showOnlyFavorites ? 'btn-primary' : 'btn-outline'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            ★ {showOnlyFavorites ? t('dict.allWords') : `${t('dict.favoritesOnly')} (${favorites.length})`}
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.825rem' }}>
        <div>
          {t('dict.showing')} <strong>{filteredWords.length}</strong> {t('dict.from')} <strong>{ARUT_DICTIONARY.length}</strong> {t('dict.words')}
          {selectedLetter !== 'Semua' && ` • ${language === 'en' ? 'Letter' : 'Awalan'} "${selectedLetter}"`}
          {selectedCategory !== 'Semua' && ` • ${selectedCategory}`}
          {selectedDialect !== 'Semua' && ` • ${selectedDialect}`}
          {showOnlyFavorites && ` • ${t('dict.favoritesOnly')}`}
          {searchQuery && ` • "${searchQuery}"`}
        </div>

        {(searchQuery || selectedLetter !== 'Semua' || selectedCategory !== 'Semua' || selectedDialect !== 'Semua' || showOnlyFavorites) && (
          <button
            type="button"
            onClick={resetFilters}
            className="icon-btn"
            style={{ fontWeight: 600 }}
          >
            ↺ Reset
          </button>
        )}
      </div>

      {/* Words Grid */}
      {filteredWords.length > 0 ? (
        <div className="words-grid">
          {filteredWords.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      ) : (
        <div className="card-box" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔎</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {t('dict.notFound')}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            {t('dict.notFoundDesc')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button type="button" onClick={resetFilters} className="btn btn-outline btn-sm">
              {t('dict.allWords')}
            </button>
            <Link href="/area-kontributor" className="btn btn-primary btn-sm">
              {t('dict.proposeWord')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
