'use client';

import React, { useState } from 'react';
import { Database, Plus, Trash2, RefreshCw, FileText, Check } from 'lucide-react';
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

    setDocuments((prev) => [newDoc, ...prev]);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <Database className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">Corpus Manager</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-subtle-pulse flex-shrink-0" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {documents.length} documents indexed in browser memory
            </p>
          </div>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
          title="Reset to domain defaults"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset defaults
        </button>
      </div>

      {/* ── Add Document Form ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <form onSubmit={handleAddDocument} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-500" />
              Add custom document
            </label>
            {addedNotice && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Indexed and vector plotted!
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Title (optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800 text-sm rounded-lg px-3 py-2 focus:outline-none transition placeholder-gray-400"
            />
            <input
              type="text"
              required
              placeholder="Content — e.g. Quick dog running fast"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="md:col-span-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800 text-sm rounded-lg px-3 py-2 focus:outline-none transition placeholder-gray-400"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAdding || !newContent.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Index document
            </button>
          </div>
        </form>
      </div>

      {/* ── Document Grid ── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Indexed documents ({documents.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[550px] overflow-y-auto pr-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`group relative rounded-xl border p-3.5 flex flex-col justify-between transition-colors ${
                doc.isCustom
                  ? 'bg-green-50 border-green-200 hover:border-green-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-gray-900 flex items-start gap-1.5 leading-snug break-words">
                    <FileText className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${doc.isCustom ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>{doc.title}</span>
                  </span>
                  {doc.isCustom && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-green-100 text-green-700 border border-green-200 flex-shrink-0">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed break-words font-normal bg-gray-50/70 p-2 rounded-lg border border-gray-100">
                  "{doc.content}"
                </p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-[10px]">
                <span className="text-gray-400 font-mono">
                  vec: [{doc.vector.slice(0, 2).map((v) => v.toFixed(2)).join(', ')}…]
                </span>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete document"
                  aria-label={`Delete ${doc.title}`}
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
