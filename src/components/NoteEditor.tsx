import React, { useState, useRef, useEffect, useCallback } from "react";
import { Note, Notebook, Section, ThemeConfig } from "../types";
import { DrawingCanvas } from "./DrawingCanvas";
import { getPaperPatternStyle, FONT_CLASSES } from "../themes";
import {
  Sparkles,
  Layers,
  Award,
  Network,
  Bot,
  Bold,
  Italic,
  List,
  CheckSquare,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Mic,
  MicOff,
  PenTool,
  BookOpen,
  Layout,
  Tag,
  Star,
  Pin,
  Clock,
  FileText,
  Copy,
  Check,
  Wand2,
  Columns,
  Maximize2,
  Eye,
  Edit3,
  Save,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface NoteEditorProps {
  note: Note;
  notebook?: Notebook;
  section?: Section;
  onUpdateNote: (updated: Note) => void;
  onOpenSummary: (mode?: any) => void;
  onGenerateFlashcards: () => void;
  onGenerateQuiz: () => void;
  onOpenConceptGraph: () => void;
  onToggleAITutor: () => void;
  isAITutorOpen: boolean;
  themeConfig: ThemeConfig;
  onApplyPolishedText: (polished: string) => void;
}

type EditorMode = "markdown" | "sketch" | "cornell" | "split";

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  notebook,
  section,
  onUpdateNote,
  onOpenSummary,
  onGenerateFlashcards,
  onGenerateQuiz,
  onOpenConceptGraph,
  onToggleAITutor,
  isAITutorOpen,
  themeConfig,
  onApplyPolishedText,
}) => {
  const [editorMode, setEditorMode] = useState<EditorMode>("markdown");
  // Voice recording & SpeechRecognition state
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [voiceLanguage, setVoiceLanguage] = useState<string>("en-US");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);
  const [showTagInput, setShowTagInput] = useState<boolean>(false);
  const noteRef = useRef(note);
  noteRef.current = note;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 30-Second Auto-Save Mechanism State
  const [lastSavedTime, setLastSavedTime] = useState<Date>(() => new Date());
  const [saveCountdown, setSaveCountdown] = useState<number>(30);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [recoverableBackup, setRecoverableBackup] = useState<any | null>(null);

  // Dedicated function to persist the active note snapshot to localStorage
  const saveToLocalStorage = useCallback((isManual = false) => {
    try {
      setIsSaving(true);
      const now = new Date();
      const snapshot = {
        id: note.id,
        title: note.title,
        content: note.content,
        notebookId: note.notebookId,
        sectionId: note.sectionId,
        tags: note.tags,
        status: note.status,
        isPinned: note.isPinned,
        isFavorite: note.isFavorite,
        cornellCues: note.cornellCues,
        cornellSummary: note.cornellSummary,
        drawingData: note.drawingData,
        autoSavedAt: now.toISOString(),
      };

      // 1. Save specific note auto-save backup
      localStorage.setItem(`ideaforge_autosave_${note.id}`, JSON.stringify(snapshot));
      // 2. Save global active note pointer
      localStorage.setItem("ideaforge_active_note_autosave", JSON.stringify(snapshot));

      // 3. Update the master notes collection in localStorage if present
      const rawNotes = localStorage.getItem("ideaforge_notes");
      if (rawNotes) {
        try {
          const parsed = JSON.parse(rawNotes);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((n: Note) => (n.id === note.id ? { ...n, ...snapshot, updatedAt: now.toISOString() } : n));
            localStorage.setItem("ideaforge_notes", JSON.stringify(updated));
          }
        } catch (e) {
          console.warn("Failed to sync ideaforge_notes array", e);
        }
      }

      setLastSavedTime(now);
      if (isManual) {
        setSaveCountdown(30);
      }

      setTimeout(() => {
        setIsSaving(false);
      }, 600);
    } catch (err) {
      console.error("Auto-save to localStorage failed", err);
      setIsSaving(false);
    }
  }, [note]);

  // Periodic 30-second Auto-Save Timer
  useEffect(() => {
    // Check if there is an existing autosaved backup with more content
    try {
      const backupRaw = localStorage.getItem(`ideaforge_autosave_${note.id}`);
      if (backupRaw) {
        const backup = JSON.parse(backupRaw);
        if (
          backup &&
          backup.autoSavedAt &&
          (backup.content !== note.content || backup.title !== note.title) &&
          new Date(backup.autoSavedAt).getTime() > new Date(note.updatedAt || 0).getTime() + 2000
        ) {
          setRecoverableBackup(backup);
        }
      }
    } catch (e) {
      // ignore
    }

    setSaveCountdown(30);

    const ticker = setInterval(() => {
      setSaveCountdown((prev) => {
        if (prev <= 1) {
          saveToLocalStorage(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [note.id, saveToLocalStorage]);

  // Restore draft backup from auto-save
  const handleRestoreBackup = () => {
    if (!recoverableBackup) return;
    onUpdateNote({
      ...note,
      title: recoverableBackup.title || note.title,
      content: recoverableBackup.content || note.content,
      cornellCues: recoverableBackup.cornellCues ?? note.cornellCues,
      cornellSummary: recoverableBackup.cornellSummary ?? note.cornellSummary,
      drawingData: recoverableBackup.drawingData ?? note.drawingData,
      tags: recoverableBackup.tags ?? note.tags,
      status: recoverableBackup.status ?? note.status,
      updatedAt: new Date().toISOString(),
    });
    setRecoverableBackup(null);
  };

  // Note stats
  const wordCount = note.content ? note.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = note.content ? note.content.length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Voice dictation & browser SpeechRecognition setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLanguage;

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        setSpeechError(null);
        setInterimTranscript("");
      };

      recognition.onresult = (event: any) => {
        let finalChunk = "";
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0]?.transcript || "";
          if (result.isFinal) {
            finalChunk += transcriptText + " ";
          } else {
            currentInterim += transcriptText;
          }
        }

        setInterimTranscript(currentInterim);

        if (finalChunk.trim()) {
          const currentNote = noteRef.current;
          const prevContent = currentNote.content || "";
          const needsSpace = prevContent.length > 0 && !prevContent.endsWith(" ") && !prevContent.endsWith("\n");
          const appendText = (needsSpace ? " " : "") + finalChunk.trim();

          onUpdateNote({
            ...currentNote,
            content: prevContent + appendText,
            updatedAt: new Date().toISOString(),
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("SpeechRecognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setSpeechError("Microphone access was denied. Please allow microphone permissions in your browser.");
        } else if (event.error === "no-speech") {
          // Keep listening or reset interim
          setInterimTranscript("");
        } else if (event.error === "network") {
          setSpeechError("Speech recognition network error. Please check your internet connection.");
        } else {
          setSpeechError(`Dictation notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Failed to initialize SpeechRecognition API", e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [voiceLanguage, onUpdateNote]);

  const toggleVoiceRecording = () => {
    setSpeechError(null);
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechError("SpeechRecognition API is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecordingVoice) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        // ignore
      }
      setIsRecordingVoice(false);
      setInterimTranscript("");
    } else {
      try {
        if (!recognitionRef.current) {
          const recognition = new SpeechRecognitionAPI();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = voiceLanguage;
          recognitionRef.current = recognition;
        }
        recognitionRef.current.lang = voiceLanguage;
        recognitionRef.current.start();
        setIsRecordingVoice(true);
        setInterimTranscript("");
      } catch (err: any) {
        console.error("Speech recognition start failed", err);
        // If already started, stop then restart
        try {
          recognitionRef.current?.stop();
        } catch (e) {
          // ignore
        }
        setIsRecordingVoice(false);
      }
    }
  };

  // Formatting helpers
  const applyFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = note.content || "";
    const selectedText = currentText.substring(start, end);

    const replacement = `${prefix}${selectedText || "text"}${suffix}`;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);

    onUpdateNote({
      ...note,
      content: newContent,
      updatedAt: new Date().toISOString(),
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 10);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      const cleaned = newTagInput.trim().replace(/^#/, "");
      if (!note.tags?.includes(cleaned)) {
        onUpdateNote({
          ...note,
          tags: [...(note.tags || []), cleaned],
          updatedAt: new Date().toISOString(),
        });
      }
      setNewTagInput("");
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote({
      ...note,
      tags: note.tags.filter((t) => t !== tagToRemove),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAIPolish = async (style: "academic" | "concise" | "glossary") => {
    if (!note.content) return;
    setIsPolishing(true);
    try {
      const res = await fetch("/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.content, style }),
      });
      const data = await res.json();
      if (data.polished) {
        onApplyPolishedText(data.polished);
      }
    } catch (err) {
      console.error("Polish error:", err);
    } finally {
      setIsPolishing(false);
    }
  };

  const copyNoteContent = () => {
    navigator.clipboard.writeText(note.content || "");
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const paperStyle = getPaperPatternStyle(themeConfig.paperPattern, themeConfig.isDark);
  const fontClass = FONT_CLASSES[themeConfig.fontStyle] || "font-sans";

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative">
      {/* 1. Top Super Action Bar (AI Tools & View Mode Switcher) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-[#222] bg-[#0F0F0F] select-none z-20">
        {/* Left: AI Superpowers */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* AI Summarize */}
          <button
            id="note-ai-summarize-btn"
            type="button"
            onClick={() => onOpenSummary("key_points")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 text-xs font-semibold shadow-xs transition-colors"
            title="Summarize Note with AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Summarize</span>
          </button>

          {/* AI Flashcards */}
          <button
            id="note-ai-flashcards-btn"
            type="button"
            onClick={onGenerateFlashcards}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 border border-violet-500/20 text-xs font-semibold shadow-xs transition-colors"
            title="Create Active Recall Flashcards"
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Make Flashcards</span>
          </button>

          {/* AI Quiz */}
          <button
            id="note-ai-quiz-btn"
            type="button"
            onClick={onGenerateQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 text-xs font-semibold shadow-xs transition-colors"
            title="Generate Practice Exam Quiz"
          >
            <Award className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Make Quiz</span>
          </button>

          {/* AI Polish dropdown */}
          <div className="relative group">
            <button
              id="ai-polish-menu-btn"
              type="button"
              disabled={isPolishing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-xs text-[#AAA] hover:text-white transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isPolishing ? "Polishing..." : "AI Polish"}</span>
            </button>
            <div className="absolute left-0 top-full mt-1 hidden group-hover:flex flex-col bg-[#181818] border border-[#333] rounded-xl p-1.5 shadow-2xl min-w-[170px] z-50 animate-fadeIn">
              <button
                type="button"
                onClick={() => handleAIPolish("academic")}
                className="px-3 py-1.5 text-left text-xs hover:bg-[#252525] rounded-lg text-[#DDD] transition-colors"
              >
                🎓 Academic Rigor
              </button>
              <button
                type="button"
                onClick={() => handleAIPolish("concise")}
                className="px-3 py-1.5 text-left text-xs hover:bg-[#252525] rounded-lg text-[#DDD] transition-colors"
              >
                ⚡ Ultra-Concise Bullets
              </button>
              <button
                type="button"
                onClick={() => handleAIPolish("glossary")}
                className="px-3 py-1.5 text-left text-xs hover:bg-[#252525] rounded-lg text-[#DDD] transition-colors"
              >
                📖 Extract Master Glossary
              </button>
            </div>
          </div>

          {/* Concept Graph */}
          <button
            type="button"
            onClick={onOpenConceptGraph}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-xs text-[#AAA] hover:text-white transition-colors"
            title="Visualize Concept Graph"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Concept Map</span>
          </button>
        </div>

        {/* Right: View Mode Tabs & AI Tutor Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Mode switch */}
          <div className="flex items-center gap-0.5 bg-[#141414] p-1 rounded-xl border border-[#262626] text-xs">
            <button
              type="button"
              onClick={() => setEditorMode("markdown")}
              className={`p-1.5 px-2.5 rounded-lg font-medium transition-colors ${
                editorMode === "markdown"
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "text-[#777] hover:text-white"
              }`}
              title="Markdown Editor"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setEditorMode("split")}
              className={`p-1.5 px-2.5 rounded-lg font-medium transition-colors ${
                editorMode === "split"
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "text-[#777] hover:text-white"
              }`}
              title="Split Markdown & Live Preview"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setEditorMode("cornell")}
              className={`p-1.5 px-2.5 rounded-lg font-medium transition-colors ${
                editorMode === "cornell"
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "text-[#777] hover:text-white"
              }`}
              title="Cornell Notes System"
            >
              <Layout className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setEditorMode("sketch")}
              className={`p-1.5 px-2.5 rounded-lg font-medium transition-colors ${
                editorMode === "sketch"
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "text-[#777] hover:text-white"
              }`}
              title="GoodNotes Canvas Sketch"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Voice Dictation Button */}
          <button
            id="voice-dictation-btn"
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-1.5 px-2.5 rounded-lg border flex items-center gap-1 text-xs font-medium transition-colors ${
              isRecordingVoice
                ? "bg-rose-600 text-white animate-pulse border-rose-600"
                : "bg-[#1A1A1A] hover:bg-[#222] border-[#333] text-[#AAA] hover:text-white"
            }`}
            title="Speech to Text Dictation"
          >
            {isRecordingVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isRecordingVoice ? "Listening..." : "Dictate"}</span>
          </button>

          {/* AI Tutor Toggle Slideout */}
          <button
            id="toggle-ai-tutor-btn"
            type="button"
            onClick={onToggleAITutor}
            className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors ${
              isAITutorOpen
                ? "bg-indigo-600 text-white"
                : "bg-[#1A1A1A] text-indigo-300 border border-indigo-500/30 hover:bg-[#252525]"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* 2. Formatting Toolbar (when in markdown or split mode) */}
      {(editorMode === "markdown" || editorMode === "split" || editorMode === "cornell") && (
        <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-[#222] bg-[#0A0A0A] text-xs text-[#888] select-none overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => applyFormat("**", "**")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("*", "*")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("== ", " ==")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-amber-500"
            title="Highlight"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-inherit mx-1" />

          <button
            type="button"
            onClick={() => applyFormat("# ")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("## ")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("### ")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-inherit mx-1" />

          <button
            type="button"
            onClick={() => applyFormat("- ")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("- [ ] ")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            title="Task Checklist"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("```\n", "\n```")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("$$\n", "\n$$")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 font-serif font-bold text-[13px]"
            title="LaTeX Math Formula"
          >
            ∑x
          </button>
          <button
            type="button"
            onClick={() => applyFormat("> ")}
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="ml-auto flex items-center gap-2 text-[11px] text-zinc-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>~{readTimeMin} min read</span>
            <button
              type="button"
              onClick={copyNoteContent}
              className="p-1 hover:text-blue-500"
              title="Copy All Note Markdown"
            >
              {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* 3. Note Content Body with Paper Background */}
      <div
        className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col transition-all"
        style={paperStyle}
      >
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-4">
          {/* Breadcrumbs & Status Bar with 30s Auto-Save Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 select-none pb-2 border-b border-inherit">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                {notebook?.title || "Default Notebook"}
              </span>
              <span>/</span>
              <span>{section?.title || "Section"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* 30-Second Auto-Save Status Badge */}
              <div
                id="autosave-status-badge"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141414] border border-[#2B2B2B] text-[11px] text-[#888] shadow-xs"
                title={`Note is automatically saved to LocalStorage every 30 seconds. Next auto-save in ${saveCountdown}s.`}
              >
                {isSaving ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-amber-300 font-medium">Auto-saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[#AAA]">
                      Saved {lastSavedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className="text-[#666] font-mono text-[10px]" title="Time until next 30s auto-save">
                      ({saveCountdown}s)
                    </span>
                  </>
                )}
                <button
                  type="button"
                  id="note-save-now-btn"
                  onClick={() => saveToLocalStorage(true)}
                  className="ml-1 text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5 font-medium transition-colors cursor-pointer"
                  title="Save now to LocalStorage immediately"
                >
                  Save now
                </button>
              </div>

              {/* Status picker */}
              <select
                id="note-status-select"
                value={note.status}
                onChange={(e) =>
                  onUpdateNote({
                    ...note,
                    status: e.target.value as any,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="text-[11px] font-semibold bg-[#181818] border border-[#333] rounded-lg px-2 py-1 text-zinc-300 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="in-progress">In Progress</option>
                <option value="mastered">Mastered 🌟</option>
                <option value="review-needed">Review Needed ⚠️</option>
              </select>

              {/* Pin & Favorite */}
              <button
                type="button"
                onClick={() =>
                  onUpdateNote({
                    ...note,
                    isPinned: !note.isPinned,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className={`p-1.5 rounded-lg border border-[#333] bg-[#181818] ${note.isPinned ? "text-amber-400 border-amber-500/30" : "text-[#777] hover:text-white"}`}
                title={note.isPinned ? "Unpin Note" : "Pin Note"}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateNote({
                    ...note,
                    isFavorite: !note.isFavorite,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className={`p-1.5 rounded-lg border border-[#333] bg-[#181818] ${note.isFavorite ? "text-yellow-400 fill-yellow-400 border-yellow-500/30" : "text-[#777] hover:text-white"}`}
                title={note.isFavorite ? "Favorited Note" : "Favorite Note"}
              >
                <Star className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Voice Dictation HUD Banner */}
          {isRecordingVoice && (
            <div
              id="voice-dictation-hud"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs animate-fadeIn shadow-lg shadow-rose-950/20 select-none"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
                  <div className="w-3 h-3 rounded-full bg-rose-500 relative" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 font-semibold text-rose-300">
                    <span>Microphone Dictation Active</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                      {voiceLanguage}
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-200/80 italic mt-0.5 max-w-md line-clamp-1">
                    {interimTranscript ? (
                      <span>&ldquo;{interimTranscript}&rdquo;</span>
                    ) : (
                      <span>Listening... Speak clearly into your microphone</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <select
                  value={voiceLanguage}
                  onChange={(e) => setVoiceLanguage(e.target.value)}
                  className="bg-[#1A1A1A] border border-rose-500/40 rounded-lg px-2 py-1 text-[11px] text-rose-200 outline-none cursor-pointer"
                  title="Speech Recognition Language"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Español</option>
                  <option value="fr-FR">Français</option>
                  <option value="de-DE">Deutsch</option>
                  <option value="ja-JP">日本語</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                </select>
                <button
                  type="button"
                  id="stop-dictation-btn"
                  onClick={toggleVoiceRecording}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <MicOff className="w-3 h-3" /> Stop
                </button>
              </div>
            </div>
          )}

          {/* Speech Error Banner if any */}
          {speechError && (
            <div
              id="speech-error-banner"
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-fadeIn select-none"
            >
              <div className="flex items-center gap-2">
                <MicOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="px-2 py-0.5 rounded text-amber-400/80 hover:text-amber-200 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Recoverable Auto-Save Banner if found */}
          {recoverableBackup && (
            <div
              id="autosave-recovery-banner"
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-fadeIn select-none"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Auto-Save Backup Available:</strong> A newer draft from{" "}
                  {new Date(recoverableBackup.autoSavedAt).toLocaleTimeString()} was recovered from local storage.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-semibold text-[11px] hover:bg-amber-400 transition-colors"
                >
                  Restore Draft
                </button>
                <button
                  type="button"
                  onClick={() => setRecoverableBackup(null)}
                  className="px-2 py-1 rounded-lg text-amber-400/80 hover:text-amber-200 text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Editable Note Title */}
          <input
            id="note-title-input"
            type="text"
            value={note.title}
            onChange={(e) =>
              onUpdateNote({
                ...note,
                title: e.target.value,
                updatedAt: new Date().toISOString(),
              })
            }
            placeholder="Untitled Note..."
            className="w-full bg-transparent font-extrabold text-2xl sm:text-4xl text-stone-900 dark:text-zinc-100 tracking-tight focus:outline-none placeholder-zinc-300 dark:placeholder-zinc-700"
          />

          {/* Tags Chips Bar */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            {note.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-inherit group"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-zinc-400 hover:text-rose-500 opacity-60 group-hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            ))}

            {showTagInput ? (
              <input
                type="text"
                autoFocus
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                onBlur={() => setShowTagInput(false)}
                placeholder="tag + Enter"
                className="bg-white dark:bg-zinc-800 border border-blue-500 rounded-lg px-2 py-0.5 text-xs text-stone-900 dark:text-zinc-100 focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowTagInput(true)}
                className="flex items-center gap-0.5 text-[11px] text-zinc-400 hover:text-blue-500 px-2 py-0.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700"
              >
                <Tag className="w-3 h-3" /> + Tag
              </button>
            )}
          </div>

          {/* Note View Mode Rendering */}
          {editorMode === "sketch" ? (
            /* GoodNotes Drawing Canvas Mode */
            <div className="flex-1 flex flex-col space-y-3 animate-fadeIn">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                <span>🎨 GoodNotes Drawing Canvas — Draw diagrams, math equations, or annotations</span>
              </div>
              <DrawingCanvas
                initialData={note.drawingData}
                onSave={(dataUrl) =>
                  onUpdateNote({
                    ...note,
                    drawingData: dataUrl,
                    updatedAt: new Date().toISOString(),
                  })
                }
                isDark={themeConfig.isDark}
              />
            </div>
          ) : editorMode === "cornell" ? (
            /* Cornell Notes Split Mode */
            <div className="flex-1 flex flex-col space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                {/* Left: Cue / Keywords column (28%) */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Cornell Cues & Keywords
                  </div>
                  <textarea
                    value={note.cornellCues || ""}
                    onChange={(e) =>
                      onUpdateNote({
                        ...note,
                        cornellCues: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    placeholder="Keywords, review questions, formulas, flashcard cues..."
                    className={`flex-1 w-full bg-transparent resize-none focus:outline-none text-xs leading-relaxed ${fontClass} placeholder-amber-900/30 dark:placeholder-amber-200/20`}
                  />
                </div>

                {/* Right: Main Lecture / Notes column (72%) */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 flex flex-col">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Detailed Notes Body
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={note.content}
                    onChange={(e) =>
                      onUpdateNote({
                        ...note,
                        content: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    placeholder="Take comprehensive notes here..."
                    className={`flex-1 w-full min-h-[300px] bg-transparent resize-none focus:outline-none text-xs sm:text-sm leading-relaxed ${fontClass}`}
                  />
                </div>
              </div>

              {/* Bottom: Cornell Summary Synthesis Box */}
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 2-Sentence Cornell Summary
                </div>
                <textarea
                  rows={2}
                  value={note.cornellSummary || ""}
                  onChange={(e) =>
                    onUpdateNote({
                      ...note,
                      cornellSummary: e.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="Synthesize the whole note in 1-2 powerful sentences..."
                  className={`w-full bg-transparent resize-none focus:outline-none text-xs leading-relaxed ${fontClass}`}
                />
              </div>
            </div>
          ) : editorMode === "split" ? (
            /* Split Edit & Live Rendered Preview */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 animate-fadeIn">
              <div className="flex flex-col">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Markdown Editor
                </div>
                <textarea
                  ref={textareaRef}
                  value={note.content}
                  onChange={(e) =>
                    onUpdateNote({
                      ...note,
                      content: e.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="Type rich markdown notes..."
                  className={`w-full h-full min-h-[400px] bg-stone-50/50 dark:bg-zinc-900/50 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 focus:outline-none text-xs sm:text-sm leading-relaxed ${fontClass}`}
                />
              </div>

              <div className="flex flex-col">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Live Rendered Preview
                </div>
                <div
                  className={`w-full h-full min-h-[400px] bg-white dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 overflow-y-auto text-xs sm:text-sm leading-relaxed ${fontClass}`}
                >
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                    {note.content}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Fullscreen Markdown Editor */
            <div className="flex-1 flex flex-col">
              <textarea
                ref={textareaRef}
                value={note.content}
                onChange={(e) =>
                  onUpdateNote({
                    ...note,
                    content: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                placeholder="Start typing your notes, lecture insights, code blocks, or formulas..."
                className={`w-full flex-1 min-h-[460px] bg-transparent resize-none focus:outline-none text-sm sm:text-base leading-relaxed ${fontClass} placeholder-zinc-300 dark:placeholder-zinc-700`}
              />
            </div>
          )}

          {/* Embedded Drawing Preview (if drawingData exists and not currently in sketch mode) */}
          {note.drawingData && editorMode !== "sketch" && (
            <div className="mt-6 pt-4 border-t border-inherit">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-semibold">
                <span>🎨 Associated GoodNotes Canvas Sketch:</span>
                <button
                  type="button"
                  onClick={() => setEditorMode("sketch")}
                  className="text-blue-500 hover:underline"
                >
                  Edit Drawing
                </button>
              </div>
              <div className="rounded-2xl border border-inherit overflow-hidden bg-white/60 dark:bg-black/40 p-2 shadow-sm max-w-lg">
                <img
                  src={note.drawingData}
                  alt="Note Diagram"
                  className="w-full h-auto rounded-xl object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
