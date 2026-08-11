'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, BookOpen, Columns } from 'lucide-react';
import { DomainType } from '../lib/types';
import { DOMAIN_CONFIGS } from '../lib/domains';
import { performKeywordSearch } from '../lib/keywordEngine';
import { performVectorSearch } from '../lib/vectorEngine';
import { Header } from '../components/Header';
import { ChallengeBanner } from '../components/ChallengeBanner';
import { KeywordVisualizer } from '../components/KeywordVisualizer';
import { VectorVisualizer } from '../components/VectorVisualizer';
import { ComparisonMatrix } from '../components/ComparisonMatrix';
import { useDocumentStore } from '../lib/useDocumentStore';

type ActiveTab = 'vector' | 'keyword' | 'comparison';

export default function Home() {
  const [activeDomain, setActiveDomain] = useState<DomainType>('animals');
  const [query, setQuery] = useState('speedy dog');
  const [activeTab, setActiveTab] = useState<ActiveTab>('vector');
  const { documents, setDocuments, resetToDefaults } = useDocumentStore(activeDomain);

  // Update query preset on domain change
  useEffect(() => {
    setQuery(DOMAIN_CONFIGS[activeDomain].samplePrompts[0] || '');
  }, [activeDomain]);

  // Compute search results
  const { tokens, activeTokens, filteredStopWords, results: keywordResults } =
    performKeywordSearch(query, documents);

  const { queryVector, queryCoords, results: vectorResults } =
    performVectorSearch(query, documents);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'vector',
      label: 'Semantic Search',
      icon: <Cpu className="w-4 h-4" />,
      color: 'blue',
    },
    {
      id: 'keyword',
      label: 'Keyword Search',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'amber',
    },
    {
      id: 'comparison',
      label: 'Side-by-Side',
      icon: <Columns className="w-4 h-4" />,
      color: 'gray',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 flex flex-col">
      <Header
        query={query}
        setQuery={setQuery}
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-5">

        {/* ── Tab Navigation ── */}
        <nav aria-label="Visualizer tabs">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-auto inline-flex">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const colorMap = {
                blue:  isActive ? 'text-blue-700'  : 'text-gray-500 hover:text-gray-700',
                amber: isActive ? 'text-amber-700' : 'text-gray-500 hover:text-gray-700',
                gray:  isActive ? 'text-gray-800'  : 'text-gray-500 hover:text-gray-700',
              };
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white shadow-sm text-gray-900'
                      : colorMap[tab.color as keyof typeof colorMap]
                  }`}
                >
                  <span className={isActive ? (tab.color === 'blue' ? 'text-blue-600' : tab.color === 'amber' ? 'text-amber-600' : 'text-gray-600') : 'text-gray-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Challenge Strip (below tabs, contextual) ── */}
        <ChallengeBanner
          query={query}
          setQuery={setQuery}
          activeDomain={activeDomain}
          keywordResults={keywordResults}
          vectorResults={vectorResults}
        />

        {/* ── Tab Panels ── */}
        <div className="animate-fade-in-up">
          {activeTab === 'vector' && (
            <div id="panel-vector" role="tabpanel" aria-labelledby="tab-vector">
              <VectorVisualizer
                query={query}
                queryVector={queryVector}
                queryCoords={queryCoords}
                vectorResults={vectorResults}
                activeDomain={activeDomain}
                documents={documents}
              />
            </div>
          )}

          {activeTab === 'keyword' && (
            <div id="panel-keyword" role="tabpanel" aria-labelledby="tab-keyword">
              <KeywordVisualizer
                query={query}
                tokens={tokens}
                activeTokens={activeTokens}
                filteredStopWords={filteredStopWords}
                keywordResults={keywordResults}
                documents={documents}
              />
            </div>
          )}

          {activeTab === 'comparison' && (
            <div id="panel-comparison" role="tabpanel" aria-labelledby="tab-comparison">
              <ComparisonMatrix
                query={query}
                keywordResults={keywordResults}
                vectorResults={vectorResults}
              />
            </div>
          )}
        </div>

      </main>

      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>Vector vs. Keyword Search — Interactive Learning Tool</p>
          <p>100% client-side · No server · No tracking</p>
        </div>
      </footer>
    </div>
  );
}
