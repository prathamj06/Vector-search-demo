'use client';

import React, { useState } from 'react';
import { Filter, Trash2, BookOpen, AlertTriangle, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import { Document, InvertedIndexEntry, KeywordSearchResult, TokenInfo, ConceptInfo } from '../lib/types';
import { generateInvertedIndex } from '../lib/keywordEngine';
import { ConceptInfoModal } from './ConceptInfoModal';

interface KeywordVisualizerProps {
  query: string;
  tokens: TokenInfo[];
  activeTokens: TokenInfo[];
  filteredStopWords: TokenInfo[];
  keywordResults: KeywordSearchResult[];
  documents: Document[];
}

const KEYWORD_CONCEPT_INFOS: Record<number, ConceptInfo> = {
  1: {
    title: 'Step 1: Lexical Tokenization',
    subtitle: 'Splitting text into normalized word tokens',
    whatItIs:
      'The raw search query is split into individual lowercase word tokens, stripping punctuation and special symbols.',
    whyItMatters:
      'Normalizing text ensures case-insensitive matching ("Dog" == "dog").',
    keywordVsVector:
      'Keyword search treats words as isolated string tokens. Vector search embeds whole sentence concepts into mathematical vectors.',
  },
  2: {
    title: 'Step 2: Stop-Word Removal',
    subtitle: 'Filtering out common structural filler words',
    whatItIs:
      'Identifies and discards common words like "the", "a", "is", "at" that carry little search intent.',
    whyItMatters:
      'Prevents false positive matches on non-descriptive filler words.',
    keywordVsVector:
      'Keyword search must manually remove stop words to prevent noise. Vector embeddings naturally weight term importance contextually.',
  },
  3: {
    title: 'Step 3: Inverted Index Table',
    subtitle: 'The "back-of-the-book" term-to-document lookup index',
    whatItIs:
      'A lookup table mapping every unique word in the corpus to the list of document IDs where it appears.',
    whyItMatters:
      'Allows instantaneous lookup without scanning through every document line-by-line.',
    keywordVsVector:
      'Inverted indices store exact text keys. Vector database indices (HNSW, IVF) build spatial proximity graphs of embedding vectors.',
  },
  4: {
    title: 'Step 4: Lexical Overlap Ranking',
    subtitle: 'Calculating exact word match percentage',
    whatItIs:
      'Ranks documents based on what percentage of active query tokens appear literally in the document text.',
    whyItMatters:
      'Fast and exact for known names, SKUs, and exact quotes.',
    keywordVsVector:
      'If the query uses synonyms ("speedy" vs "quick"), keyword match score drops to 0%. Vector search understands semantic equivalence.',
  },
};

const StepBadge: React.FC<{ n: number; color: 'blue' | 'amber' | 'indigo' | 'green' }> = ({ n, color }) => {
  const colors = {
    blue:   'bg-blue-600 text-white',
    amber:  'bg-amber-500 text-white',
    indigo: 'bg-indigo-600 text-white',
    green:  'bg-green-600 text-white',
  };
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold flex-shrink-0 ${colors[color]}`}>
      {n}
    </span>
  );
};

const StepCard: React.FC<{ children: React.ReactNode; accent: 'blue' | 'amber' | 'indigo' | 'green' }> = ({ children, accent }) => {
  const borders = {
    blue:   'border-l-blue-500',
    amber:  'border-l-amber-500',
    indigo: 'border-l-indigo-500',
    green:  'border-l-green-500',
  };
  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${borders[accent]} rounded-xl shadow-xs overflow-hidden`}>
      {children}
    </div>
  );
};

export const KeywordVisualizer: React.FC<KeywordVisualizerProps> = ({
  query,
  tokens,
  activeTokens,
  filteredStopWords,
  keywordResults,
  documents,
}) => {
  const [activeInfoStep, setActiveInfoStep] = useState<number | null>(null);
  const invertedIndex: InvertedIndexEntry[] = generateInvertedIndex(documents);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Interactive Info Modal */}
      <ConceptInfoModal
        info={activeInfoStep ? KEYWORD_CONCEPT_INFOS[activeInfoStep] : null}
        onClose={() => setActiveInfoStep(null)}
      />

      {/* ── Module Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Keyword (Lexical) Search Engine</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Traditional exact-string matching — tokenization → stop-word removal → inverted index → literal overlap
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium self-start sm:self-auto flex-shrink-0">
          <ShieldAlert className="w-3.5 h-3.5" />
          Synonym Blind Spot
        </div>
      </div>

      {/* ── 4-Step Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* STEP 1 — Tokenization */}
        <StepCard accent="blue">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StepBadge n={1} color="blue" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Step 1: Tokenization
              </span>
              <button
                onClick={() => setActiveInfoStep(1)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Explain Step 1"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-gray-400">{tokens.length} raw token{tokens.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-gray-500">
              Query split into lowercase word blocks. Stop words are flagged for removal.
            </p>
            {tokens.length === 0 ? (
              <div className="px-4 py-6 rounded-lg border border-dashed border-gray-200 text-center text-xs text-gray-400">
                Type a query above to see token breakdown…
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tokens.map((token, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${
                      token.isStopWord
                        ? 'bg-red-50 border-red-200 text-red-500 line-through'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}
                  >
                    {token.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </StepCard>

        {/* STEP 2 — Stop-Word Filter */}
        <StepCard accent="amber">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StepBadge n={2} color="amber" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Step 2: Stop-Word Filter
              </span>
              <button
                onClick={() => setActiveInfoStep(2)}
                className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                title="Explain Step 2"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-amber-600">{filteredStopWords.length} filtered</span>
          </div>

          <div className="px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Kept */}
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 space-y-2">
                <span className="text-[11px] font-semibold text-green-700 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Kept ({activeTokens.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeTokens.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">None</span>
                  ) : (
                    activeTokens.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white text-green-700 border border-green-300 text-xs font-mono font-medium">
                        {t.text}
                      </span>
                    ))
                  )}
                </div>
              </div>
              {/* Removed */}
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-2">
                <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Removed ({filteredStopWords.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {filteredStopWords.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No filler words</span>
                  ) : (
                    filteredStopWords.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white text-red-500 border border-red-200 text-xs font-mono line-through">
                        {t.text}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </StepCard>

        {/* STEP 3 — Inverted Index Table */}
        <StepCard accent="indigo">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StepBadge n={3} color="indigo" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Step 3: Inverted Index
              </span>
              <button
                onClick={() => setActiveInfoStep(3)}
                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Explain Step 3"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-gray-400">Term Lookup Table</span>
          </div>

          <div className="overflow-auto max-h-[550px]">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="text-left py-2.5 px-4">Term</th>
                  <th className="text-left py-2.5 px-4">Docs</th>
                  <th className="text-left py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {invertedIndex.map((entry) => {
                  const isQueryTerm = activeTokens.some((at) => at.text === entry.term);
                  return (
                    <tr
                      key={entry.term}
                      className={isQueryTerm ? 'bg-blue-50' : 'hover:bg-gray-50 transition-colors'}
                    >
                      <td className="py-2 px-4">
                        <span className={`flex items-center gap-1.5 ${isQueryTerm ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>
                          {isQueryTerm && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 animate-subtle-pulse" />
                          )}
                          {entry.term}
                        </span>
                      </td>
                      <td className={`py-2 px-4 ${isQueryTerm ? 'text-blue-600' : 'text-gray-500'}`}>
                        {entry.count}
                      </td>
                      <td className="py-2 px-4">
                        {isQueryTerm ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            Active match
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </StepCard>

        {/* STEP 4 — Lexical Match Score Ranking */}
        <StepCard accent="green">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StepBadge n={4} color="green" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Step 4: Lexical Overlap Ranking
              </span>
              <button
                onClick={() => setActiveInfoStep(4)}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Explain Step 4"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-gray-400">Strict Character Overlap</span>
          </div>

          <div className="px-5 py-4 space-y-3 max-h-[550px] overflow-y-auto">
            {/* Zero-Match Empty State Banner */}
            {query.trim() !== '' && keywordResults.every((r) => r.matchScore === 0) && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">No matches found</strong>
                  <p className="text-[11px] text-red-600 mt-0.5">
                    Zero exact keyword matches found for "{query}". Keyword search requires exact character token overlap and is blind to synonyms or related terms.
                  </p>
                </div>
              </div>
            )}

            {keywordResults.map((result) => {
              const isZero = result.matchScore === 0;
              return (
                <div
                  key={result.doc.id}
                  className={`rounded-lg border px-3.5 py-3 flex items-center gap-3 transition-colors ${
                    isZero
                      ? 'bg-red-50/60 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-800 truncate">{result.doc.title}</span>
                      {isZero ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 flex-shrink-0">
                          <AlertTriangle className="w-3 h-3" /> 0% Match
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> {result.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">"{result.doc.content}"</p>
                    {/* Score bar */}
                    <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${isZero ? 'bg-red-400' : 'bg-green-500'}`}
                        style={{ width: `${result.matchScore}%` }}
                      />
                    </div>
                  </div>
                  <div className={`text-lg font-bold font-mono flex-shrink-0 ${isZero ? 'text-red-500' : 'text-green-600'}`}>
                    {result.matchScore}%
                  </div>
                </div>
              );
            })}
          </div>
        </StepCard>

      </div>
    </div>
  );
};
