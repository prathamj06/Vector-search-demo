'use client';

import React from 'react';
import { X, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ConceptInfo } from '../lib/types';

interface ConceptInfoModalProps {
  info: ConceptInfo | null;
  onClose: () => void;
}

export const ConceptInfoModal: React.FC<ConceptInfoModalProps> = ({ info, onClose }) => {
  if (!info) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 id="modal-title" className="text-base font-bold text-gray-900">
                {info.title}
              </h3>
              <p className="text-xs text-blue-600 font-medium">{info.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: What it is */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            ⚙️ Technical Mechanism
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
            {info.whatItIs}
          </p>
        </div>

        {/* Section 2: Why it matters */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Why This Matters
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed bg-green-50/60 p-3 rounded-lg border border-green-200 text-green-900">
            {info.whyItMatters}
          </p>
        </div>

        {/* Section 3: Keyword vs Vector */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Keyword vs. Vector Comparison
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/60 p-3 rounded-lg border border-amber-200 text-amber-900">
            {info.keywordVsVector}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
