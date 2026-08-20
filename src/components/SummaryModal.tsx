import React, { useState } from "react";
import { NoteSummary } from "../types";
import { Sparkles, Copy, Check, ArrowRight, X, BookOpen, ListOrdered, FileCheck, HelpCircle } from "lucide-react";

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: NoteSummary | null;
  noteTitle: string;
  onInsertSummary: (text: string) => void;
  onRegenerate: (mode: NoteSummary["mode"]) => Promise<void>;
  isLoading: boolean;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  noteTitle,
  onInsertSummary,
  onRegenerate,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<NoteSummary["mode"]>(summary?.mode || "key_points");

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!summary?.text) return;
    navigator.clipboard.writeText(summary.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchMode = async (mode: NoteSummary["mode"]) => {
    setActiveMode(mode);
    await onRegenerate(mode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#151620] border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] flex flex-col text-stone-900 dark:text-zinc-100 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">AI Note Synthesis & Executive Summary</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-sm">
                "{noteTitle}"
              </p>
            </div>
          </div>
          <button
            id="close-summary-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800/80 rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => handleSwitchMode("key_points")}
            disabled={isLoading}
            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl transition-all font-medium text-center ${
              activeMode === "key_points"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Key Takeaways
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode("executive")}
            disabled={isLoading}
            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl transition-all font-medium text-center ${
              activeMode === "executive"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Executive Brief
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode("cornell")}
            disabled={isLoading}
            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl transition-all font-medium text-center ${
              activeMode === "cornell"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Cornell Format
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode("cheat_sheet")}
            disabled={isLoading}
            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl transition-all font-medium text-center ${
              activeMode === "cheat_sheet"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Exam Cheat Sheet
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode("eli5")}
            disabled={isLoading}
            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl transition-all font-medium text-center ${
              activeMode === "eli5"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            ELI5 Analogy
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-5 rounded-2xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 text-xs sm:text-sm leading-relaxed font-sans min-h-[220px]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-12 text-zinc-400">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-xs">Socrates AI is synthesizing note content...</p>
            </div>
          ) : summary?.text ? (
            <div className="whitespace-pre-wrap">{summary.text}</div>
          ) : (
            <div className="text-zinc-400 text-center py-12">No summary available. Select a mode above.</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-inherit">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!summary?.text || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-inherit text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (summary?.text) {
                  onInsertSummary(`\n\n## 📝 AI Summary (${activeMode.toUpperCase()})\n${summary.text}\n`);
                  onClose();
                }
              }}
              disabled={!summary?.text || isLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-40"
            >
              <span>Insert Into Note</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
