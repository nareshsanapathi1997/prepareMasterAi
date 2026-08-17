import React, { useState } from 'react';
import { X, Copy, Check, Trash2, PenTool, Sparkles } from 'lucide-react';

interface ScratchpadModalProps {
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ onClose }) => {
  const [scratchNotes, setScratchNotes] = useState(() => {
    return localStorage.getItem('prepmaster_rough_notes') || '';
  });
  const [copied, setCopied] = useState(false);

  const handleNotesChange = (val: string) => {
    setScratchNotes(val);
    localStorage.setItem('prepmaster_rough_notes', val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scratchNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    if (window.confirm('Clear scratchpad draft?')) {
      handleNotesChange('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Exam Scratchpad & Formula Scratch Sheet
              </h3>
              <p className="text-[11px] text-slate-500">
                Persistent local draft for equations, variables, and rough workings.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Textarea */}
        <div className="p-4 flex-1 flex flex-col">
          <textarea
            value={scratchNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Write scratchpad calculations, formulas, or draft outlines here (e.g. Q = K * V, P(A|B) = P(B|A)*P(A)/P(B)...)"
            className="w-full flex-1 min-h-[260px] p-4 text-xs font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed resize-none"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="p-3 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {scratchNotes.length} characters saved
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
