'use client';

import React, { useState } from 'react';
import { X, Sparkles, Database, Search, Cpu, ArrowRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDrawer: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onOpenDrawer,
  onSelectPrompt,
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      number: 1,
      title: 'Step 1: Gather Database Context',
      icon: <Database className="w-5 h-5 text-blue-600" />,
      description:
        'Before searching, it helps to know what data is stored in memory. Open the Database Portal to view the document titles and their contents.',
      actionText: 'Open Database Portal 🗄️',
      onAction: () => {
        onOpenDrawer();
        setStep(2);
      },
    },
    {
      number: 2,
      title: 'Step 2: Run a Search Query',
      icon: <Search className="w-5 h-5 text-amber-600" />,
      description:
        'Type a search term or click one of our curated sample prompts. For example, search for "speedy dog" to test how synonyms behave.',
      actionText: 'Try "speedy dog" 🐕',
      onAction: () => {
        onSelectPrompt('speedy dog');
        setStep(3);
      },
    },
    {
      number: 3,
      title: 'Step 3: Compare Keyword vs. Vector Search',
      icon: <Cpu className="w-5 h-5 text-green-600" />,
      description:
        'Watch Keyword search get 0% match because the document uses the words "quick canine", while Vector search connects concepts and scores >85%!',
      actionText: 'Start Exploring! 🚀',
      onAction: () => {
        onClose();
      },
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 animate-fade-in-up">

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Welcome to Vector vs. Keyword Search!
              </h3>
              <p className="text-xs text-gray-500">Interactive 3-Step Guided Tour</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between px-2">
          {steps.map((s) => (
            <div key={s.number} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.number
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : step > s.number
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s.number ? <Check className="w-3.5 h-3.5" /> : s.number}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step === s.number ? 'text-gray-900 font-semibold' : 'text-gray-400'
                }`}
              >
                Step {s.number}
              </span>
            </div>
          ))}
        </div>

        {/* Current Step Body */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            {currentStep.icon}
            <h4 className="text-sm font-bold text-gray-800">{currentStep.title}</h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{currentStep.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            Skip walkthrough
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={currentStep.onAction}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <span>{currentStep.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
