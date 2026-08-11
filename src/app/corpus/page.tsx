'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, Search, BookOpen, Cpu } from 'lucide-react';
import { DomainType } from '../../lib/types';
import { DOMAIN_CONFIGS } from '../../lib/domains';
import { CorpusManager } from '../../components/CorpusManager';
import { useDocumentStore } from '../../lib/useDocumentStore';

export default function CorpusPage() {
  const [activeDomain, setActiveDomain] = useState<DomainType>('animals');
  const { documents, setDocuments, resetToDefaults } = useDocumentStore(activeDomain);

  // Sync domain from localStorage if set
  useEffect(() => {
    // No-op; domain defaults to animals — user can switch it here
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 flex flex-col">

      {/* ── Page Header ── */}
      <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Back to search demo"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Dataset Portal</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Corpus Manager — Live Dataset</p>
              </div>
            </div>
          </div>

          {/* Domain switcher */}
          <div className="flex items-center gap-2">
            <label htmlFor="corpus-domain-select" className="text-xs text-gray-500 font-medium hidden sm:block">
              Domain:
            </label>
            <div className="relative">
              <select
                id="corpus-domain-select"
                value={activeDomain}
                onChange={(e) => setActiveDomain(e.target.value as DomainType)}
                className="appearance-none bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-800 text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition cursor-pointer font-medium"
              >
                {(Object.keys(DOMAIN_CONFIGS) as DomainType[]).map((key) => (
                  <option key={key} value={key}>
                    {DOMAIN_CONFIGS[key].icon} {DOMAIN_CONFIGS[key].label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* ── Explainer Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-800">What is the Corpus?</h2>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              The corpus is the collection of documents that both search engines query against. Think of it as your in-browser vector database.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-800">Keyword Search Effect</h2>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Adding documents with different words for the same concept will highlight keyword search's synonym blind spot — it can't match what it can't see.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-800">Vector Search Effect</h2>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Each document you add gets embedded into a 4D vector and plotted in concept space. Vector search will find it by semantic similarity, not word overlap.
            </p>
          </div>
        </div>

        {/* ── Corpus Manager ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-6">
          <CorpusManager
            documents={documents}
            setDocuments={setDocuments}
            activeDomain={activeDomain}
            resetToDefaults={resetToDefaults}
          />
        </div>

        {/* ── Return CTA ── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-800">Ready to see your changes in action?</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Documents are auto-saved. Switch back to the demo and your corpus will be updated instantly.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            Return to Search Demo
          </Link>
        </div>

      </main>

      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 text-xs text-gray-400 text-center">
          Dataset Portal — Vector vs. Keyword Search Demo · All data stored in browser memory only
        </div>
      </footer>

    </div>
  );
}
