'use client';

import React, { useState } from 'react';
import { Cpu, Target, Compass, Code, Copy, Check, Info, Radio, AlertTriangle, Star } from 'lucide-react';
import { Document, DomainConfig, VectorSearchResult, ConceptInfo } from '../lib/types';
import { DOMAIN_CONFIGS } from '../lib/domains';
import { ConceptInfoModal } from './ConceptInfoModal';

interface VectorVisualizerProps {
  query: string;
  queryVector: number[];
  queryCoords: { x: number; y: number };
  vectorResults: VectorSearchResult[];
  activeDomain: string;
  documents: Document[];
}

const VECTOR_CONCEPT_INFOS: Record<number, ConceptInfo> = {
  1: {
    title: 'Stage 1: Text-to-Vector Embedding',
    subtitle: 'Translating text into dense mathematical arrays',
    whatItIs:
      'An embedding model analyzes your query string and converts it into a normalized 4-dimensional numerical array. Each number represents a position along a semantic axis.',
    whyItMatters:
      'Computers cannot naturally understand words like "canine" or "speed". Converting text to numbers enables mathematical similarity calculations.',
    keywordVsVector:
      'Keyword search matches literal text string characters ("dog" == "dog"). Vector search converts text into geometric coordinates in concept space.',
  },
  2: {
    title: 'Stage 2: Concept Weights ("Inspect the Brain")',
    subtitle: 'Deconstructing query meaning across domain dimensions',
    whatItIs:
      'Shows the percentage activation of your query across domain concepts (e.g. Canine, Speed, Food, Rest). Values range from 0% to 100%.',
    whyItMatters:
      'Lets you inspect how the AI model interprets the conceptual emphasis of your input prompt.',
    keywordVsVector:
      'Keywords check binary word presence (yes/no). Vector weights measure gradations of meaning across multiple dimensions simultaneously.',
  },
  3: {
    title: 'Stage 3: 2D Spatial Coordinate Projection',
    subtitle: 'Mapping multi-dimensional vectors onto a visual 2D plane',
    whatItIs:
      'High-dimensional vectors (4D) are projected onto a 2D coordinate grid (X, Y) using dimensionality reduction, preserving relative concept distances.',
    whyItMatters:
      'Allows human eyes to visually grasp how concepts cluster together spatially on a 2D canvas.',
    keywordVsVector:
      'Keyword search has no spatial representation. Vector search places semantically related items close to each other on a map.',
  },
  4: {
    title: 'Stage 4: Laser Proximity Scan & Similarity Metrics',
    subtitle: 'Scanning nearest neighbors using Cosine Similarity and Euclidean Distance',
    whatItIs:
      'Measures the angular similarity S = (A · B) / (||A|| ||B||) and physical spatial distance between the query target node and all document nodes in memory.',
    whyItMatters:
      'The documents closest to the query node in vector space are your most semantically relevant search results!',
    keywordVsVector:
      'Keywords count exact word occurrences. Proximity scanning measures true conceptual distance regardless of exact vocabulary used.',
  },
  5: {
    title: 'Stage 5: Raw Vector Database Payload Inspector',
    subtitle: 'Examining what a production Vector DB (e.g. Pinecone, Qdrant) returns',
    whatItIs:
      'Inspects the exact JSON payload returned by a vector database index including document ID, similarity score, 4D vector, and metadata payload.',
    whyItMatters:
      'Demonstrates how modern RAG and AI applications consume vector database search results programmatically.',
    keywordVsVector:
      'Traditional DBs return row rows matching string queries. Vector DBs return similarity rankings and vector embedding payloads.',
  },
};

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

const StageCard: React.FC<{ children: React.ReactNode; accent: 'blue' | 'indigo' | 'violet' | 'green' | 'teal' }> = ({ children, accent }) => {
  const borders = {
    blue:   'border-l-blue-500',
    indigo: 'border-l-indigo-500',
    violet: 'border-l-violet-500',
    green:  'border-l-green-500',
    teal:   'border-l-teal-500',
  };
  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${borders[accent]} rounded-xl shadow-xs overflow-hidden`}>
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

  const [activeInfoStage, setActiveInfoStage] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    id: string;
    title: string;
    score: number;
    distance: number;
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
      {/* Interactive Info Modal */}
      <ConceptInfoModal
        info={activeInfoStage ? VECTOR_CONCEPT_INFOS[activeInfoStage] : null}
        onClose={() => setActiveInfoStage(null)}
      />

      {/* ── Module Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Vector (Semantic) Search Engine</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              5-stage visual pipeline: Text → Embeddings → Weights → Spatial Plot → Proximity Scan → JSON Payload
            </p>
          </div>
        </div>

        {/* Top-K Control */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
          <label htmlFor="topk-select" className="text-xs text-gray-500 font-medium">
            Top-K Proximity Filter:
          </label>
          <select
            id="topk-select"
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
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
            <div className="flex items-center gap-2">
              <StepBadge n={1} color="blue" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Stage 1: Text → Vector Embedding
              </span>
              <button
                onClick={() => setActiveInfoStage(1)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Explain Stage 1"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[11px] text-blue-600 font-mono font-medium">Dense 4D Vector</span>
          </div>

          <div className="px-5 py-4 space-y-3">
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3.5 py-3 space-y-1">
              <span className="text-[11px] text-gray-400 font-medium">Input Query:</span>
              <p className="text-sm font-semibold text-gray-900">
                "{query || <span className="text-gray-400 font-normal italic">Type a search prompt above...</span>}"
              </p>
            </div>
            <div className="rounded-lg bg-blue-50/70 border border-blue-200 px-3.5 py-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-700">L2-Normalized Vector Array:</span>
                <span className="text-[10px] font-mono text-blue-500">4 Dimensions</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono">
                {queryVector.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-0.5 bg-white border border-blue-200 rounded-lg px-3 py-2 shadow-2xs"
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
            <div className="flex items-center gap-2">
              <StepBadge n={2} color="indigo" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Stage 2: Concept Weights
              </span>
              <button
                onClick={() => setActiveInfoStage(2)}
                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Explain Stage 2"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[11px] text-indigo-600 font-medium">"Inspect the Brain"</span>
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

      {/* ── STAGE 3: 2D SPATIAL COORDINATE PLOT ── */}
      <StageCard accent="violet">
        <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <StepBadge n={3} color="violet" />
            <h3 className="text-sm font-semibold text-gray-800">
              Stage 3: 2D Spatial Coordinate Projection
            </h3>
            <button
              onClick={() => setActiveInfoStage(3)}
              className="p-1 text-gray-400 hover:text-violet-600 transition-colors"
              title="Explain Stage 3"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Query Projected Coords: X={queryCoords.x}%, Y={queryCoords.y}%
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Dimensionality Reduction & Educational Concept Callout */}
          <div className="space-y-3">
            <div className="text-xs text-gray-700 leading-relaxed bg-violet-50/60 p-3 rounded-xl border border-violet-200">
              <strong>Dimensionality Reduction:</strong> 4D vectors are projected onto an $(X, Y)$ coordinate plane where items with similar semantic vectors cluster closely together.
            </div>

            {/* Educational Explanation Box */}
            <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border border-violet-200 rounded-xl p-3.5 text-xs text-violet-950 leading-relaxed shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                  💡
                </span>
                <strong className="text-violet-950 font-bold text-xs">
                  Educational Concept: 2D Spatial Proximity vs. 4D Vector Ranking
                </strong>
              </div>
              <p className="text-[11px] text-violet-900 leading-relaxed">
                Vector rankings are computed using full <strong>4D Cosine Similarity</strong> (<em>S = (A · B) / (||A|| × ||B||)</em>), measuring angular similarity across all 4 concept dimensions. When these 4D vectors are projected down onto a 2D screen coordinate grid, spatial compression occurs.
              </p>
              <div className="text-[11px] text-slate-800 bg-white/90 p-2.5 rounded-lg border border-violet-200 font-medium space-y-1">
                <span className="font-bold text-violet-900">Why rank #1 might look visually further in 2D projection:</span>
                <p className="text-gray-700">
                  For example, when searching <code className="bg-violet-100 px-1.5 py-0.5 rounded text-violet-900 font-mono text-[10px]">a speedy dog</code>, <em>"Fast Hound Tennis Chase"</em> may appear closer on the 2D visual map. However, <em>"Quick Canine Field Run"</em> is ranked <strong>#1</strong> because its 4D vector angle aligns most accurately with the query across all four domain dimensions (Canine, Speed, Food, Rest).
                </p>
              </div>
            </div>
          </div>

          {/* SVG 2D Canvas */}
          <div className="relative w-full h-80 sm:h-96 bg-gray-50 rounded-xl border-2 border-gray-300 overflow-hidden select-none shadow-inner">
            {/* Grid Lines */}
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* High Contrast Solid Axis Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Y Axis Line */}
              <line x1="28" y1="15" x2="28" y2="92%" stroke="#475569" strokeWidth="2.5" strokeDasharray="4 2" />
              {/* X Axis Line */}
              <line x1="24" y1="92%" x2="98%" y2="92%" stroke="#475569" strokeWidth="2.5" strokeDasharray="4 2" />
            </svg>

            {/* X & Y Axis High Contrast Labels */}
            <div className="absolute left-3 top-3 text-[11px] font-mono bg-slate-900 text-white font-bold px-2 py-0.5 rounded shadow-sm z-10 flex items-center gap-1">
              <span>Y-Axis ↑</span>
              <span className="text-slate-300 font-normal">({currentDomainConfig.dimensions[3] || 'Rest / Comfort'})</span>
            </div>
            <div className="absolute right-3 bottom-3 text-[11px] font-mono bg-slate-900 text-white font-bold px-2 py-0.5 rounded shadow-sm z-10 flex items-center gap-1">
              <span>X-Axis →</span>
              <span className="text-slate-300 font-normal">({currentDomainConfig.dimensions[1] || 'Agility / Speed'})</span>
            </div>

            {/* Document Nodes Plot */}
            {vectorResults.map((res) => {
              const isTopK = res.rank <= topK;
              const isSelected = activeSelectedDoc?.doc.id === res.doc.id;
              const isRankOne = res.rank === 1;
              return (
                <div
                  key={res.doc.id}
                  onClick={() => setSelectedResultDoc(res)}
                  onMouseEnter={() =>
                    setHoveredNode({
                      id: res.doc.id,
                      title: res.doc.title,
                      score: res.similarity,
                      distance: res.distance,
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
                      isRankOne
                        ? 'bg-emerald-600 border-white text-white ring-2 ring-emerald-400 shadow-emerald-200'
                        : res.doc.isCustom
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
                      isRankOne
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : isTopK
                        ? 'bg-white text-indigo-600 border-indigo-200 shadow-xs'
                        : 'bg-white text-gray-400 border-gray-200'
                    }`}
                  >
                    {res.similarity}%
                  </div>
                </div>
              );
            })}

            {/* Query Target Node */}
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
                🎯 Query Vector
              </div>
            </div>

            {/* Hover Tooltip */}
            {hoveredNode && (
              <div
                style={{ left: `${hoveredNode.coords.x}%`, top: `${hoveredNode.coords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-full -mt-3 bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2 text-xs shadow-lg z-40 pointer-events-none whitespace-nowrap"
              >
                <div className="font-semibold text-gray-900">{hoveredNode.title}</div>
                <div className="text-gray-500 mt-0.5">
                  Similarity: <span className="font-bold text-indigo-600">{hoveredNode.score}%</span> | Coords: ({hoveredNode.coords.x}, {hoveredNode.coords.y})
                </div>
              </div>
            )}
          </div>
        </div>
      </StageCard>

      {/* ── STAGE 4: LASER PROXIMITY & NEAREST NEIGHBOR SCAN ── */}
      <StageCard accent="teal">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StepBadge n={4} color="teal" />
            <h3 className="text-sm font-semibold text-gray-800">
              Stage 4: Laser Proximity & Nearest-Neighbor Distance Scan
            </h3>
            <button
              onClick={() => setActiveInfoStage(4)}
              className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
              title="Explain Stage 4"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Cosine Similarity Metric
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-teal-50/60 p-3 rounded-lg border border-teal-200 text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>
                <strong>Laser Scanning Active:</strong> Connecting query target to top {topK} nearest neighbor document vectors in coordinate space.
              </span>
            </div>
            <div className="font-mono text-[11px] font-bold text-teal-800">
              Metric: Cosine Similarity S = (A · B) / (||A|| ||B||)
            </div>
          </div>

          {/* Zero-Match Empty State for Vector Search */}
          {query.trim() !== '' && vectorResults[0]?.similarity < 15 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-950">No relevant matches found</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  No documents in the indexed database meet the minimum semantic relevance threshold for "{query}". All similarity scores fell below 15%.
                </p>
              </div>
            </div>
          )}

          {/* Near-Neighbor Distance Ranking Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Top-{topK} Nearest Neighbor Distance Readings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {vectorResults.slice(0, topK).map((res) => {
                const isRankOne = res.rank === 1;
                const isSelected = activeSelectedDoc?.doc.id === res.doc.id;
                return (
                  <div
                    key={res.doc.id}
                    onClick={() => setSelectedResultDoc(res)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isRankOne
                        ? 'border-2 border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-400/30 shadow-md'
                        : isSelected
                        ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-1">
                      <span className="text-xs font-bold text-gray-900 truncate flex items-center gap-1">
                        #{res.rank} {res.doc.title}
                      </span>
                      {isRankOne ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs flex-shrink-0">
                          <Star className="w-3 h-3 fill-white" /> Top Match
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-teal-700 flex-shrink-0">
                          {res.similarity}% match
                        </span>
                      )}
                    </div>
                    {isRankOne && (
                      <div className="text-[10px] font-bold text-emerald-700 font-mono mb-1">
                        Similarity Score: {res.similarity}%
                      </div>
                    )}
                    <p className="text-[11px] text-gray-600 line-clamp-1">"{res.doc.content}"</p>
                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] font-mono text-gray-500">
                      <span>Dist: {res.distance.toFixed(3)}</span>
                      <span className={isRankOne ? 'text-emerald-700 font-bold' : 'text-teal-600 font-semibold'}>
                        {isRankOne ? '★ #1 Primary Match' : 'Laser Locked'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </StageCard>

      {/* ── STAGE 5: RAW VECTOR DB PAYLOAD INSPECTOR ── */}
      <StageCard accent="green">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StepBadge n={5} color="green" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Stage 5: Raw Vector Database Payload Inspector
            </span>
            <button
              onClick={() => setActiveInfoStage(5)}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Explain Stage 5"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

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
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
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
      </StageCard>

    </div>
  );
};
