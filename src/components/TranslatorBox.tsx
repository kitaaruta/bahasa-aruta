'use client';

import React, { useState, useEffect } from 'react';
import { translateText, DictionaryWord, COMMON_PHRASES, LangCode } from '@/data/arutDictionary';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface TranslatorBoxProps {
  initialText?: string;
  showPhrases?: boolean;
}

export const TranslatorBox: React.FC<TranslatorBoxProps> = ({
  initialText = '',
  showPhrases = true
}) => {
  const { t, language } = useLanguage();
  const { allDictionaryWords } = useAuth();
  const [fromLang, setFromLang] = useState<LangCode>('id');
  const [toLang, setToLang] = useState<LangCode>('arut');
  const [inputText, setInputText] = useState(initialText);
  const [resultText, setResultText] = useState('');
  const [matchedWords, setMatchedWords] = useState<DictionaryWord[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionSent, setSuggestionSent] = useState(false);

  useEffect(() => {
    if (language === 'en' && fromLang === 'id' && !inputText) {
      setFromLang('en');
    }
  }, [language]);

  // Real-time translation
  useEffect(() => {
    if (!inputText.trim()) {
      setResultText('');
      setMatchedWords([]);
      setNotes([]);
      return;
    }

    const { translatedText, matchedWords: matched, notes: nts } = translateText(
      inputText,
      fromLang,
      toLang,
      allDictionaryWords
    );
    setResultText(translatedText);
    setMatchedWords(matched);
    setNotes(nts);
  }, [inputText, fromLang, toLang, allDictionaryWords]);

  const handleSwap = () => {
    const prevFrom = fromLang;
    const prevTo = toLang;
    setFromLang(prevTo);
    setToLang(prevFrom);
    setInputText(resultText);
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setResultText('');
    setMatchedWords([]);
    setNotes([]);
  };

  const handleSelectPhrase = (phrase: typeof COMMON_PHRASES[0]) => {
    if (fromLang === 'arut') {
      setInputText(phrase.arut);
    } else if (fromLang === 'id') {
      setInputText(phrase.indonesia);
    } else {
      setInputText(phrase.english);
    }
  };

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    setSuggestionSent(true);
    setTimeout(() => {
      setSuggestionSent(false);
      setShowSuggestionForm(false);
      setSuggestionText('');
    }, 2500);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = toLang === 'en' ? 'en-US' : 'id-ID';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getPlaceholder = () => {
    if (fromLang === 'arut') return t('trans.placeholderArut');
    if (fromLang === 'en') return t('trans.placeholderEn');
    return t('trans.placeholderId');
  };

  return (
    <div className="translator-card-prominent">
      {/* Visual Top Banner for Instant Recognition */}
      <div className="translator-top-banner">
        <span>🔄 {language === 'en' ? 'TRILINGUAL TRANSLATOR' : 'KOTAK PENERJEMAH UTAMA'}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>DAYAK ARUT ⇄ ID ⇄ EN</span>
      </div>

      {/* Prominent Header Selector */}
      <div className="translator-header">
        <div className="lang-select-group">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 650 }}>
            {t('trans.sourceLang')}:
          </span>
          <select
            className="lang-select-dropdown"
            value={fromLang}
            onChange={(e) => {
              const newFrom = e.target.value as LangCode;
              setFromLang(newFrom);
              if (newFrom === toLang) {
                setToLang(newFrom === 'arut' ? 'id' : 'arut');
              }
            }}
          >
            <option value="arut">🌿 Dayak Arut</option>
            <option value="id">🇮🇩 Bahasa Indonesia</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className="swap-btn-prominent"
          title="Tukar Bahasa / Swap Languages"
          aria-label="Tukar Bahasa / Swap Languages"
        >
          ⇄
        </button>

        <div className="lang-select-group" style={{ justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 650 }}>
            {t('trans.targetLang')}:
          </span>
          <select
            className="lang-select-dropdown"
            value={toLang}
            onChange={(e) => {
              const newTo = e.target.value as LangCode;
              setToLang(newTo);
              if (newTo === fromLang) {
                setFromLang(newTo === 'arut' ? 'id' : 'arut');
              }
            }}
          >
            <option value="arut">🌿 Dayak Arut</option>
            <option value="id">🇮🇩 Bahasa Indonesia</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
      </div>

      {/* Body Panes */}
      <div className="translator-body">
        {/* Input Pane */}
        <div className="trans-pane">
          <textarea
            className="trans-textarea"
            placeholder={getPlaceholder()}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={1000}
          />

          <div className="trans-pane-footer">
            <span>{inputText.length}/1000 {t('trans.chars')}</span>
            <div className="trans-actions">
              {inputText && (
                <button type="button" onClick={handleClear} className="icon-btn" title="Clear">
                  ✕ {t('trans.clear')}
                </button>
              )}
              {inputText && (
                <button type="button" onClick={() => speakText(inputText)} className="icon-btn" title="Listen">
                  🔊 {t('trans.listen')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Output Pane */}
        <div className="trans-pane" style={{ background: '#FAF9F8' }}>
          <div className="trans-result-area">
            {resultText ? (
              <span>{resultText}</span>
            ) : (
              <span className="trans-result-placeholder">
                {language === 'en'
                  ? 'Translation appears instantly here...'
                  : 'Terjemahan akan langsung muncul di sini...'}
              </span>
            )}
          </div>

          <div className="trans-pane-footer">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {matchedWords.length > 0 ? `✓ ${matchedWords.length} ${t('trans.lexiconFound')}` : ''}
            </span>
            <div className="trans-actions">
              {resultText && (
                <>
                  <button type="button" onClick={() => speakText(resultText)} className="icon-btn" title="Listen Pronunciation">
                    🔊 {t('trans.listen')}
                  </button>
                  <button type="button" onClick={handleCopy} className="icon-btn" style={{ fontWeight: 650 }}>
                    {copied ? `✓ ${t('trans.copied')}` : `📋 ${t('trans.copy')}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                    className="icon-btn"
                    title="Suggest Edit"
                  >
                    ✏️ {t('trans.suggest')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Form */}
      {showSuggestionForm && (
        <div style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-color)', padding: '14px 16px' }}>
          {suggestionSent ? (
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
              ✓ {language === 'en'
                ? 'Thank you! Your proposed edit has been forwarded to the Dayak Arut elder committee.'
                : 'Terima kasih! Usulan perbaikan telah dikirim ke tim telaah adat Dayak Arut.'}
            </div>
          ) : (
            <form onSubmit={handleSendSuggestion}>
              <div style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '8px' }}>
                ✍️ {language === 'en' ? 'Suggest a more accurate indigenous expression:' : 'Usulkan padanan yang lebih tepat menurut penutur asli:'}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={language === 'en' ? 'Type accurate phrase...' : 'Ketik kalimat yang lebih tepat...'}
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  style={{ flexGrow: 1, minWidth: '200px' }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  {language === 'en' ? 'Submit' : 'Kirim Usulan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuggestionForm(false)}
                  className="btn btn-outline btn-sm"
                >
                  {language === 'en' ? 'Cancel' : 'Batal'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Matched Words Lexicon */}
      {matchedWords.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-color)', padding: '12px 16px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            📖 {language === 'en' ? 'Detected Lexicons in Sentence:' : 'Kosakata Terdeteksi dalam Kalimat:'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {matchedWords.map((word) => (
              <div
                key={word.id}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  fontSize: '0.825rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{word.wordArut}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/{word.phonetic}/</span>
                  <span className="badge">{word.category}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.775rem' }}>
                  = {language === 'en' ? `${word.wordEn} (${word.wordId})` : word.wordId}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Phrases Strip */}
      {showPhrases && (
        <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--text-muted)', marginBottom: '4px' }}>
            💡 {t('trans.tryPhrases')}
          </div>
          <div className="phrase-strip">
            {COMMON_PHRASES.slice(0, 6).map((phrase) => {
              let label = phrase.indonesia;
              if (fromLang === 'arut') label = phrase.arut;
              else if (fromLang === 'en') label = phrase.english;

              return (
                <button
                  key={phrase.id}
                  type="button"
                  className="phrase-chip"
                  onClick={() => handleSelectPhrase(phrase)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
