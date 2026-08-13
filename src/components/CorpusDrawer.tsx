'use client';

import React from 'react';
import { X, Database, ChevronRight } from 'lucide-react';
import { Document, DomainType } from '../lib/types';
import { CorpusManager } from './CorpusManager';

interface CorpusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  activeDomain: DomainType;
  resetToDefaults: () => void;
}

export const CorpusDrawer: React.FC<CorpusDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  setDocuments,
  activeDomain,
  resetToDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col transform transition-transform ease-in-out duration-300 animate-fade-in-up">

          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Database Portal (Live Corpus)</h2>
                <p className="text-xs text-gray-500">
                  Inspect or modify indexed documents in memory
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              title="Close Database Portal"
              aria-label="Close Database Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-800 leading-relaxed flex items-start gap-2.5">
              <Database className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Live Database Connection:</strong> Any documents added or deleted here update the search results and 2D spatial coordinate plot live in memory!
              </div>
            </div>

            <CorpusManager
              documents={documents}
              setDocuments={setDocuments}
              activeDomain={activeDomain}
              resetToDefaults={resetToDefaults}
            />
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-2">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-lg"
              title="Close Database Portal and return to visualizer"
            >
              <span>Done Editing — Return to Visualizer</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-gray-400 text-center font-medium">
              {documents.length} documents live in browser memory
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
