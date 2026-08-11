'use client';

import React from 'react';
import { Search, Sparkles, Layers, Zap, X } from 'lucide-react';
import { DomainType } from '../lib/types';
import { DOMAIN_CONFIGS } from '../lib/domains';

interface HeaderProps {
  query: string;
  setQuery: (q: string) => void;
  activeDomain: DomainType;
  setActiveDomain: (d: DomainType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  query,
  setQuery,
  activeDomain,
  setActiveDomain,
}) => {
  const currentConfig = DOMAIN_CONFIGS[activeDomain];

  return (
    <header className="relative w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Top Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  Vector vs. Keyword Search
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  Interactive AI Workshop
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400">
                Step-by-step visual comparison between Lexical (Exact Match) & Semantic (Vector Embedding) Search
              </p>
            </div>
          </div>

          {/* Domain Switcher Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium">Domain:</span>
            <div className="relative">
              <select
                value={activeDomain}
                onChange={(e) => setActiveDomain(e.target.value as DomainType)}
                aria-label="Select Domain"
                className="appearance-none bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-sm rounded-lg px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition cursor-pointer font-medium"
              >
                {(Object.keys(DOMAIN_CONFIGS) as DomainType[]).map((key) => (
                  <option key={key} value={key} className="bg-slate-900 text-slate-200">
                    {DOMAIN_CONFIGS[key].icon} {DOMAIN_CONFIGS[key].label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Main Search Input & Presets Bar */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search in ${currentConfig.label} (e.g. "${currentConfig.samplePrompts[0]}")...`}
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 text-slate-100 text-base rounded-xl pl-12 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition shadow-inner placeholder-slate-500 font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Prompt Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <Zap className="w-3 h-3 text-amber-400" /> Presets:
            </span>
            {currentConfig.samplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setQuery(prompt)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                  query.toLowerCase() === prompt.toLowerCase()
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400'
                }`}
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
