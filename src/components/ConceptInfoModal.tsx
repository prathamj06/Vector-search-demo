'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ConceptInfo } from '../lib/types';

interface ConceptInfoModalProps {
  info: ConceptInfo | null;
  onClose: () => void;
}

export const ConceptInfoModal: React.FC<ConceptInfoModalProps> = ({ info, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!info || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <Info className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <h3 id="modal-title" className="text-base font-bold text-gray-900">
                {info.title}
              </h3>
              <p className="text-xs text-blue-700 font-semibold">{info.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Technical Mechanism */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            ⚙️ Technical Mechanism
          </h4>
          <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200 font-medium">
            {info.whatItIs}
          </p>
        </div>

        {/* Section 2: Why it matters */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Why This Matters
          </h4>
          <p className="text-xs text-emerald-950 leading-relaxed bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 font-medium">
            {info.whyItMatters}
          </p>
        </div>

        {/* Section 3: Keyword vs Vector */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Keyword vs. Vector Comparison
          </h4>
          <p className="text-xs text-amber-950 leading-relaxed bg-amber-50/80 p-3 rounded-xl border border-amber-200 font-medium">
            {info.keywordVsVector}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
