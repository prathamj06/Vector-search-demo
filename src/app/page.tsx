'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, BookOpen, Columns, Database, Sparkles } from 'lucide-react';
import { DomainType, HybridMethod } from '../lib/types';
import { DOMAIN_CONFIGS } from '../lib/domains';
import { performKeywordSearch } from '../lib/keywordEngine';
import { performVectorSearch } from '../lib/vectorEngine';
import { performHybridSearch } from '../lib/hybridEngine';
import { Header } from '../components/Header';
import { ChallengeBanner } from '../components/ChallengeBanner';
import { KeywordVisualizer } from '../components/KeywordVisualizer';
import { VectorVisualizer } from '../components/VectorVisualizer';
import { HybridVisualizer } from '../components/HybridVisualizer';
import { ComparisonMatrix } from '../components/ComparisonMatrix';
import { CorpusDrawer } from '../components/CorpusDrawer';
import { OnboardingModal } from '../components/OnboardingModal';
import { useDocumentStore } from '../lib/useDocumentStore';

type ActiveTab = 'vector' | 'keyword' | 'hybrid' | 'comparison';

export default function Home() {
  const [activeDomain, setActiveDomain] = useState<DomainType>('animals');
  const [query, setQuery] = useState<string>(''); // Default empty to encourage independent exploration
  const [activeTab, setActiveTab] = useState<ActiveTab>('vector');
  const [hybridMethod, setHybridMethod] = useState<HybridMethod>('linear');
  const [alpha, setAlpha] = useState<number>(0.5);
  const [rrfK, setRrfK] = useState<number>(60);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const { documents, setDocuments, resetToDefaults } = useDocumentStore(activeDomain);

  // Auto-open onboarding tour on first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenTour = localStorage.getItem('vsd-seen-tour-v1');
      if (!hasSeenTour) {
        setIsTourOpen(true);
        localStorage.setItem('vsd-seen-tour-v1', 'true');
      }
    }
  }, []);

  // Compute search results against active dataset
  const { tokens, activeTokens, filteredStopWords, results: keywordResults } =
    performKeywordSearch(query, documents);

  const { queryVector, queryCoords, results: vectorResults } =
    performVectorSearch(query, documents);

  const hybridResults = performHybridSearch(
    keywordResults,
    vectorResults,
    hybridMethod,
    alpha,
    rrfK
  );

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
      id: 'hybrid',
      label: 'Hybrid Search',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'purple',
    },
    {
      id: 'comparison',
      label: 'Side-by-Side',
      icon: <Columns className="w-4 h-4" />,
      color: 'gray',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 flex flex-col relative">

      {/* Floating Side Tab Trigger for Database Portal Drawer */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed right-0 top-1/3 z-30 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-3 rounded-l-xl shadow-lg flex items-center gap-1.5 transition-transform hover:-translate-x-1 cursor-pointer"
        title="Open Database Portal Drawer"
      >
        <Database className="w-4 h-4" />
        <span className="hidden md:inline">Database Portal</span>
      </button>

      {/* Header Bar */}
      <Header
        query={query}
        setQuery={setQuery}
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onSelectPrompt={(p) => setQuery(p)}
      />

      {/* Slide-out Database Portal Drawer */}
      <CorpusDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        documents={documents}
        setDocuments={setDocuments}
        activeDomain={activeDomain}
        resetToDefaults={resetToDefaults}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-5">

        {/* ── Control Bar: Tab Navigation + Dataset Complexity Control ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Navigation */}
          <nav aria-label="Visualizer tabs">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-auto inline-flex">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const colorMap = {
                  blue:   isActive ? 'text-blue-700'   : 'text-gray-500 hover:text-gray-700',
                  amber:  isActive ? 'text-amber-700'  : 'text-gray-500 hover:text-gray-700',
                  purple: isActive ? 'text-purple-700' : 'text-gray-500 hover:text-gray-700',
                  gray:   isActive ? 'text-gray-800'   : 'text-gray-500 hover:text-gray-700',
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
                        ? 'bg-white shadow-xs text-gray-900'
                        : colorMap[tab.color as keyof typeof colorMap]
                    }`}
                  >
                    <span className={isActive ? (tab.color === 'blue' ? 'text-blue-600' : tab.color === 'amber' ? 'text-amber-600' : tab.color === 'purple' ? 'text-purple-600' : 'text-gray-600') : 'text-gray-400'}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* ── Challenge Strip (contextual) ── */}
        <ChallengeBanner
          query={query}
          setQuery={setQuery}
          activeDomain={activeDomain}
          keywordResults={keywordResults}
          vectorResults={vectorResults}
        />

        {/* ── Active Tab Panel ── */}
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

          {activeTab === 'hybrid' && (
            <div id="panel-hybrid" role="tabpanel" aria-labelledby="tab-hybrid">
              <HybridVisualizer
                query={query}
                hybridResults={hybridResults}
                keywordResults={keywordResults}
                vectorResults={vectorResults}
                hybridMethod={hybridMethod}
                setHybridMethod={setHybridMethod}
                alpha={alpha}
                setAlpha={setAlpha}
                rrfK={rrfK}
                setRrfK={setRrfK}
                activeDomain={activeDomain}
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
          <p>Vector vs. Keyword Search — Interactive Educational Tool</p>
          <p>100% client-side in-browser memory engine</p>
        </div>
      </footer>
    </div>
  );
}
