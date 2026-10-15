import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check, ArrowRight } from 'lucide-react';
import { refineNoteApi } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface RefineSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  noteContent: string;
  sourceText?: string;
  outputLanguage: string;
  onApplyReplacement: (newSectionText: string) => void;
}

type RefineAction = 'expand' | 'shorten' | 'simplify' | 'elaborate' | 'regenerate';

export const RefineSectionModal: React.FC<RefineSectionModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  noteContent,
  sourceText,
  outputLanguage,
  onApplyReplacement,
}) => {
  const [action, setAction] = useState<RefineAction>('simplify');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refinedResult, setRefinedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefine = async () => {
    setIsLoading(true);
    setError(null);
    setRefinedResult(null);

    try {
      const result = await refineNoteApi({
        noteContent,
        sourceText,
        action,
        selection: selectedText,
        outputLanguage,
      });
      setRefinedResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to refine section.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (refinedResult) {
      onApplyReplacement(refinedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Refine Section with AI</h3>
              <p className="text-xs text-slate-500">Transform, expand, or simplify any section</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Section Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Section
            </label>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 max-h-36 overflow-y-auto italic">
              "{selectedText}"
            </div>
          </div>

          {/* Action Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Transformation Goal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'simplify', label: 'Simplify (ELIF5)', desc: 'Clear, intuitive breakdown' },
                { id: 'expand', label: 'Expand In-Depth', desc: 'Add context & technical rigor' },
                { id: 'shorten', label: 'Condense & Cram', desc: 'Punchy high-yield bullets' },
                { id: 'elaborate', label: 'Formulas & Math', desc: 'Step-by-step logic & variables' },
                { id: 'regenerate', label: 'Polish Academic', desc: 'Professional clarity rewrite' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAction(opt.id as RefineAction)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    action === opt.id
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs sm:text-sm">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Execute Button */}
          {!refinedResult && (
            <button
              onClick={handleRefine}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing refinement with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Refined Section</span>
                </>
              )}
            </button>
          )}

          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Result Preview */}
          {refinedResult && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Refined Version Ready
                </span>
                <button
                  onClick={handleRefine}
                  disabled={isLoading}
                  className="text-xs text-indigo-600 hover:underline cursor-pointer"
                >
                  Try again
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100 max-h-56 overflow-y-auto">
                <MarkdownRenderer content={refinedResult} />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          {refinedResult && (
            <button
              onClick={handleApply}
              className="px-5 py-2 text-sm rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Replace in Note</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
