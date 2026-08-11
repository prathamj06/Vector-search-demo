'use client';

import React, { useState } from 'react';
import { Cpu, Target, Compass, Code, Radio, Copy, Check, Info } from 'lucide-react';
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

export const VectorVisualizer: React.FC<VectorVisualizerProps> = ({
  query,
  queryVector,
  queryCoords,
  vectorResults,
  activeDomain,
}) => {
  const currentDomainConfig: DomainConfig = DOMAIN_CONFIGS[activeDomain as keyof typeof DOMAIN_CONFIGS] || DOMAIN_CONFIGS.animals;
  const [hoveredNode, setHoveredNode] = useState<{ id: string; title: string; score: number; coords: { x: number; y: number } } | null>(null);
  const [selectedResultDoc, setSelectedResultDoc] = useState<VectorSearchResult>(vectorResults[0] || null);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [topK, setTopK] = useState(3);

  // Sync top result selection if search results change
  const activeSelectedDoc = selectedResultDoc && vectorResults.some(r => r.doc.id === selectedResultDoc.doc.id)
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
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Vector (Semantic) Search Visualizer
            </h2>
            <p className="text-xs text-slate-400">
              5-Stage Exposure: Text-to-Vector $\to$ Concept Weights $\to$ 2D Spatial Plot $\to$ Laser Distance Scan $\to$ Vector DB JSON
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Top-K Proximity Filter:</span>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-cyan-300 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none"
          >
            <option value={1}>Top 1 Nearest</option>
            <option value={2}>Top 2 Nearest</option>
            <option value={3}>Top 3 Nearest</option>
            <option value={5}>Top 5 Nearest</option>
          </select>
        </div>
      </div>

      {/* STAGE 1 & STAGE 2 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* STAGE 1: TEXT-TO-VECTOR MAPPING */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-[10px] font-bold">1</span>
              Stage 1: Text-to-Vector Mapping
            </span>
            <span className="text-[11px] text-cyan-300 font-mono">Dense 4D Vector</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold">Active Query Text:</span>
              <p className="text-sm font-bold text-cyan-300">"{query || 'Type a prompt...'}"</p>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-cyan-300">Normalized 4-Dimensional Array:</span>
                <span className="text-[10px] font-mono text-cyan-400">L2 Normalized</span>
              </div>
              <div className="flex flex-wrap gap-2 font-mono">
                {queryVector.map((val, idx) => (
                  <div key={idx} className="flex-1 min-w-[70px] bg-slate-900 border border-cyan-500/40 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-slate-400 truncate">{currentDomainConfig.dimensions[idx]}</div>
                    <div className="text-sm font-bold text-cyan-200 mt-0.5">{val > 0 ? `+${val}` : val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 2: INSPECT THE BRAIN CATEGORY RADAR */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-[10px] font-bold">2</span>
              Stage 2: "Inspect the Brain" Concept Weights
            </span>
            <span className="text-[11px] text-indigo-300">Concept Spectrum</span>
          </div>

          <div className="space-y-3">
            {currentDomainConfig.dimensions.map((dimLabel, idx) => {
              const weightVal = queryVector[idx] || 0;
              const barPercent = Math.max(0, Math.min(100, Math.round(weightVal * 100)));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{dimLabel}</span>
                    <span className="font-mono text-indigo-300 font-bold">{barPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* STAGE 3 & STAGE 4: 2D SPATIAL CANVAS GRID & LASER PROXIMITY SCAN */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Stages 3 & 4: 2D Spatial Coordinate Plot & Laser Proximity Ring</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pulsating cyan query target node + document nodes connected by laser distance vectors
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="text-cyan-300 font-semibold">Query Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-indigo-300 font-semibold">Corpus Docs</span>
            </div>
          </div>
        </div>

        {/* Educational Projection Note */}
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Educational Note:</strong> Squeezing multi-dimensional vectors onto a 2D screen works like a 3D shadow on a flat wall—it preserves relative concept distances while fitting on screen!
          </span>
        </div>

        {/* SPATIAL SVG CANVAS PLOT */}
        <div className="relative w-full h-80 sm:h-96 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden select-none">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* SVG Overlay for Laser lines & Scanning Rings */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Pulsating Expanding Proximity Laser Rings */}
            <circle
              cx={`${queryCoords.x}%`}
              cy={`${queryCoords.y}%`}
              r="40"
              className="fill-cyan-500/5 stroke-cyan-400/40 stroke-dashed animate-pulse"
              strokeDasharray="4 2"
            />
            <circle
              cx={`${queryCoords.x}%`}
              cy={`${queryCoords.y}%`}
              r="85"
              className="fill-cyan-500/5 stroke-cyan-500/20 stroke-dashed"
              strokeDasharray="6 3"
            />

            {/* Laser Lines from Query Node to Top-K Document Nodes */}
            {vectorResults.slice(0, topK).map((res) => (
              <g key={`laser-${res.doc.id}`}>
                <line
                  x1={`${queryCoords.x}%`}
                  y1={`${queryCoords.y}%`}
                  x2={`${res.doc.coords.x}%`}
                  y2={`${res.doc.coords.y}%`}
                  className="stroke-cyan-400/80 stroke-2"
                  strokeDasharray="4 4"
                />
              </g>
            ))}
          </svg>

          {/* DOCUMENT NODES */}
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
                style={{
                  left: `${res.doc.coords.x}%`,
                  top: `${res.doc.coords.y}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 group ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                }`}
              >
                {/* Node Marker Circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border transition-all ${
                    res.doc.isCustom
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-emerald-500/50'
                      : isTopK
                      ? 'bg-indigo-500 border-cyan-300 text-white shadow-indigo-500/50'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}
                >
                  #{res.rank}
                </div>

                {/* Similarity Badge Tag */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-md border ${
                    isTopK
                      ? 'bg-indigo-950/90 text-cyan-300 border-indigo-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {res.similarity}%
                </div>
              </div>
            );
          })}

          {/* QUERY TARGET NODE */}
          <div
            style={{
              left: `${queryCoords.x}%`,
              top: `${queryCoords.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-10 h-10 rounded-full bg-cyan-400/30 animate-ping" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 border-2 border-white flex items-center justify-center shadow-xl shadow-cyan-500/60">
                <Target className="w-4 h-4 text-slate-950 animate-spin-slow" />
              </div>
            </div>
            <div className="mt-1.5 px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-200 border border-cyan-400/50 text-[10px] font-bold text-center whitespace-nowrap shadow-lg">
              🎯 Query Vector
            </div>
          </div>

          {/* Interactive Tooltip on Hover */}
          {hoveredNode && (
            <div
              style={{
                left: `${hoveredNode.coords.x}%`,
                top: `${hoveredNode.coords.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-16 bg-slate-900 border border-cyan-500/50 text-slate-100 rounded-lg p-2 text-xs shadow-xl z-40 pointer-events-none whitespace-nowrap"
            >
              <div className="font-bold text-cyan-300">{hoveredNode.title}</div>
              <div className="text-[10px] text-slate-400">
                Cosine Similarity: <span className="text-emerald-400 font-bold">{hoveredNode.score}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STAGE 5: RAW VECTOR DB PAYLOAD INSPECTOR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-[10px] font-bold">5</span>
            Stage 5: Raw Vector Database Payload Inspector
          </span>

          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer border border-slate-700"
          >
            {copiedJSON ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedJSON ? 'Copied Payload!' : 'Copy JSON'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Document Selector Pills */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Record to Inspect:
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {vectorResults.map((res) => {
                const isSelected = activeSelectedDoc?.doc.id === res.doc.id;
                return (
                  <button
                    key={res.doc.id}
                    onClick={() => setSelectedResultDoc(res)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200 font-bold shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate pr-2">#{res.rank} {res.doc.title}</span>
                    <span className={`font-mono text-[10px] font-bold ${res.similarity >= 80 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {res.similarity}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* JSON Inspector Viewport */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] pb-1 border-b border-slate-900">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vector Database Record Payload (Document ID: {activeSelectedDoc?.doc.id})</span>
            </div>

            {activeSelectedDoc ? (
              <pre className="text-[11px] leading-relaxed">
{JSON.stringify(
  {
    id: activeSelectedDoc.doc.id,
    similarity_score: `${activeSelectedDoc.similarity}%`,
    cosine_similarity_raw: Number((activeSelectedDoc.similarity / 100).toFixed(4)),
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
              <div className="text-slate-600">Select a result to inspect...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
