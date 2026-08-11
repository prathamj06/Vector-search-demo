'use client';

import React, { useState } from 'react';
import { Cpu, Target, Compass, Code, Copy, Check, Info } from 'lucide-react';
import { Document, DomainConfig, VectorSearchResult } from '../lib/types';
import { DOMAIN_CONFIGS } from '../lib/domains';

interface VectorVisualizerProps {
  query: string;
  queryVector: number[];
  queryCoords: { x: number; y: number };
  vectorResults: VectorSearchResult[];
  activeDomain: string;
  documents: Document[];
}

// Reusable step badge
const StepBadge: React.FC<{ n: number; color: 'blue' | 'indigo' | 'violet' | 'green' | 'teal' }> = ({ n, color }) => {
  const colors = {
    blue:   'bg-blue-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    violet: 'bg-violet-600 text-white',
    green:  'bg-green-600 text-white',
    teal:   'bg-teal-600 text-white',
  };
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold flex-shrink-0 ${colors[color]}`}>
      {n}
    </span>
  );
};

// Reusable card with left accent
const StageCard: React.FC<{ children: React.ReactNode; accent: 'blue' | 'indigo' | 'violet' | 'green' | 'teal' }> = ({ children, accent }) => {
  const borders = {
    blue:   'border-l-blue-500',
    indigo: 'border-l-indigo-500',
    violet: 'border-l-violet-500',
    green:  'border-l-green-500',
    teal:   'border-l-teal-500',
  };
  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${borders[accent]} rounded-xl shadow-sm overflow-hidden`}>
      {children}
    </div>
  );
};

export const VectorVisualizer: React.FC<VectorVisualizerProps> = ({
  query,
  queryVector,
  queryCoords,
  vectorResults,
  activeDomain,
}) => {
  const currentDomainConfig: DomainConfig =
    DOMAIN_CONFIGS[activeDomain as keyof typeof DOMAIN_CONFIGS] || DOMAIN_CONFIGS.animals;

  const [hoveredNode, setHoveredNode] = useState<{
    id: string;
    title: string;
    score: number;
    coords: { x: number; y: number };
  } | null>(null);
  const [selectedResultDoc, setSelectedResultDoc] = useState<VectorSearchResult>(
    vectorResults[0] || null
  );
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [topK, setTopK] = useState(3);

  const activeSelectedDoc =
    selectedResultDoc && vectorResults.some((r) => r.doc.id === selectedResultDoc.doc.id)
      ? selectedResultDoc
      : vectorResults[0];

  const handleCopyJSON = () => {
    if (!activeSelectedDoc) return;
    const payload = JSON.stringify(
      {
        id: activeSelectedDoc.doc.id,
        score: `${activeSelectedDoc.similarity}%`,
        cosine_similarity: (activeSelectedDoc.similarity / 100).toFixed(4),
        vector_4d: activeSelectedDoc.doc.vector,
        metadata: {
          title: activeSelectedDoc.doc.title,
          content: activeSelectedDoc.doc.content,
          domain: activeSelectedDoc.doc.domain,
        },
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">

      {/* ── Module Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Vector (Semantic) Search</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              5 stages: Text → Vector → Concept Weights → 2D Plot → Proximity Ranking → DB Record
            </p>
          </div>
        </div>
        {/* Top-K Control */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
          <label htmlFor="topk-select" className="text-xs text-gray-500 font-medium">
            Top-K filter:
          </label>
          <select
            id="topk-select"
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value={1}>Top 1</option>
            <option value={2}>Top 2</option>
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
          </select>
        </div>
      </div>

      {/* ── Stages 1 & 2 Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* STAGE 1 — Text-to-Vector Mapping */}
        <StageCard accent="blue">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <StepBadge n={1} color="blue" />
              Text → Vector Mapping
            </span>
            <span className="text-[11px] text-blue-600 font-mono font-medium">Dense 4D</span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3.5 py-3 space-y-1">
              <span className="text-[11px] text-gray-400 font-medium">Active query</span>
              <p className="text-sm font-semibold text-gray-900">"{query || 'Type a prompt…'}"</p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-3.5 py-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-700">L2-Normalized Vector</span>
                <span className="text-[10px] font-mono text-blue-500">4 dimensions</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono">
                {queryVector.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-0.5 bg-white border border-blue-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-[10px] text-gray-400 truncate">
                      {currentDomainConfig.dimensions[idx]}
                    </span>
                    <span className={`text-sm font-bold ${val >= 0 ? 'text-blue-700' : 'text-indigo-600'}`}>
                      {val > 0 ? `+${val}` : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StageCard>

        {/* STAGE 2 — Concept Weight Radar */}
        <StageCard accent="indigo">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <StepBadge n={2} color="indigo" />
              Concept Weights
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">Inspect the brain</span>
          </div>
          <div className="px-5 py-4 space-y-3">
            {currentDomainConfig.dimensions.map((dimLabel, idx) => {
              const weightVal = queryVector[idx] || 0;
              const barPercent = Math.max(0, Math.min(100, Math.round(weightVal * 100)));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700">{dimLabel}</span>
                    <span className="font-mono font-semibold text-indigo-600">{barPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </StageCard>

      </div>

      {/* ── Stages 3 & 4 — 2D Spatial Canvas ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center flex-shrink-0">
              <Compass className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                <span className="mr-1">
                  <StepBadge n={3} color="violet" />
                </span>
                <span className="ml-1">2D Spatial Plot &</span>
                <span className="ml-1">
                  <StepBadge n={4} color="violet" />
                </span>
                <span className="ml-1">Proximity Scan</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-blue-200 flex-shrink-0" />
              <span className="text-gray-500">Query</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" />
              <span className="text-gray-500">Top-K matches</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="text-gray-400">Other docs</span>
            </div>
          </div>
        </div>

        {/* Educational Note */}
        <div className="mx-5 mt-4 px-3.5 py-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2 text-xs text-blue-700">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Educational note:</strong> Multi-dimensional vectors are projected onto 2D, like a 3D shadow on a flat wall — relative distances between concepts are preserved.
          </span>
        </div>

        {/* SVG Canvas */}
        <div className="relative w-full h-80 sm:h-96 mx-auto bg-gray-50 m-4 rounded-xl border border-gray-200 overflow-hidden select-none" style={{ width: 'calc(100% - 2rem)' }}>
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* SVG: lines and rings */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Proximity circle */}
            <circle
              cx={`${queryCoords.x}%`}
              cy={`${queryCoords.y}%`}
              r="60"
              fill="rgba(37,99,235,0.04)"
              stroke="rgba(37,99,235,0.2)"
              strokeWidth="1"
              strokeDasharray="6 3"
            />
            {/* Laser lines to Top-K */}
            {vectorResults.slice(0, topK).map((res) => (
              <line
                key={`line-${res.doc.id}`}
                x1={`${queryCoords.x}%`}
                y1={`${queryCoords.y}%`}
                x2={`${res.doc.coords.x}%`}
                y2={`${res.doc.coords.y}%`}
                stroke="rgba(99,102,241,0.5)"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
            ))}
          </svg>

          {/* Document nodes */}
          {vectorResults.map((res) => {
            const isTopK = res.rank <= topK;
            const isSelected = activeSelectedDoc?.doc.id === res.doc.id;
            return (
              <div
                key={res.doc.id}
                onClick={() => setSelectedResultDoc(res)}
                onMouseEnter={() =>
                  setHoveredNode({
                    id: res.doc.id,
                    title: res.doc.title,
                    score: res.similarity,
                    coords: res.doc.coords,
                  })
                }
                onMouseLeave={() => setHoveredNode(null)}
                style={{ left: `${res.doc.coords.x}%`, top: `${res.doc.coords.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 z-10 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md border-2 transition-all ${
                    res.doc.isCustom
                      ? 'bg-green-500 border-green-200 text-white shadow-green-200'
                      : isTopK
                      ? 'bg-indigo-600 border-indigo-200 text-white shadow-indigo-200'
                      : 'bg-white border-gray-300 text-gray-500 shadow-gray-100'
                  }`}
                >
                  {res.rank}
                </div>
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold whitespace-nowrap border ${
                    isTopK
                      ? 'bg-white text-indigo-600 border-indigo-200 shadow-sm'
                      : 'bg-white text-gray-400 border-gray-200'
                  }`}
                >
                  {res.similarity}%
                </div>
              </div>
            );
          })}

          {/* Query node */}
          <div
            style={{ left: `${queryCoords.x}%`, top: `${queryCoords.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-white shadow-lg shadow-blue-200 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-white border border-blue-700 text-[10px] font-bold text-center whitespace-nowrap shadow-md">
              Query
            </div>
          </div>

          {/* Hover tooltip */}
          {hoveredNode && (
            <div
              style={{ left: `${hoveredNode.coords.x}%`, top: `${hoveredNode.coords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-full -mt-3 bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2 text-xs shadow-lg z-40 pointer-events-none whitespace-nowrap"
            >
              <div className="font-semibold text-gray-900">{hoveredNode.title}</div>
              <div className="text-gray-500 mt-0.5">
                Similarity:{' '}
                <span className={`font-bold ${hoveredNode.score >= 80 ? 'text-green-600' : 'text-indigo-600'}`}>
                  {hoveredNode.score}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>

      {/* ── Stage 5 — Vector DB Payload Inspector ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            <StepBadge n={5} color="green" />
            Vector DB Payload Inspector
          </span>
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-colors cursor-pointer border border-gray-200"
          >
            {copiedJSON ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedJSON ? 'Copied!' : 'Copy JSON'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Record selector */}
          <div className="px-5 py-4 space-y-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Select record:
            </span>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {vectorResults.map((res) => {
                const isSelected = activeSelectedDoc?.doc.id === res.doc.id;
                return (
                  <button
                    key={res.doc.id}
                    onClick={() => setSelectedResultDoc(res)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate font-medium">
                      #{res.rank} {res.doc.title}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold flex-shrink-0 ${
                        isSelected
                          ? 'text-blue-200'
                          : res.similarity >= 80
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {res.similarity}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* JSON viewport */}
          <div className="lg:col-span-2 bg-gray-950 rounded-br-xl rounded-bl-xl lg:rounded-bl-none lg:rounded-tr-xl px-5 py-4">
            <div className="flex items-center gap-2 text-gray-500 text-[10px] pb-2 border-b border-gray-800 mb-3">
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono">
                vector_db_record · id: {activeSelectedDoc?.doc.id}
              </span>
            </div>
            {activeSelectedDoc ? (
              <pre className="text-[12px] leading-relaxed text-emerald-400 font-mono overflow-x-auto">
                {JSON.stringify(
                  {
                    id: activeSelectedDoc.doc.id,
                    similarity_score: `${activeSelectedDoc.similarity}%`,
                    cosine_similarity_raw: Number(
                      (activeSelectedDoc.similarity / 100).toFixed(4)
                    ),
                    spatial_2d_coords: activeSelectedDoc.doc.coords,
                    dense_vector_4d: activeSelectedDoc.doc.vector,
                    payload: {
                      title: activeSelectedDoc.doc.title,
                      content: activeSelectedDoc.doc.content,
                      domain: activeSelectedDoc.doc.domain,
                      is_custom: !!activeSelectedDoc.doc.isCustom,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            ) : (
              <div className="text-gray-600 text-xs">Select a record to inspect…</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
