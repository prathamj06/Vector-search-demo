'use client';

import React from 'react';
import { BookOpen, Cpu, AlertCircle, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { KeywordSearchResult, VectorSearchResult } from '../lib/types';

interface ComparisonMatrixProps {
  query: string;
  keywordResults: KeywordSearchResult[];
  vectorResults: VectorSearchResult[];
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  query,
  keywordResults,
  vectorResults,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span>Side-by-Side Direct Search Comparison</span>
        </h2>
        <p className="text-xs text-slate-400">
          Comparing exact character matching vs deep semantic conceptual understanding for query: <strong className="text-cyan-300">"{query || 'None'}"</strong>
        </p>
      </div>

      {/* Side-by-Side Dual Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT COLUMN: KEYWORD SEARCH RESULTS */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">
                Keyword Search (Lexical)
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
              Literal Overlap
            </span>
          </div>

          <div className="space-y-3">
            {keywordResults.map((kr, idx) => {
              const isZero = kr.matchScore === 0;
              return (
                <div
                  key={kr.doc.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isZero
                      ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                      : 'bg-amber-950/20 border-amber-500/30 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">
                      #{idx + 1} {kr.doc.title}
                    </span>
                    <span className={`text-xs font-mono font-bold ${isZero ? 'text-red-400' : 'text-amber-300'}`}>
                      {kr.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    "{kr.doc.content}"
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      Matched tokens: {kr.matchedTokens.length > 0 ? kr.matchedTokens.join(', ') : 'None'}
                    </span>
                    {isZero && (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Synonym Missed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: VECTOR SEARCH RESULTS */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">
                Vector Search (Semantic)
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
              Cosine Similarity
            </span>
          </div>

          <div className="space-y-3">
            {vectorResults.map((vr) => {
              const isHigh = vr.similarity >= 80;
              return (
                <div
                  key={vr.doc.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isHigh
                      ? 'bg-cyan-950/30 border-cyan-500/40 text-slate-100 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">
                      #{vr.rank} {vr.doc.title}
                    </span>
                    <span className={`text-xs font-mono font-bold ${isHigh ? 'text-emerald-400' : 'text-cyan-300'}`}>
                      {vr.similarity}% Similarity
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    "{vr.doc.content}"
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">
                      Dense 4D: [{vr.doc.vector.slice(0, 2).join(', ')}...]
                    </span>
                    {isHigh && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Semantic Match
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
