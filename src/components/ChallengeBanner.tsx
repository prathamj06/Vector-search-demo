'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, AlertCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { DomainType } from '../lib/types';
import { DOMAIN_CONFIGS } from '../lib/domains';
import { KeywordSearchResult, VectorSearchResult } from '../lib/types';

interface ChallengeBannerProps {
  query: string;
  setQuery: (q: string) => void;
  activeDomain: DomainType;
  keywordResults: KeywordSearchResult[];
  vectorResults: VectorSearchResult[];
}

export const ChallengeBanner: React.FC<ChallengeBannerProps> = ({
  query,
  setQuery,
  activeDomain,
  keywordResults,
  vectorResults,
}) => {
  const currentDomainConfig = DOMAIN_CONFIGS[activeDomain];
  const [unlocked, setUnlocked] = useState(false);
  const [synonymMatch, setSynonymMatch] = useState<{ docTitle: string; vecScore: number; kwScore: number } | null>(null);

  useEffect(() => {
    // Check if there is any document where Keyword Score === 0 AND Vector Score >= 80%
    const found = vectorResults.find(vr => {
      const kw = keywordResults.find(kr => kr.doc.id === vr.doc.id);
      return (kw ? kw.matchScore === 0 : true) && vr.similarity >= 80;
    });

    if (found) {
      const kw = keywordResults.find(kr => kr.doc.id === found.doc.id);
      setSynonymMatch({
        docTitle: found.doc.title,
        vecScore: found.similarity,
        kwScore: kw ? kw.matchScore : 0,
      });

      if (!unlocked) {
        setUnlocked(true);
        // Trigger celebratory confetti animation
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#6366f1', '#10b981', '#f59e0b'],
          });
        } catch {
          // Fallback if canvas-confetti fails
        }
      }
    } else {
      setSynonymMatch(null);
    }
  }, [keywordResults, vectorResults, unlocked]);

  const handleTryPreset = () => {
    setQuery(currentDomainConfig.challenge.targetQuery);
    setUnlocked(false);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-5 ${
      unlocked
        ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
        : 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-indigo-950/40 border-amber-500/30'
    }`}>
      {/* Background glow effects */}
      <div className={`absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
        unlocked ? 'bg-emerald-500/20' : 'bg-amber-500/15'
      }`} />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border shrink-0 ${
            unlocked
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 animate-bounce'
              : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
          }`}>
            {unlocked ? <Trophy className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                unlocked
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950 text-amber-300 border-amber-500/40'
              }`}>
                {unlocked ? '🎉 Challenge Unlocked!' : '🎯 Gamified Challenge'}
              </span>
              <span className="text-xs text-slate-400">Try to Break Keyword Search!</span>
            </div>

            <h3 className="text-base font-semibold text-slate-100">
              {unlocked
                ? `Victory! Semantic Synonym Match Found`
                : `Goal: Type a query where Keyword Search scores 0%, but Vector Search scores >80%!`}
            </h3>

            <p className="text-xs md:text-sm text-slate-300">
              {unlocked && synonymMatch ? (
                <span>
                  Query <strong className="text-cyan-300">"{query}"</strong> matched document{' '}
                  <strong className="text-emerald-300">"{synonymMatch.docTitle}"</strong> with{' '}
                  <span className="text-emerald-400 font-bold">{synonymMatch.vecScore}% Vector Similarity</span> vs.{' '}
                  <span className="text-red-400 font-bold">{synonymMatch.kwScore}% Keyword Match</span>!
                </span>
              ) : (
                <span>{currentDomainConfig.challenge.description}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          {!unlocked ? (
            <button
              onClick={handleTryPreset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-medium text-xs transition cursor-pointer shadow-sm hover:shadow-amber-500/20"
            >
              <span>Auto-Fill Challenge Query</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Keyword Search Defeated!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
