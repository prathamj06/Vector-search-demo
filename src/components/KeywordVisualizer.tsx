'use client';

import React from 'react';
import { Filter, Trash2, BookOpen, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Document, InvertedIndexEntry, KeywordSearchResult, TokenInfo } from '../lib/types';
import { generateInvertedIndex } from '../lib/keywordEngine';

interface KeywordVisualizerProps {
  query: string;
  tokens: TokenInfo[];
  activeTokens: TokenInfo[];
  filteredStopWords: TokenInfo[];
  keywordResults: KeywordSearchResult[];
  documents: Document[];
}

export const KeywordVisualizer: React.FC<KeywordVisualizerProps> = ({
  query,
  tokens,
  activeTokens,
  filteredStopWords,
  keywordResults,
  documents,
}) => {
  const invertedIndex: InvertedIndexEntry[] = generateInvertedIndex(documents);

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Keyword (Lexical) Search Visualizer
            </h2>
            <p className="text-xs text-slate-400">
              Traditional search relying strictly on exact string matching, stop-word removal, and inverted index lookups.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/30">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Synonym Blind spot</span>
        </div>
      </div>

      {/* 4-STEP EXPOSURE PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* STEP 1: TOKENIZATION & LOWERCASE */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-[10px] font-bold">1</span>
              Step 1: Tokenization
            </span>
            <span className="text-[11px] text-slate-400">{tokens.length} raw token(s)</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-300">
              Raw query text split into clean lowercase word blocks:
            </p>

            {tokens.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Type a query above to see token breakdown...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {tokens.map((token, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition shadow-sm ${
                      token.isStopWord
                        ? 'bg-red-950/40 border-red-500/30 text-red-300 line-through opacity-70'
                        : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200'
                    }`}
                  >
                    "{token.text}"
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: STOP-WORD FILTER */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-[10px] font-bold">2</span>
              Step 2: Stop-Word Filter
            </span>
            <span className="text-[11px] text-amber-300">{filteredStopWords.length} filtered into trash</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Kept Search Terms ({activeTokens.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeTokens.length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">None</span>
                ) : (
                  activeTokens.map((t, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium">
                      {t.text}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-red-500/20 space-y-2">
              <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Trash Bin ({filteredStopWords.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {filteredStopWords.length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">No filler words</span>
                ) : (
                  filteredStopWords.map((t, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-red-950/80 text-red-300 border border-red-500/30 text-xs font-mono line-through">
                      {t.text}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: INVERTED INDEX LOOKUP */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-[10px] font-bold">3</span>
              Step 3: Inverted Index Table
            </span>
            <span className="text-[11px] text-slate-400">"Back-of-the-Book Index"</span>
          </div>

          <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/90 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/50">
                  <th className="py-2 px-3">Indexed Term</th>
                  <th className="py-2 px-3">Doc IDs Count</th>
                  <th className="py-2 px-3">Matched Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {invertedIndex.map((entry) => {
                  const isQueryTerm = activeTokens.some(at => at.text === entry.term);
                  return (
                    <tr
                      key={entry.term}
                      className={isQueryTerm ? 'bg-cyan-950/50 font-bold text-cyan-200' : 'text-slate-400'}
                    >
                      <td className="py-2 px-3 flex items-center gap-1.5">
                        {isQueryTerm && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                        {entry.term}
                      </td>
                      <td className="py-2 px-3 text-slate-300">{entry.count} doc(s)</td>
                      <td className="py-2 px-3">
                        {isQueryTerm ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                            ★ Active Match
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* STEP 4: LITERAL OVERLAP RANKING */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-[10px] font-bold">4</span>
              Step 4: Lexical Match Score Ranking
            </span>
            <span className="text-[11px] text-slate-400">Strict Character Overlap</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {keywordResults.map((result) => {
              const isZero = result.matchScore === 0;
              return (
                <div
                  key={result.doc.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isZero
                      ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                      : 'bg-cyan-950/30 border-cyan-500/30 text-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {result.doc.title}
                      </span>
                      {isZero ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-950 text-red-400 border border-red-500/40 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> 0% Match
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {result.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      "{result.doc.content}"
                    </p>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <div className={`text-base font-bold ${isZero ? 'text-red-400' : 'text-cyan-300'}`}>
                      {result.matchScore}%
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {result.rawMatchCount} term overlap
                    </div>
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
