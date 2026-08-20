import React, { useState } from "react";
import { Flashcard, Note } from "../types";
import { Sparkles, Plus, CheckCircle2, RotateCw, HelpCircle, Flame, Layers, Award, ChevronLeft, ChevronRight, Shuffle, Volume2, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";

interface FlashcardArenaProps {
  flashcards: Flashcard[];
  notes: Note[];
  activeNoteId?: string;
  onUpdateCard: (card: Flashcard) => void;
  onAddCard: (card: Flashcard) => void;
  onDeleteCard: (cardId: string) => void;
  onGenerateAIFlashcards: (noteId: string, count: number) => Promise<void>;
  isDark: boolean;
}

export const FlashcardArena: React.FC<FlashcardArenaProps> = ({
  flashcards,
  notes,
  activeNoteId,
  onUpdateCard,
  onAddCard,
  onDeleteCard,
  onGenerateAIFlashcards,
  isDark,
}) => {
  const [selectedDeckFilter, setSelectedDeckFilter] = useState<string>(activeNoteId || "all");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newHint, setNewHint] = useState("");
  const [newCategory, setNewCategory] = useState("Concept");
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [sessionStats, setSessionStats] = useState({ studied: 0, easyCount: 0, hardCount: 0 });

  // Filtered cards
  const filteredCards = flashcards.filter((card) => {
    if (selectedDeckFilter === "all") return true;
    return card.noteId === selectedDeckFilter;
  });

  const currentCard = filteredCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleGrade = (quality: "again" | "hard" | "good" | "easy") => {
    if (!currentCard) return;

    let newInterval = 1;
    let newEase = currentCard.easeFactor || 2.5;
    let newScore = currentCard.masteryScore || 50;

    if (quality === "again") {
      newInterval = 1;
      newEase = Math.max(1.3, newEase - 0.2);
      newScore = Math.max(0, newScore - 20);
    } else if (quality === "hard") {
      newInterval = Math.max(1, Math.round(currentCard.intervalDays * 1.2));
      newEase = Math.max(1.3, newEase - 0.15);
      newScore = Math.min(100, newScore + 5);
    } else if (quality === "good") {
      newInterval = Math.max(2, Math.round(currentCard.intervalDays * newEase));
      newScore = Math.min(100, newScore + 15);
    } else if (quality === "easy") {
      newInterval = Math.max(4, Math.round(currentCard.intervalDays * newEase * 1.3));
      newEase = newEase + 0.15;
      newScore = Math.min(100, newScore + 25);
    }

    const updatedCard: Flashcard = {
      ...currentCard,
      repetitions: currentCard.repetitions + 1,
      intervalDays: newInterval,
      easeFactor: newEase,
      masteryScore: newScore,
      lastReviewedDate: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + newInterval * 86400000).toISOString(),
    };

    onUpdateCard(updatedCard);

    setSessionStats((prev) => ({
      studied: prev.studied + 1,
      easyCount: quality === "easy" || quality === "good" ? prev.easyCount + 1 : prev.easyCount,
      hardCount: quality === "again" || quality === "hard" ? prev.hardCount + 1 : prev.hardCount,
    }));

    if (currentIndex + 1 >= filteredCards.length) {
      setSessionCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setSessionCompleted(false);
    setSessionStats({ studied: 0, easyCount: 0, hardCount: 0 });
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard: Flashcard = {
      id: `fc-${Date.now()}`,
      noteId: selectedDeckFilter !== "all" ? selectedDeckFilter : notes[0]?.id || "default",
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      hint: newHint.trim() || undefined,
      category: newCategory.trim() || "Concept",
      difficulty: newDifficulty,
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      masteryScore: 0,
    };

    onAddCard(newCard);
    setNewQuestion("");
    setNewAnswer("");
    setNewHint("");
    setIsAddingNew(false);
  };

  const triggerAIGenerator = async () => {
    const targetNoteId = selectedDeckFilter !== "all" ? selectedDeckFilter : activeNoteId || notes[0]?.id;
    if (!targetNoteId) return;

    setIsGenerating(true);
    try {
      await onGenerateAIFlashcards(targetNoteId, 8);
    } finally {
      setIsGenerating(false);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Top Header & Deck Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Flashcard Study Arena</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Spaced repetition & active recall engine powered by SuperMemo SM-2
              </p>
            </div>
          </div>
        </div>

        {/* Deck filter + AI Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            id="deck-filter-select"
            value={selectedDeckFilter}
            onChange={(e) => {
              setSelectedDeckFilter(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
              setSessionCompleted(false);
            }}
            className="text-xs bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-stone-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Flashcard Decks ({flashcards.length} cards)</option>
            {notes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title} ({flashcards.filter((c) => c.noteId === n.id).length})
              </option>
            ))}
          </select>

          <button
            id="ai-generate-cards-btn"
            type="button"
            onClick={triggerAIGenerator}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Synthesizing..." : "AI Generate Cards"}</span>
          </button>

          <button
            id="add-custom-card-btn"
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-inherit hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Card</span>
          </button>
        </div>
      </div>

      {/* Manual Card Creator Form Modal/Drawer */}
      {isAddingNew && (
        <form
          onSubmit={handleCreateCard}
          className="my-4 p-5 rounded-2xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-blue-900 dark:text-blue-200">
              <Plus className="w-4 h-4" /> Create Custom Flashcard
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Front (Question / Prompt)
              </label>
              <textarea
                required
                rows={3}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. What is the role of ATP Synthase F_o subunit?"
                className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Back (Target Answer)
              </label>
              <textarea
                required
                rows={3}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="e.g. Transmembrane channel that conducts protons across the mitochondrial membrane..."
                className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[140px]">
              <input
                type="text"
                value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                placeholder="Optional Hint or Mnemonic"
                className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
                className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button
              id="save-card-btn"
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
            >
              Save Flashcard
            </button>
          </div>
        </form>
      )}

      {/* Main Flashcard Arena Body */}
      {filteredCards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">No Flashcards In This Deck</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-6">
            Generate high-yield cards from your active notes with AI or add your own cards to start practicing.
          </p>
          <button
            id="empty-deck-ai-generate"
            type="button"
            onClick={triggerAIGenerator}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "Synthesizing AI Cards..." : "AI Generate Cards from Notes"}</span>
          </button>
        </div>
      ) : sessionCompleted ? (
        /* Completed Celebratory View */
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-xl mb-4">
            <Award className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Deck Session Completed!</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mt-1 mb-6">
            Outstanding active recall work! You reviewed {sessionStats.studied} flashcards and reinforced your synaptic pathways.
          </p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {sessionStats.easyCount}
              </span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">
                Mastered / Retained
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {sessionStats.hardCount}
              </span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">
                Review Needed
              </p>
            </div>
          </div>

          <button
            id="restart-study-session-btn"
            type="button"
            onClick={restartSession}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg transition-all"
          >
            <RotateCw className="w-4 h-4" />
            <span>Study Deck Again</span>
          </button>
        </div>
      ) : (
        /* Active Study Card View */
        <div className="flex-1 flex flex-col justify-center py-6">
          {/* Progress & Card Index */}
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-3 px-2">
            <div className="flex items-center gap-2 font-medium">
              <span>Card {currentIndex + 1} of {filteredCards.length}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold uppercase">
                {currentCard?.category || "Concept"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Mastery: {currentCard?.masteryScore || 0}%
              </span>
              <button
                type="button"
                onClick={() => onDeleteCard(currentCard.id)}
                className="hover:text-rose-500 p-1"
                title="Delete Card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flippable Card Container */}
          <div
            id="active-flashcard"
            onClick={handleFlip}
            className="group relative w-full min-h-[320px] sm:min-h-[360px] cursor-pointer perspective-1000 select-none mb-6"
          >
            <div
              className={`w-full h-full rounded-3xl p-6 sm:p-10 border transition-all duration-500 flex flex-col justify-between shadow-xl backdrop-blur-md ${
                isFlipped
                  ? "bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-[#181a2e] dark:to-[#131422] border-indigo-500/40"
                  : "bg-white/90 dark:bg-[#151620] border-stone-200 dark:border-zinc-800 hover:border-blue-500/40"
              }`}
            >
              {/* Card Top Pill Badge */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider ${
                    isFlipped
                      ? "bg-indigo-600 text-white"
                      : "bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {isFlipped ? "Answer" : "Question"}
                </span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => speakText(isFlipped ? currentCard.answer : currentCard.question)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5"
                    title="Audio Speech"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {currentCard?.hint && !isFlipped && (
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium"
                      title="Toggle Hint"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>{showHint ? "Hide Hint" : "Hint"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Card Center Content */}
              <div className="my-auto py-6 text-center">
                <div
                  className={`text-base sm:text-xl font-medium leading-relaxed font-sans ${
                    isFlipped ? "text-indigo-950 dark:text-indigo-100" : "text-stone-900 dark:text-zinc-100"
                  }`}
                >
                  {isFlipped ? currentCard.answer : currentCard.question}
                </div>

                {/* Hint popover */}
                {showHint && !isFlipped && currentCard?.hint && (
                  <div className="mt-4 inline-block px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs italic animate-fadeIn">
                    💡 Hint: {currentCard.hint}
                  </div>
                )}
              </div>

              {/* Card Bottom Helper */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-3 border-t border-inherit">
                <span>Difficulty: <strong className="capitalize text-zinc-600 dark:text-zinc-300">{currentCard.difficulty}</strong></span>
                <span className="flex items-center gap-1 text-blue-500 font-medium">
                  <RotateCw className="w-3 h-3" /> Click anywhere to flip
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Controls: Grade & Pagination */}
          <div className="space-y-4">
            {isFlipped ? (
              /* Spaced Repetition Grading Buttons */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fadeIn">
                <button
                  id="grade-again-btn"
                  type="button"
                  onClick={() => handleGrade("again")}
                  className="flex flex-col items-center py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 transition-all font-medium text-xs shadow-sm active:scale-95"
                >
                  <span className="font-bold">Again</span>
                  <span className="text-[10px] opacity-75 mt-0.5">&lt; 1 day</span>
                </button>

                <button
                  id="grade-hard-btn"
                  type="button"
                  onClick={() => handleGrade("hard")}
                  className="flex flex-col items-center py-2.5 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 transition-all font-medium text-xs shadow-sm active:scale-95"
                >
                  <span className="font-bold">Hard</span>
                  <span className="text-[10px] opacity-75 mt-0.5">3 days</span>
                </button>

                <button
                  id="grade-good-btn"
                  type="button"
                  onClick={() => handleGrade("good")}
                  className="flex flex-col items-center py-2.5 px-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 transition-all font-medium text-xs shadow-sm active:scale-95"
                >
                  <span className="font-bold">Good</span>
                  <span className="text-[10px] opacity-75 mt-0.5">7 days</span>
                </button>

                <button
                  id="grade-easy-btn"
                  type="button"
                  onClick={() => handleGrade("easy")}
                  className="flex flex-col items-center py-2.5 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 transition-all font-medium text-xs shadow-sm active:scale-95"
                >
                  <span className="font-bold">Easy</span>
                  <span className="text-[10px] opacity-75 mt-0.5">14 days</span>
                </button>
              </div>
            ) : (
              /* Flip Prompt & Navigation */
              <div className="flex items-center justify-between">
                <button
                  id="prev-card-btn"
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-inherit hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  id="flip-card-btn"
                  type="button"
                  onClick={handleFlip}
                  className="flex-1 max-w-xs mx-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                >
                  Show Answer (Spacebar / Click)
                </button>

                <button
                  id="next-card-btn"
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === filteredCards.length - 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-inherit hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium disabled:opacity-30"
                >
                  <span>Skip</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
