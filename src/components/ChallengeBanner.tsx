'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Target, CheckCircle2, ArrowRight } from 'lucide-react';
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
  const [synonymMatch, setSynonymMatch] = useState<{
    docTitle: string;
    vecScore: number;
    kwScore: number;
  } | null>(null);

  useEffect(() => {
    const found = vectorResults.find((vr) => {
      const kw = keywordResults.find((kr) => kr.doc.id === vr.doc.id);
      return (kw ? kw.matchScore === 0 : true) && vr.similarity >= 80;
    });

    if (found) {
      const kw = keywordResults.find((kr) => kr.doc.id === found.doc.id);
      setSynonymMatch({
        docTitle: found.doc.title,
        vecScore: found.similarity,
        kwScore: kw ? kw.matchScore : 0,
      });
      if (!unlocked) {
        setUnlocked(true);
        try {
          confetti({
            particleCount: 90,
            spread: 72,
            origin: { y: 0.55 },
            colors: ['#2563EB', '#059669', '#D97706', '#7C3AED'],
          });
        } catch { /* fallback */ }
      }
    } else {
      setSynonymMatch(null);
    }
  }, [keywordResults, vectorResults, unlocked]);

  const handleTryPreset = () => {
    setQuery(currentDomainConfig.challenge.targetQuery);
    setUnlocked(false);
  };

  if (unlocked && synonymMatch) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-fade-in"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 border border-green-300 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">
              Challenge unlocked — Semantic synonym match found!
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              Query{' '}
              <strong className="font-semibold">"{query}"</strong> matched{' '}
              <strong className="font-semibold">"{synonymMatch.docTitle}"</strong> at{' '}
              <span className="font-bold text-green-600">{synonymMatch.vecScore}% vector</span> vs.{' '}
              <span className="font-bold text-red-500">{synonymMatch.kwScore}% keyword</span>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs font-semibold text-green-700">Keyword Search Defeated!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center">
          <Target className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Challenge: find a query where Keyword scores 0% but Vector scores &gt;80%
          </p>
          <p className="text-xs text-amber-700 mt-0.5">{currentDomainConfig.challenge.description}</p>
        </div>
      </div>
      <button
        onClick={handleTryPreset}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:border-amber-400 hover:bg-amber-50 text-amber-700 font-medium text-xs transition-colors cursor-pointer flex-shrink-0 self-start sm:self-center"
      >
        <span>Auto-fill</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
