'use client';

import React, { useState } from 'react';
import { Sparkles, Sliders, Scale, GitMerge, Info, Star, AlertTriangle, CheckCircle2, Zap, ShieldAlert, BookOpen, Cpu } from 'lucide-react';
import { Document, HybridMethod, HybridSearchResult, KeywordSearchResult, VectorSearchResult } from '../lib/types';
import { ConceptInfoModal } from './ConceptInfoModal';

interface HybridVisualizerProps {
  query: string;
  hybridResults: HybridSearchResult[];
  keywordResults: KeywordSearchResult[];
  vectorResults: VectorSearchResult[];
  hybridMethod: HybridMethod;
  setHybridMethod: (m: HybridMethod) => void;
  alpha: number;
  setAlpha: (a: number) => void;
  rrfK: number;
  setRrfK: (k: number) => void;
  activeDomain: string;
  documents: Document[];
}

export const HybridVisualizer: React.FC<HybridVisualizerProps> = ({
  query,
  hybridResults,
  hybridMethod,
  setHybridMethod,
  alpha,
  setAlpha,
  rrfK,
  setRrfK,
  activeDomain,
}) => {
  const [showDeepDive, setShowDeepDive] = useState(true);

  // Top result for highlighting
  const topResult = hybridResults[0];
  const isZeroMatch = query.trim() !== '' && topResult && topResult.hybridScore === 0;

  // Domain specific edge case name for educational callout
  const getDomainEdgeCase = () => {
    if (activeDomain === 'ecommerce') {
      return {
        query: 'warm winter coat',
        targetDoc: 'Cozy Fleece Thermal Jacket',
        synonymNote: 'Keyword gives 0% ("coat" vs "jacket"), Vector gives ~88% (thermal outerwear). Linear 50/50 halves score to 44%, while RRF keeps it #1 via vector rank!',
      };
    }
    if (activeDomain === 'movies') {
      return {
        query: 'mind-bending space movie',
        targetDoc: 'Interstellar Cosmic Odyssey',
        synonymNote: 'Keyword misses literal word "movie" (0%), Vector scores ~90% on space wormholes. RRF ranks it #1 automatically!',
      };
    }
    return {
      query: 'speedy dog',
      targetDoc: 'Quick Canine Field Run',
      synonymNote: 'Keyword search gives 0% ("speedy" vs "quick", "dog" vs "canine"), Vector gives ~92%. In 50/50 linear blend the score drops to 46%, but RRF preserves it as #1!',
    };
  };

  const edgeCase = getDomainEdgeCase();

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Module Header & Method Switcher ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Hybrid Search Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                  Dual Retrieval
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Combines Lexical (Keyword) exact-matching with Semantic (Vector) deep conceptual embeddings
              </p>
            </div>
          </div>

          {/* Method Switcher Toggle */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl self-start lg:self-auto">
            <button
              onClick={() => setHybridMethod('linear')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                hybridMethod === 'linear'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Linear Weighted (α-Blend)</span>
            </button>

            <button
              onClick={() => setHybridMethod('rrf')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                hybridMethod === 'rrf'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Reciprocal Rank Fusion (RRF)</span>
            </button>
          </div>
        </div>

        {/* ── Dynamic Controls Bar ── */}
        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
          {hybridMethod === 'linear' ? (
            <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-gray-800">
                  Fusion Balance (α-Weight):
                </span>
              </div>

              {/* Slider */}
              <div className="flex-1 flex items-center gap-3">
                <span className="text-[11px] font-mono font-bold text-amber-700 flex-shrink-0 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-600" />
                  Keyword: {Math.round((1 - alpha) * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={alpha}
                  onChange={(e) => setAlpha(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  aria-label="Adjust alpha weight between keyword and vector search"
                />
                <span className="text-[11px] font-mono font-bold text-blue-700 flex-shrink-0 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-blue-600" />
                  Vector: {Math.round(alpha * 100)}%
                </span>
              </div>

              <span className="text-xs font-mono font-extrabold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200 self-start sm:self-auto">
                α = {alpha.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-gray-800">
                  RRF Formula: RRF(d) = 1/(k + rank_vec) + 1/(k + rank_key)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Smoothing Factor (k):</span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-300">
                  {[60, 20, 10].map((val) => (
                    <button
                      key={val}
                      onClick={() => setRrfK(val)}
                      className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                        rrfK === val
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      k={val} {val === 60 ? '(Standard)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Educational Deep-Dive & Loopholes Analysis Callout ── */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
              💡
            </span>
            <h3 className="text-sm font-bold text-purple-950">
              {hybridMethod === 'linear'
                ? 'Method Deep-Dive: Linear Weighted Combination (α-Blending)'
                : 'Method Deep-Dive: Reciprocal Rank Fusion (RRF)'}
            </h3>
          </div>

          <button
            onClick={() => setShowDeepDive(!showDeepDive)}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 underline cursor-pointer"
          >
            {showDeepDive ? 'Hide Breakdown' : 'Show Full Comparison'}
          </button>
        </div>

        {showDeepDive && (
          <div className="space-y-4 pt-1">
            {hybridMethod === 'linear' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* How it works */}
                <div className="bg-white/90 p-3.5 rounded-xl border border-purple-200 space-y-2 text-xs text-gray-800">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    How Linear α-Blending Works:
                  </span>
                  <p className="leading-relaxed text-gray-700">
                    Blends raw normalized percentage scores using weight factor $\alpha$:
                    <br />
                    <code className="bg-purple-50 text-purple-800 font-mono px-1.5 py-0.5 rounded border border-purple-200 font-bold inline-block mt-1">
                      Score = (α × VectorScore) + ((1 - α) × KeywordScore)
                    </code>
                  </p>
                  <p className="text-[11px] text-gray-600">
                    <strong>When it excels:</strong> When you need explicit bias control (e.g. favoring exact SKU numbers or title matches in E-Commerce by setting $\alpha=0.3$).
                  </p>
                </div>

                {/* Loopholes & Pitfalls */}
                <div className="bg-amber-50/90 p-3.5 rounded-xl border border-amber-200 space-y-2 text-xs text-amber-950">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    The Loopholes & Pitfalls:
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed text-amber-900">
                    <li>
                      <strong>The Scale Calibration Trap:</strong> A 70% lexical word overlap doesn't mean the same thing as a 70% vector cosine similarity. Blending them directly can distort true relevance.
                    </li>
                    <li>
                      <strong>The Synonym Penalty:</strong> When searching <em>"{edgeCase.query}"</em>, document <em>"{edgeCase.targetDoc}"</em> scores 0% in keyword search. At $\alpha=0.5$, its 92% semantic score is cut in half to 46%!
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* How RRF works */}
                <div className="bg-white/90 p-3.5 rounded-xl border border-purple-200 space-y-2 text-xs text-gray-800">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    How Reciprocal Rank Fusion (RRF) Works:
                  </span>
                  <p className="leading-relaxed text-gray-700">
                    Ignores raw score magnitudes and ranks documents based on reciprocal position:
                    <br />
                    <code className="bg-purple-50 text-purple-800 font-mono px-1.5 py-0.5 rounded border border-purple-200 font-bold inline-block mt-1">
                      RRF(d) = 1/(k + rank_vec) + 1/(k + rank_key)
                    </code>
                  </p>
                  <p className="text-[11px] text-gray-600">
                    <strong>Why Vector DBs love RRF:</strong> Zero score calibration or tuning required! It seamlessly blends heterogeneous retrieval engines without score scale mismatches.
                  </p>
                </div>

                {/* Loopholes & Pitfalls */}
                <div className="bg-amber-50/90 p-3.5 rounded-xl border border-amber-200 space-y-2 text-xs text-amber-950">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    The Loopholes & Pitfalls:
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed text-amber-900">
                    <li>
                      <strong>Score Blindness (Confidence Ignorance):</strong> RRF treats Rank #1 with a 99% similarity score identically to Rank #1 with a 30% similarity score, ignoring certainty margins.
                    </li>
                    <li>
                      <strong>The Unranked Cliff:</strong> A document that is #1 in Vector search but unranked in Keyword search gets only $\frac{1}{61} \approx 0.0164$, whereas a mediocre document (#5 in both) gets $\frac{1}{65} + \frac{1}{65} \approx 0.0308$, beating the top semantic match!
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Side-by-Side Algorithm Comparison Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-[11px] bg-white rounded-xl border border-purple-200 overflow-hidden text-left">
                <thead>
                  <tr className="bg-purple-100/60 border-b border-purple-200 text-purple-950 font-bold">
                    <th className="py-2 px-3">Criteria</th>
                    <th className="py-2 px-3">⚖️ Linear Weighted Fusion (α-Blend)</th>
                    <th className="py-2 px-3">🔀 Reciprocal Rank Fusion (RRF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 font-medium text-gray-700">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-purple-900">Primary Input</td>
                    <td className="py-2 px-3">Raw normalized percentage scores ($0\% \to 100\%$)</td>
                    <td className="py-2 px-3">Relative integer rank positions ($1, 2, 3...$)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-purple-900">Tuning Difficulty</td>
                    <td className="py-2 px-3">Requires finding optimal $\alpha$ weight for domain</td>
                    <td className="py-2 px-3">Zero tuning needed (fixed constant $k=60$)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-purple-900">Synonym Handling</td>
                    <td className="py-2 px-3 text-amber-800">Can penalize valid synonyms if keyword score is 0%</td>
                    <td className="py-2 px-3 text-emerald-800">Preserves high vector ranks without score halving</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-purple-900">Confidence Sensitivity</td>
                    <td className="py-2 px-3 text-emerald-800">Retains exact confidence score spread</td>
                    <td className="py-2 px-3 text-amber-800">Blind to whether Rank #1 was 99% or 30%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-purple-900">Industry Standard Use</td>
                    <td className="py-2 px-3">Custom E-Commerce & calibrated search pipelines</td>
                    <td className="py-2 px-3">Pinecone, Weaviate, Qdrant, Azure AI Search</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Zero-Match Empty State ── */}
      {isZeroMatch && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-950">No relevant hybrid matches found</strong>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Query "{query}" yielded zero keyword character matches and fell below semantic similarity thresholds across all indexed documents.
            </p>
          </div>
        </div>
      )}

      {/* ── Hybrid Ranked Results ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Hybrid Search Ranked Results ({hybridResults.length})
          </h3>
          <span className="text-xs font-mono text-gray-500">
            Active Mode: {hybridMethod === 'linear' ? `Linear (α=${alpha.toFixed(2)})` : `RRF (k=${rrfK})`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hybridResults.map((item) => {
            const isRankOne = item.rank === 1;

            return (
              <div
                key={item.doc.id}
                className={`p-4 rounded-2xl border transition-all relative space-y-3 ${
                  isRankOne
                    ? 'border-2 border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-400/30 shadow-md'
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-xs'
                }`}
              >
                {/* Header: Title & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold text-gray-900 truncate">
                        #{item.rank} {item.doc.title}
                      </span>
                      {isRankOne && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs flex-shrink-0">
                          <Star className="w-3 h-3 fill-white" /> Top Match
                        </span>
                      )}
                      {item.badgeTag === 'dual_consensus' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                          🤝 Dual Consensus
                        </span>
                      )}
                      {item.badgeTag === 'vector_rescued' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          ⚡ Rescued by Vector
                        </span>
                      )}
                      {item.badgeTag === 'keyword_boosted' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          🎯 Exact Match Boost
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                      "{item.doc.content}"
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-extrabold font-mono text-purple-700">
                      {item.hybridScore}%
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400">
                      {hybridMethod === 'linear' ? 'Blend Score' : 'RRF Score'}
                    </span>
                  </div>
                </div>

                {/* Mathematical Breakdown Bar */}
                <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200 space-y-2 text-[11px]">
                  {hybridMethod === 'linear' && item.linearBreakdown && (
                    <>
                      <div className="flex items-center justify-between text-gray-700 font-medium">
                        <span className="flex items-center gap-1 text-amber-700">
                          <BookOpen className="w-3 h-3" /> Keyword: {item.keywordScore}% × {(1 - alpha).toFixed(2)} = +{item.linearBreakdown.keywordComponent}%
                        </span>
                        <span className="flex items-center gap-1 text-blue-700">
                          <Cpu className="w-3 h-3" /> Vector: {item.vectorScore}% × {alpha.toFixed(2)} = +{item.linearBreakdown.vectorComponent}%
                        </span>
                      </div>

                      {/* Decomposed Sub-Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="bg-amber-500 h-2 transition-all duration-500"
                          style={{ width: `${item.linearBreakdown.keywordComponent}%` }}
                          title={`Keyword Contribution: ${item.linearBreakdown.keywordComponent}%`}
                        />
                        <div
                          className="bg-blue-500 h-2 transition-all duration-500"
                          style={{ width: `${item.linearBreakdown.vectorComponent}%` }}
                          title={`Vector Contribution: ${item.linearBreakdown.vectorComponent}%`}
                        />
                      </div>
                    </>
                  )}

                  {hybridMethod === 'rrf' && item.rrfBreakdown && (
                    <>
                      <div className="flex items-center justify-between text-gray-700 font-medium font-mono text-[10px]">
                        <span className="text-amber-700">
                          Key: {item.keywordScore > 0 ? `1/(${rrfK}+${item.keywordRank}) = ${item.rrfBreakdown.keywordRrfScore.toFixed(4)}` : '0.0000 (0% match)'}
                        </span>
                        <span className="text-blue-700">
                          Vec: {item.vectorScore > 10 ? `1/(${rrfK}+${item.vectorRank}) = ${item.rrfBreakdown.vectorRrfScore.toFixed(4)}` : '0.0000'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-200 pt-1 text-[10px] text-gray-500 font-mono">
                        <span>Raw RRF Sum: <strong>{item.rrfBreakdown.rawRrfScore.toFixed(6)}</strong></span>
                        <span className="text-purple-700 font-bold">Normalized: {item.hybridScore}%</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Sub-Ranking Badges */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-500" />
                    Keyword Rank: <strong>{item.keywordScore > 0 ? `#${item.keywordRank}` : 'Unranked (0%)'}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-blue-500" />
                    Vector Rank: <strong>#{item.vectorRank} ({item.vectorScore}%)</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
