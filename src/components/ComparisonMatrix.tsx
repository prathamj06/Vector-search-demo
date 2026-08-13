'use client';

import React, { useState } from 'react';
import { BookOpen, Cpu, AlertCircle, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { KeywordSearchResult, VectorSearchResult, ConceptInfo } from '../lib/types';
import { ConceptInfoModal } from './ConceptInfoModal';

interface ComparisonMatrixProps {
  query: string;
  keywordResults: KeywordSearchResult[];
  vectorResults: VectorSearchResult[];
}

const COMPARISON_CONCEPT_INFO: ConceptInfo = {
  title: 'Side-by-Side Direct Search Comparison',
  subtitle: 'Directly comparing literal string matching against semantic vector similarity',
  whatItIs:
    'Renders search rankings from both Keyword (Lexical) and Vector (Semantic) engines simultaneously for the exact same input query.',
  whyItMatters:
    'Clearly demonstrates real-world retrieval failures where Keyword search scores 0% on valid answers due to synonym mismatches, while Vector search ranks them near 100%.',
  keywordVsVector:
    'Keyword search ranks documents by counting literal word overlap. Vector search ranks documents by measuring spatial angle and conceptual proximity in vector space.',
};

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  query,
  keywordResults,
  vectorResults,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Interactive Info Modal */}
      <ConceptInfoModal
        info={showInfo ? COMPARISON_CONCEPT_INFO : null}
        onClose={() => setShowInfo(false)}
      />

      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">Side-by-Side Direct Search Comparison</h2>
            <button
              onClick={() => setShowInfo(true)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Explain Comparison Matrix"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          {query ? (
            <code className="text-xs bg-gray-100 border border-gray-200 text-gray-700 px-2.5 py-1 rounded-md font-mono">
              "{query}"
            </code>
          ) : (
            <span className="text-xs text-gray-400 italic">No query entered</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Exact character matching vs. deep semantic conceptual understanding — notice where each engine succeeds and fails.
        </p>
      </div>

      {/* ── Dual Column ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* LEFT — Keyword Search */}
        <div className="bg-white border border-gray-200 border-l-4 border-l-amber-500 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Keyword Search (Lexical)</h3>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
              Literal Overlap
            </span>
          </div>

          <div className="px-5 py-4 space-y-2.5">
            {query.trim() !== '' && keywordResults.every((kr) => kr.matchScore === 0) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>No keyword matches found for "{query}". Exact string overlap scored 0%.</span>
              </div>
            )}
            {keywordResults.map((kr, idx) => {
              const isZero = kr.matchScore === 0;
              return (
                <div
                  key={kr.doc.id}
                  className={`rounded-lg border px-3.5 py-3 transition-colors ${
                    isZero
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      #{idx + 1} {kr.doc.title}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold flex-shrink-0 ${
                        isZero ? 'text-red-500' : 'text-amber-600'
                      }`}
                    >
                      {kr.matchScore}%
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2">"{kr.doc.content}"</p>
                  {/* Score bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isZero ? 'bg-red-400' : 'bg-amber-500'
                      }`}
                      style={{ width: `${kr.matchScore}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">
                      Matched: {kr.matchedTokens.length > 0 ? kr.matchedTokens.join(', ') : 'none'}
                    </span>
                    {isZero && (
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <AlertCircle className="w-3 h-3" /> Synonym missed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Vector Search */}
        <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Vector Search (Semantic)</h3>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Cosine Similarity
            </span>
          </div>

          <div className="px-5 py-4 space-y-2.5">
            {vectorResults.map((vr) => {
              const isHigh = vr.similarity >= 80;
              return (
                <div
                  key={vr.doc.id}
                  className={`rounded-lg border px-3.5 py-3 transition-colors ${
                    isHigh
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      #{vr.rank} {vr.doc.title}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold flex-shrink-0 ${
                        isHigh ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {vr.similarity}%
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2">"{vr.doc.content}"</p>
                  {/* Score bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${vr.similarity}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-mono">
                      vec: [{vr.doc.vector.slice(0, 2).join(', ')}…]
                    </span>
                    {isHigh && (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Semantic match
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
