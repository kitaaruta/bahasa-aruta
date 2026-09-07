'use client';

import React from 'react';
import { DictionaryWord } from '@/data/arutDictionary';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface WordCardProps {
  word: DictionaryWord;
}

export const WordCard: React.FC<WordCardProps> = ({ word }) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const { language } = useLanguage();
  const favorited = isFavorite(word.id);

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.wordArut);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="word-card">
      <div>
        <div className="word-header">
          <div>
            <span className="badge">
              {word.category}
            </span>
            <div className="word-title" style={{ marginTop: '4px' }}>{word.wordArut}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              type="button"
              onClick={speakWord}
              title="Listen Pronunciation"
              className="icon-btn"
              style={{ padding: '4px' }}
            >
              🔊
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(word.id)}
              title={favorited ? 'Remove Favorite' : 'Save Favorite'}
              className="icon-btn"
              style={{
                padding: '4px',
                fontSize: '0.9rem'
              }}
            >
              {favorited ? '★' : '☆'}
            </button>
          </div>
        </div>

        <div className="word-phonetic">/{word.phonetic}/</div>

        <div className="word-meaning-block">
          <div className="word-meaning-id">
            {word.wordId}
          </div>
          <div className="word-meaning-en">
            {word.wordEn}
          </div>
        </div>

        <div className="word-desc">
          {language === 'en' ? (word.meaningEn || word.meaning) : word.meaning}
        </div>
      </div>

      <div>
        {word.exampleArut && (
          <div className="word-example">
            <div className="word-example-arut">"{word.exampleArut}"</div>
            <div className="word-example-id">{word.exampleId}</div>
            {word.exampleEn && (
              <div className="word-example-en"><em>En: {word.exampleEn}</em></div>
            )}
          </div>
        )}

        <div className="word-footer">
          <span>📍 {word.dialect || 'Arut Umum'}</span>
          {word.verifiedBy && (
            <span style={{ color: 'var(--text-muted)' }}>
              ✓ {word.verifiedBy}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
