'use client';

import React, { useState } from 'react';
import { Search, Layers, Zap, X, Database, HelpCircle, Info } from 'lucide-react';
import { DomainType } from '../lib/types';
import { DOMAIN_CONFIGS } from '../lib/domains';

interface HeaderProps {
  query: string;
  setQuery: (q: string) => void;
  activeDomain: DomainType;
  setActiveDomain: (d: DomainType) => void;
  onOpenDrawer: () => void;
  onOpenTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  query,
  setQuery,
  activeDomain,
  setActiveDomain,
  onOpenDrawer,
  onOpenTour,
}) => {
  const currentConfig = DOMAIN_CONFIGS[activeDomain];
  const [hoveredPrompt, setHoveredPrompt] = useState<string | null>(null);

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col gap-3">

        {/* ── Top Bar: Branding + Domain Switcher + Controls ── */}
        <div className="flex items-center justify-between gap-4">

          {/* Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
              <Search className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 leading-tight truncate">
                Vector vs. Keyword Search
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block truncate">
                Interactive visual comparison — Lexical vs. Semantic retrieval
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Guided Tour Trigger */}
            <button
              onClick={onOpenTour}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
              title="Start Guided Walkthrough"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Guided Tour</span>
            </button>

            {/* Domain Switcher */}
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="domain-select"
                className="text-xs text-gray-500 font-medium hidden sm:flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                Domain
              </label>
              <div className="relative">
                <select
                  id="domain-select"
                  value={activeDomain}
                  onChange={(e) => setActiveDomain(e.target.value as DomainType)}
                  aria-label="Select learning domain"
                  className="appearance-none bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-800 text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition cursor-pointer font-medium"
                >
                  {(Object.keys(DOMAIN_CONFIGS) as DomainType[]).map((key) => (
                    <option key={key} value={key}>
                      {DOMAIN_CONFIGS[key].icon} {DOMAIN_CONFIGS[key].label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="flex flex-col gap-2">
          <div className="relative w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search in ${currentConfig.label} — try "${currentConfig.samplePrompts[0]?.query || ''}"`}
              aria-label="Search query"
              className="w-full bg-white border border-gray-300 focus:border-blue-500 text-gray-900 text-sm rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition placeholder-gray-400 font-normal shadow-xs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                title="Clear query"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Preset Chips with Context-Aware Explanations */}
          <div className="flex flex-wrap items-center gap-1.5 relative">
            <span className="flex items-center gap-1 text-gray-400 text-[11px] font-semibold uppercase tracking-wider mr-0.5">
              <Zap className="w-3 h-3 text-amber-500" />
              Try Prompt:
            </span>
            {currentConfig.samplePrompts.map((promptObj) => {
              const isSelected = query.toLowerCase() === promptObj.query.toLowerCase();
              return (
                <div key={promptObj.query} className="relative group">
                  <button
                    onClick={() => setQuery(promptObj.query)}
                    onMouseEnter={() => setHoveredPrompt(promptObj.query)}
                    onMouseLeave={() => setHoveredPrompt(null)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                        : 'bg-gray-100 border-transparent text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                    }`}
                  >
                    <span>"{promptObj.query}"</span>
                    <Info className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                  </button>

                  {/* Context explanation popover on hover */}
                  {hoveredPrompt === promptObj.query && (
                    <div className="absolute left-0 top-full mt-1.5 z-30 w-64 bg-gray-900 text-white text-xs rounded-lg p-2.5 shadow-xl pointer-events-none animate-fade-in">
                      <p className="font-semibold text-blue-300 mb-0.5">Prompt Goal:</p>
                      <p className="text-[11px] leading-relaxed text-gray-200">
                        {promptObj.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
};
