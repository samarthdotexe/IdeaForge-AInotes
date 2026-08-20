import React, { useState } from "react";
import { Note, Notebook, Section, Flashcard, Quiz, StudyStats } from "../types";
import { Download, Upload, FileText, Database, Check, AlertCircle, X } from "lucide-react";

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  notebooks: Notebook[];
  sections: Section[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  stats: StudyStats;
  onImportData: (data: {
    notes: Note[];
    notebooks: Notebook[];
    sections: Section[];
    flashcards: Flashcard[];
    quizzes: Quiz[];
  }) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  notes,
  notebooks,
  sections,
  flashcards,
  quizzes,
  stats,
  onImportData,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const fullBackup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      notebooks,
      sections,
      notes,
      flashcards,
      quizzes,
      stats,
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ideaforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdownZip = () => {
    // Generate a unified markdown bundle
    let mdContent = `# IdeaForge Notes Export\nExported: ${new Date().toLocaleString()}\n\n---\n\n`;
    notes.forEach((n) => {
      mdContent += `\n\n# ${n.title}\n**Tags:** ${n.tags.join(", ")} | **Status:** ${n.status}\n\n${n.content}\n\n---\n`;
    });

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ideaforge-all-notes-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.notes && Array.isArray(parsed.notes)) {
          onImportData({
            notes: parsed.notes || [],
            notebooks: parsed.notebooks || notebooks,
            sections: parsed.sections || sections,
            flashcards: parsed.flashcards || [],
            quizzes: parsed.quizzes || [],
          });
          setIsSuccess(true);
          setImportStatus(`Successfully restored ${parsed.notes.length} notes and associated study decks!`);
        } else {
          setIsSuccess(false);
          setImportStatus("Invalid backup format. Missing 'notes' collection.");
        }
      } catch (err: any) {
        setIsSuccess(false);
        setImportStatus(`Parse error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#151620] border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-stone-900 dark:text-zinc-100 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">Data Backup & Export/Import</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Full snapshot portability for your notes, decks & quizzes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Export Workspace
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportJSON}
              className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-blue-500 bg-stone-50 dark:bg-zinc-900/50 text-left transition-all group flex flex-col justify-between h-28"
            >
              <div className="flex items-center justify-between">
                <Database className="w-5 h-5 text-blue-500" />
                <Download className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div>
                <div className="text-xs font-bold">Full JSON Backup</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Notes, flashcards, quizzes & stats</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportMarkdownZip}
              className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-indigo-500 bg-stone-50 dark:bg-zinc-900/50 text-left transition-all group flex flex-col justify-between h-28"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-indigo-500" />
                <Download className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <div>
                <div className="text-xs font-bold">Markdown File (.md)</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Formatted text for Obsidian/Notion</div>
              </div>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-3 pt-3 border-t border-inherit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Restore Backup
          </h3>

          <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-stone-300 dark:border-zinc-700 hover:border-blue-500 bg-stone-50/50 dark:bg-zinc-900/30 cursor-pointer transition-all">
            <Upload className="w-6 h-6 text-zinc-400 mb-2" />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Click to select backup JSON file
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              Supports IdeaForge JSON exports
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {importStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                isSuccess
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300"
              }`}
            >
              {isSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
