'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Cpu, Columns, Sparkles, Layers } from 'lucide-react';
import { DomainType, Document } from '../lib/types';
import { DOMAIN_CONFIGS } from '../lib/domains';
import { performKeywordSearch } from '../lib/keywordEngine';
import { performVectorSearch } from '../lib/vectorEngine';
import { Header } from '../components/Header';
import { ChallengeBanner } from '../components/ChallengeBanner';
import { CorpusManager } from '../components/CorpusManager';
import { KeywordVisualizer } from '../components/KeywordVisualizer';
import { VectorVisualizer } from '../components/VectorVisualizer';
import { ComparisonMatrix } from '../components/ComparisonMatrix';

export default function Home() {
  const [activeDomain, setActiveDomain] = useState<DomainType>('animals');
  const [query, setQuery] = useState('speedy dog');
  const [activeTab, setActiveTab] = useState<'keyword' | 'vector' | 'comparison'>('vector');
  const [documents, setDocuments] = useState<Document[]>(DOMAIN_CONFIGS.animals.defaultDocs);

  // When domain changes, load default dataset and preset query
  useEffect(() => {
    const config = DOMAIN_CONFIGS[activeDomain];
    setDocuments(config.defaultDocs);
    setQuery(config.samplePrompts[0] || '');
  }, [activeDomain]);

  const resetToDefaults = () => {
    setDocuments(DOMAIN_CONFIGS[activeDomain].defaultDocs);
  };

  // Perform real-time lexical & semantic search calculations inside client browser memory
  const { tokens, activeTokens, filteredStopWords, results: keywordResults } = performKeywordSearch(
    query,
    documents
  );

  const { queryVector, queryCoords, results: vectorResults } = performVectorSearch(
    query,
    documents
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 pb-16">
      {/* Top Main Navigation Header */}
      <Header
        query={query}
        setQuery={setQuery}
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
      />

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Gamified Challenge Banner */}
        <ChallengeBanner
          query={query}
          setQuery={setQuery}
          activeDomain={activeDomain}
          keywordResults={keywordResults}
          vectorResults={vectorResults}
        />

        {/* Live Corpus Manager (In-Memory DB Portal) */}
        <CorpusManager
          documents={documents}
          setDocuments={setDocuments}
          activeDomain={activeDomain}
          resetToDefaults={resetToDefaults}
        />

        {/* NAVIGATION TABS FOR VISUALIZERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-xl">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('vector')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'vector'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Vector (Semantic) Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab('keyword')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'keyword'
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Keyword (Lexical) Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-slate-800 border border-slate-600 text-slate-100 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Columns className="w-4 h-4 text-indigo-400" />
              <span>Side-by-Side Matrix</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pr-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>100% Client-Side In-Memory Engine</span>
          </div>
        </div>

        {/* TAB 1: KEYWORD VISUALIZER */}
        {activeTab === 'keyword' && (
          <KeywordVisualizer
            query={query}
            tokens={tokens}
            activeTokens={activeTokens}
            filteredStopWords={filteredStopWords}
            keywordResults={keywordResults}
            documents={documents}
          />
        )}

        {/* TAB 2: VECTOR VISUALIZER (5-STAGE) */}
        {activeTab === 'vector' && (
          <VectorVisualizer
            query={query}
            queryVector={queryVector}
            queryCoords={queryCoords}
            vectorResults={vectorResults}
            activeDomain={activeDomain}
            documents={documents}
          />
        )}

        {/* TAB 3: SIDE-BY-SIDE MATRIX */}
        {activeTab === 'comparison' && (
          <ComparisonMatrix
            query={query}
            keywordResults={keywordResults}
            vectorResults={vectorResults}
          />
        )}

      </main>

      {/* Footer Branding */}
      <footer className="mt-12 border-t border-slate-900 text-center py-6 text-xs text-slate-500">
        <p>Built for Next.js + Tailwind CSS Workshops • Vercel Free-Tier Ready (100% In-Browser State)</p>
      </footer>
    </div>
  );
}
