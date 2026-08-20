import React, { useState, useEffect } from "react";
import {
  Note,
  Notebook,
  Section,
  Flashcard,
  Quiz,
  StudyStats,
  ActiveView,
  ThemeConfig,
  NoteSummary,
  ConceptMap,
} from "./types";
import { INITIAL_NOTEBOOKS, INITIAL_SECTIONS, INITIAL_NOTES, INITIAL_FLASHCARDS, INITIAL_QUIZZES, INITIAL_STATS } from "./initialData";
import { THEMES, THEME_CONFIG_KEY } from "./themes";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { NoteEditor } from "./components/NoteEditor";
import { FlashcardArena } from "./components/FlashcardArena";
import { QuizCenter } from "./components/QuizCenter";
import { ConceptGraphView } from "./components/ConceptGraphView";
import { StudyStatsView } from "./components/StudyStatsView";
import { AITutorPanel } from "./components/AITutorPanel";
import { ThemeModal } from "./components/ThemeModal";
import { SummaryModal } from "./components/SummaryModal";
import { ExportImportModal } from "./components/ExportImportModal";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export function App() {
  // 1. Persistent State with LocalStorage
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    const saved = localStorage.getItem("ideaforge_notebooks");
    return saved ? JSON.parse(saved) : INITIAL_NOTEBOOKS;
  });

  const [sections, setSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem("ideaforge_sections");
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("ideaforge_notes");
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("ideaforge_flashcards");
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem("ideaforge_quizzes");
    return saved ? JSON.parse(saved) : INITIAL_QUIZZES;
  });

  const [stats, setStats] = useState<StudyStats>(() => {
    const saved = localStorage.getItem("ideaforge_stats");
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem(THEME_CONFIG_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          id: "sophisticated-dark",
          name: "Sophisticated Dark",
          isDark: true,
          accentColor: "#6366f1",
          paperPattern: "blank",
          fontStyle: "sans",
        };
  });

  // 2. Navigation & Selection State
  const [activeView, setActiveView] = useState<ActiveView>("notes");
  const [activeNotebookId, setActiveNotebookId] = useState<string>(notebooks[0]?.id || "");
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || "");
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // 3. Modals & Slideouts
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  // 4. AI Transient State
  const [activeSummary, setActiveSummary] = useState<NoteSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [activeConceptMap, setActiveConceptMap] = useState<ConceptMap | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("ideaforge_notebooks", JSON.stringify(notebooks));
  }, [notebooks]);

  useEffect(() => {
    localStorage.setItem("ideaforge_sections", JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem("ideaforge_notes", JSON.stringify(notes));
  }, [notes]);

  // Periodic 30-second auto-save interval to guarantee persistence against unexpected tab crashes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (notes.length > 0) {
        localStorage.setItem("ideaforge_notes", JSON.stringify(notes));
        if (activeNoteId) {
          const currentNote = notes.find((n) => n.id === activeNoteId);
          if (currentNote) {
            localStorage.setItem("ideaforge_active_note_autosave", JSON.stringify({
              ...currentNote,
              autoSavedAt: new Date().toISOString(),
            }));
            localStorage.setItem(`ideaforge_autosave_${currentNote.id}`, JSON.stringify({
              ...currentNote,
              autoSavedAt: new Date().toISOString(),
            }));
          }
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [notes, activeNoteId]);

  useEffect(() => {
    localStorage.setItem("ideaforge_flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem("ideaforge_quizzes", JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem("ideaforge_stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify(themeConfig));
    // Apply dark class to document
    if (themeConfig.isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeConfig]);

  // Current active entity lookups
  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];
  const activeNotebook = notebooks.find((nb) => nb.id === activeNote?.notebookId);
  const activeSection = sections.find((s) => s.id === activeNote?.sectionId);

  // Filter notes by search query if present
  const searchedNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.title || "").toLowerCase().includes(q) ||
      (n.content || "").toLowerCase().includes(q) ||
      (n.tags || []).some((t) => (t || "").toLowerCase().includes(q))
    );
  });

  // Handlers for Note CRUD
  const handleUpdateNote = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleAddNote = (notebookId?: string, sectionId?: string) => {
    const targetNb = notebookId || activeNotebookId || notebooks[0]?.id;
    const targetSec = sectionId || activeSectionId || sections.find((s) => s.notebookId === targetNb)?.id || sections[0]?.id;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      notebookId: targetNb,
      sectionId: targetSec,
      title: "Untitled Study Note",
      content: "# Key Concepts & Objectives\n\n- [ ] Review lecture slides\n- [ ] Formulate core hypotheses\n\n## Discussion & Proofs\n\nType your insights here...",
      tags: ["general", "review"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setActiveView("notes");
    showToast("Created new study note page!");
  };

  const handleDeleteNote = (noteId: string) => {
    if (notes.length <= 1) {
      alert("You need to have at least one note.");
      return;
    }
    const remaining = notes.filter((n) => n.id !== noteId);
    setNotes(remaining);
    if (activeNoteId === noteId) {
      setActiveNoteId(remaining[0].id);
    }
    showToast("Note deleted", "info");
  };

  const handleDuplicateNote = (noteId: string) => {
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;
    const dup: Note = {
      ...target,
      id: `note-${Date.now()}`,
      title: `${target.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [dup, ...prev]);
    setActiveNoteId(dup.id);
    showToast("Duplicated note");
  };

  const handleTogglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleToggleFavorite = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  };

  const handleAddNotebook = (title: string, color: string, icon: string) => {
    const newNb: Notebook = {
      id: `nb-${Date.now()}`,
      title,
      color,
      icon,
      createdAt: new Date().toISOString(),
    };
    const defaultSec: Section = {
      id: `sec-${Date.now()}`,
      notebookId: newNb.id,
      title: "General Notes",
      createdAt: new Date().toISOString(),
    };
    setNotebooks((prev) => [...prev, newNb]);
    setSections((prev) => [...prev, defaultSec]);
    setActiveNotebookId(newNb.id);
    setActiveSectionId(defaultSec.id);
    showToast(`Created notebook "${title}"`);
  };

  const handleAddSection = (notebookId: string, title: string, color: string) => {
    const newSec: Section = {
      id: `sec-${Date.now()}`,
      notebookId,
      title,
      color,
      createdAt: new Date().toISOString(),
    };
    setSections((prev) => [...prev, newSec]);
    setActiveSectionId(newSec.id);
    showToast(`Added section "${title}"`);
  };

  // AI Summarization Handler
  const handleOpenSummary = async (mode: NoteSummary["mode"] = "key_points") => {
    if (!activeNote) return;
    setIsSummaryModalOpen(true);
    setIsSummaryLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteTitle: activeNote.title,
          content: activeNote.content,
          mode,
        }),
      });
      const data = await res.json();
      setActiveSummary({
        noteId: activeNote.id,
        mode,
        text: data.summary,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Summarize error:", err);
      showToast("Could not generate summary", "error");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // AI Flashcards Generator Handler
  const handleGenerateAIFlashcards = async (noteId: string, count: number = 5): Promise<Flashcard[]> => {
    const target = notes.find((n) => n.id === noteId) || activeNote;
    if (!target) return [];

    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteTitle: target.title,
          content: target.content,
          count,
        }),
      });
      const data = await res.json();
      const generatedCards: Flashcard[] = (data.flashcards || []).map((fc: any, idx: number) => ({
        id: `fc-ai-${Date.now()}-${idx}`,
        noteId: target.id,
        noteTitle: target.title,
        front: fc.front,
        back: fc.back,
        tags: fc.tags || target.tags,
        intervalDays: 1,
        easeFactor: 2.5,
        masteryScore: 0,
        createdAt: new Date().toISOString(),
      }));

      if (generatedCards.length > 0) {
        setFlashcards((prev) => [...generatedCards, ...prev]);
        showToast(`Generated ${generatedCards.length} active recall flashcards!`);
      }
      return generatedCards;
    } catch (err) {
      console.error("AI flashcard generation error:", err);
      showToast("Error generating flashcards", "error");
      return [];
    }
  };

  // AI Quiz Generator Handler
  const handleGenerateAIQuiz = async (
    noteId: string,
    questionCount: number = 6,
    difficulty: string = "mixed"
  ): Promise<Quiz | null> => {
    const target = notes.find((n) => n.id === noteId) || activeNote;
    if (!target) return null;

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteTitle: target.title,
          content: target.content,
          questionCount,
          difficulty,
        }),
      });
      const data = await res.json();
      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        noteId: target.id,
        noteTitle: target.title,
        title: data.title || `${target.title} Diagnostic Exam`,
        questions: data.questions || [],
        createdAt: new Date().toISOString(),
      };

      setQuizzes((prev) => [newQuiz, ...prev]);
      showToast(`Created exam quiz with ${newQuiz.questions.length} questions!`);
      return newQuiz;
    } catch (err) {
      console.error("AI quiz generation error:", err);
      showToast("Error generating quiz", "error");
      return null;
    }
  };

  // AI Concept Map Generator Handler
  const handleGenerateConceptMap = async (noteId: string) => {
    const target = notes.find((n) => n.id === noteId) || activeNote;
    if (!target) return;

    try {
      const res = await fetch("/api/ai/concept-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteTitle: target.title,
          content: target.content,
        }),
      });
      const data = await res.json();
      const map: ConceptMap = {
        centralTheme: data.centralTheme || target.title,
        nodes: data.nodes || [],
        links: data.links || [],
      };
      setActiveConceptMap(map);
      showToast("Knowledge Concept Graph synthesized!");
    } catch (err) {
      console.error("Concept map error:", err);
      showToast("Failed to generate concept map", "error");
    }
  };

  // Spaced Repetition Card Review Handler
  const handleReviewFlashcard = (cardId: string, rating: "again" | "hard" | "good" | "easy") => {
    setFlashcards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        let nextInterval = c.intervalDays;
        let score = c.masteryScore || 0;
        let ease = c.easeFactor || 2.5;

        if (rating === "again") {
          nextInterval = 1;
          score = Math.max(0, score - 25);
          ease = Math.max(1.3, ease - 0.2);
        } else if (rating === "hard") {
          nextInterval = Math.max(1, Math.round(nextInterval * 1.2));
          score = Math.min(100, score + 10);
          ease = Math.max(1.3, ease - 0.15);
        } else if (rating === "good") {
          nextInterval = Math.max(2, Math.round(nextInterval * ease));
          score = Math.min(100, score + 20);
        } else if (rating === "easy") {
          nextInterval = Math.max(4, Math.round(nextInterval * ease * 1.3));
          score = Math.min(100, score + 30);
          ease = ease + 0.15;
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + nextInterval);

        return {
          ...c,
          intervalDays: nextInterval,
          easeFactor: ease,
          masteryScore: score,
          lastReviewed: new Date().toISOString(),
          nextReviewDate: nextDate.toISOString(),
        };
      })
    );

    // Update study statistics
    setStats((prev) => {
      const today = new Date().toISOString().slice(0, 10);
      const history = [...prev.activityHistory];
      const todayIndex = history.findIndex((h) => h.date === today);
      if (todayIndex >= 0) {
        history[todayIndex].count += 1;
      } else {
        history.push({ date: today, count: 1 });
      }
      return {
        ...prev,
        cardsMastered: flashcards.filter((c) => (c.masteryScore || 0) >= 80).length,
        totalStudyMinutes: prev.totalStudyMinutes + 1,
        activityHistory: history.slice(-14),
      };
    });
  };

  const handleSaveQuizResult = (completedQuiz: Quiz) => {
    setQuizzes((prev) => prev.map((q) => (q.id === completedQuiz.id ? completedQuiz : q)));
    setStats((prev) => ({
      ...prev,
      quizzesTaken: prev.quizzesTaken + 1,
    }));
    showToast("Quiz results recorded!");
  };

  const handleToggleQuickDark = () => {
    const nextDark = !themeConfig.isDark;
    const targetPreset = nextDark ? THEMES["dark-obsidian"] : THEMES["light-studio"];
    setThemeConfig({
      ...themeConfig,
      id: targetPreset.id,
      name: targetPreset.name,
      isDark: nextDark,
      accentColor: targetPreset.accentHex,
    });
  };

  // Render main screen according to activeView
  const currentThemeDef = THEMES[themeConfig.id] || THEMES["light-studio"];

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden ${currentThemeDef.bgClass} ${currentThemeDef.textClass} transition-colors duration-300 font-sans`}
    >
      {/* 1. Global Navigation Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        themeConfig={themeConfig}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onQuickNewNote={() => handleAddNote()}
        stats={stats}
        onToggleQuickDark={handleToggleQuickDark}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeView === "notes" && (
          <>
            {/* Sidebar with Notebooks, Sections & Notes */}
            <Sidebar
              notebooks={notebooks}
              sections={sections}
              notes={searchedNotes}
              activeNotebookId={activeNotebookId}
              setActiveNotebookId={setActiveNotebookId}
              activeSectionId={activeSectionId}
              setActiveSectionId={setActiveSectionId}
              activeNoteId={activeNoteId}
              setActiveNoteId={setActiveNoteId}
              selectedTagFilter={selectedTagFilter}
              setSelectedTagFilter={setSelectedTagFilter}
              onAddNotebook={handleAddNotebook}
              onAddSection={handleAddSection}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onDuplicateNote={handleDuplicateNote}
              onTogglePin={handleTogglePin}
              onToggleFavorite={handleToggleFavorite}
              isDark={themeConfig.isDark}
            />

            {/* Note Editor Area */}
            {activeNote ? (
              <NoteEditor
                note={activeNote}
                notebook={activeNotebook}
                section={activeSection}
                onUpdateNote={handleUpdateNote}
                onOpenSummary={handleOpenSummary}
                onGenerateFlashcards={() => {
                  handleGenerateAIFlashcards(activeNote.id);
                  setActiveView("flashcards");
                }}
                onGenerateQuiz={() => {
                  handleGenerateAIQuiz(activeNote.id);
                  setActiveView("quizzes");
                }}
                onOpenConceptGraph={() => {
                  handleGenerateConceptMap(activeNote.id);
                  setActiveView("concept-map");
                }}
                onToggleAITutor={() => setIsAITutorOpen(!isAITutorOpen)}
                isAITutorOpen={isAITutorOpen}
                themeConfig={themeConfig}
                onApplyPolishedText={(polished) => {
                  handleUpdateNote({
                    ...activeNote,
                    content: polished,
                    updatedAt: new Date().toISOString(),
                  });
                  showToast("Polished note successfully!");
                }}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-zinc-400">
                <p>No note selected. Create or pick one from the sidebar.</p>
              </div>
            )}
          </>
        )}

        {/* View 2: Flashcard Spaced Repetition Arena */}
        {activeView === "flashcards" && (
          <FlashcardArena
            flashcards={flashcards}
            notes={notes}
            activeNoteId={activeNoteId}
            onReviewCard={handleReviewFlashcard}
            onGenerateAIFlashcards={handleGenerateAIFlashcards}
            onCreateCard={(newCard) => {
              setFlashcards((prev) => [newCard, ...prev]);
              showToast("Flashcard added!");
            }}
            onDeleteCard={(cardId) => {
              setFlashcards((prev) => prev.filter((c) => c.id !== cardId));
              showToast("Card deleted", "info");
            }}
            isDark={themeConfig.isDark}
          />
        )}

        {/* View 3: AI Diagnostic Quiz Arena */}
        {activeView === "quizzes" && (
          <QuizCenter
            quizzes={quizzes}
            notes={notes}
            activeNoteId={activeNoteId}
            onSaveQuizResult={handleSaveQuizResult}
            onGenerateAIQuiz={handleGenerateAIQuiz}
            isDark={themeConfig.isDark}
          />
        )}

        {/* View 4: Concept Map & Knowledge Mindmap */}
        {activeView === "concept-map" && activeNote && (
          <ConceptGraphView
            conceptMap={activeConceptMap}
            activeNote={activeNote}
            onGenerateConceptMap={handleGenerateConceptMap}
            isDark={themeConfig.isDark}
          />
        )}

        {/* View 5: Student Analytics & Mastery Stats */}
        {activeView === "study-stats" && (
          <StudyStatsView
            stats={stats}
            notes={notes}
            flashcards={flashcards}
            quizzes={quizzes}
            isDark={themeConfig.isDark}
          />
        )}

        {/* Socrates AI Copilot Tutor Sidebar Slideout */}
        <AITutorPanel
          isOpen={isAITutorOpen}
          onClose={() => setIsAITutorOpen(false)}
          note={activeNote}
          activeNote={activeNote}
          allNotes={notes}
          onInsertToNote={(text) => {
            if (activeNote) {
              handleUpdateNote({
                ...activeNote,
                content: (activeNote.content || "") + "\n\n" + text,
                updatedAt: new Date().toISOString(),
              });
              showToast("Inserted AI response to note!");
            }
          }}
          isDark={themeConfig.isDark}
        />
      </div>

      {/* 3. Global Modals */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={themeConfig}
        onUpdateTheme={(newCfg) => {
          setThemeConfig(newCfg);
          showToast(`Theme updated to ${newCfg.name}`);
        }}
      />

      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={activeSummary}
        noteTitle={activeNote?.title || "Current Note"}
        onInsertSummary={(text) => {
          if (activeNote) {
            handleUpdateNote({
              ...activeNote,
              content: (activeNote.content || "") + text,
              updatedAt: new Date().toISOString(),
            });
            showToast("Inserted summary into note!");
          }
        }}
        onRegenerate={async (mode) => {
          await handleOpenSummary(mode);
        }}
        isLoading={isSummaryLoading}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        notes={notes}
        notebooks={notebooks}
        sections={sections}
        flashcards={flashcards}
        quizzes={quizzes}
        stats={stats}
        onImportData={(data) => {
          setNotes(data.notes);
          setNotebooks(data.notebooks);
          setSections(data.sections);
          setFlashcards(data.flashcards);
          setQuizzes(data.quizzes);
          if (data.notes.length > 0) setActiveNoteId(data.notes[0].id);
          showToast("Workspace data restored successfully!");
        }}
      />

      {/* Footer Status Bar */}
      <footer className="h-7 border-t border-[#222] bg-[#0D0D0D] px-6 flex items-center justify-between text-[10px] text-[#666] font-mono select-none flex-shrink-0 z-20">
        <div>MODE: SOPHISTICATED_DARK // SYSTEM_VER: 4.2.0-STABLE</div>
        <div>IDEAFORGE AI INTEGRATED ENGINE // © 2026</div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xl border border-white/10 text-xs font-semibold animate-scaleUp">
          {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === "info" && <Sparkles className="w-4 h-4 text-blue-400" />}
          {toastMessage.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}

export default App;
