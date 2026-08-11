'use client';

import React, { useState } from 'react';
import { Database, Plus, Trash2, RefreshCw, FileText, Check, Sparkles } from 'lucide-react';
import { Document, DomainType } from '../lib/types';
import { generateVector, projectVectorTo2D } from '../lib/vectorEngine';

interface CorpusManagerProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  activeDomain: DomainType;
  resetToDefaults: () => void;
}

export const CorpusManager: React.FC<CorpusManagerProps> = ({
  documents,
  setDocuments,
  activeDomain,
  resetToDefaults,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsAdding(true);

    const textToVector = `${newTitle} ${newContent}`;
    const vector = generateVector(textToVector);
    const coords = projectVectorTo2D(vector);

    const newDoc: Document = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim() || `Custom Doc #${documents.length + 1}`,
      content: newContent.trim(),
      domain: activeDomain,
      vector,
      coords,
      isCustom: true,
    };

    setDocuments(prev => [newDoc, ...prev]);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Corpus Manager (Live Dataset Portal)</span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Sync
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage indexed documents in browser memory ({documents.length} active records)
            </p>
          </div>
        </div>

        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 transition cursor-pointer self-start sm:self-auto"
          title="Reset dataset to domain defaults"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Add Custom Document Form */}
      <form onSubmit={handleAddDocument} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-cyan-400" /> Add Custom Document to Memory DB
          </label>
          {addedNotice && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" /> Index Updated & Vector Plotted!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Document Title (e.g. Fast Canine Run)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none placeholder-slate-500"
          />
          <input
            type="text"
            required
            placeholder="Content payload (e.g. Quick dog running fast)"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none md:col-span-2 placeholder-slate-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isAdding || !newContent.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Index to DB & Plot 2D Vector</span>
          </button>
        </div>
      </form>

      {/* Indexed Document Grid List */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Currently Indexed Documents ({documents.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`group relative p-3 rounded-xl border transition-all flex flex-col justify-between ${
                doc.isCustom
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400/60'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {doc.title}
                  </span>
                  {doc.isCustom && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  "{doc.content}"
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                <span>Vector: [{doc.vector.slice(0, 2).join(', ')}...]</span>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
