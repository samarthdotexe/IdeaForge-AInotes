import React, { useState, useEffect } from "react";
import { Quiz, QuizQuestion, Note } from "../types";
import { Sparkles, CheckCircle, XCircle, Clock, Award, RotateCcw, ArrowRight, HelpCircle, FileText, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizCenterProps {
  quizzes: Quiz[];
  notes: Note[];
  activeNoteId?: string;
  onSaveQuizResult: (quiz: Quiz) => void;
  onGenerateAIQuiz: (noteId: string, questionCount: number, difficulty: string) => Promise<Quiz | null>;
  isDark: boolean;
}

export const QuizCenter: React.FC<QuizCenterProps> = ({
  quizzes,
  notes,
  activeNoteId,
  onSaveQuizResult,
  onGenerateAIQuiz,
  isDark,
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizzes[0]?.id || "");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(quizzes[0] || null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showInstantExplanation, setShowInstantExplanation] = useState<boolean>(true);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // New Quiz Generator Modal State
  const [showGenModal, setShowGenModal] = useState<boolean>(false);
  const [genNoteId, setGenNoteId] = useState<string>(activeNoteId || notes[0]?.id || "");
  const [genCount, setGenCount] = useState<number>(6);
  const [genDifficulty, setGenDifficulty] = useState<string>("mixed");

  useEffect(() => {
    if (selectedQuizId) {
      const found = quizzes.find((q) => q.id === selectedQuizId);
      if (found) {
        setActiveQuiz(found);
        setUserAnswers({});
        setIsSubmitted(false);
        setTimerSeconds(0);
        setIsTimerRunning(true);
      }
    }
  }, [selectedQuizId, quizzes]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isSubmitted) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleToggleHint = (questionId: string) => {
    setRevealedHints((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    const evaluatedQuestions: QuizQuestion[] = activeQuiz.questions.map((q) => {
      const uAns = (userAnswers[q.id] || "").trim().toLowerCase();
      const cAns = q.correctAnswer.trim().toLowerCase();
      const isCorrect = uAns === cAns;
      if (isCorrect) correctCount++;
      return {
        ...q,
        userAnswer: userAnswers[q.id] || "",
        isCorrect,
      };
    });

    const finalScore = Math.round((correctCount / activeQuiz.questions.length) * 100);
    const completedQuiz: Quiz = {
      ...activeQuiz,
      questions: evaluatedQuestions,
      score: finalScore,
      completedAt: new Date().toISOString(),
    };

    setActiveQuiz(completedQuiz);
    setIsSubmitted(true);
    setIsTimerRunning(false);
    onSaveQuizResult(completedQuiz);

    if (finalScore >= 80) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    if (activeQuiz) {
      const resetQuestions = activeQuiz.questions.map((q) => ({
        ...q,
        userAnswer: undefined,
        isCorrect: undefined,
      }));
      setActiveQuiz({ ...activeQuiz, questions: resetQuestions, score: undefined });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genNoteId) return;

    setIsGenerating(true);
    try {
      const newQuiz = await onGenerateAIQuiz(genNoteId, genCount, genDifficulty);
      if (newQuiz) {
        setSelectedQuizId(newQuiz.id);
        setShowGenModal(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AI Diagnostic Quiz Center</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Exam simulations with multi-choice, true/false, fill-in-the-blank & instant feedback
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            id="quiz-selector"
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="text-xs bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-stone-800 dark:text-zinc-200 focus:ring-2 focus:ring-purple-500"
          >
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} {q.score !== undefined ? `(${q.score}%)` : ""}
              </option>
            ))}
          </select>

          <button
            id="open-quiz-generator-btn"
            type="button"
            onClick={() => setShowGenModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New AI Quiz</span>
          </button>
        </div>
      </div>

      {/* Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleGenerate}
            className="w-full max-w-md bg-white dark:bg-[#151620] border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-stone-900 dark:text-zinc-100"
          >
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI Quiz Creator
              </h3>
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Source Study Note
              </label>
              <select
                value={genNoteId}
                onChange={(e) => setGenNoteId(e.target.value)}
                className="w-full bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs"
              >
                {notes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Questions Count
                </label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs"
                >
                  <option value={4}>4 Questions (Quick)</option>
                  <option value={6}>6 Questions (Standard)</option>
                  <option value={10}>10 Questions (Midterm)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Difficulty Setting
                </label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs"
                >
                  <option value="mixed">Mixed Tier</option>
                  <option value="hard">Challenging / Honors</option>
                  <option value="conceptual">Concept & Definitions</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? "Crafting Exam..." : "Generate Exam"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Quiz Header & Timer */}
      {activeQuiz ? (
        <div className="py-6 space-y-6">
          {/* Top Metric Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-stone-100 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-bold leading-tight">{activeQuiz.title}</h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Source: {activeQuiz.noteTitle} • {activeQuiz.questions.length} questions
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Time: {formatTime(timerSeconds)}</span>
              </div>

              {isSubmitted && activeQuiz.score !== undefined && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${
                    activeQuiz.score >= 80
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : activeQuiz.score >= 60
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Score: {activeQuiz.score}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Exam Score Summary if Submitted */}
          {isSubmitted && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 text-center animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold">
                {activeQuiz.score! >= 90
                  ? "Flawless Performance (A+)!"
                  : activeQuiz.score! >= 75
                  ? "Great Command of Concepts (A)!"
                  : activeQuiz.score! >= 60
                  ? "Passing Grade (B) — Review Gaps Below"
                  : "Needs Focused Revision (C/D)"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
                You answered{" "}
                {activeQuiz.questions.filter((q) => q.isCorrect).length} of{" "}
                {activeQuiz.questions.length} questions correctly in{" "}
                {formatTime(timerSeconds)}.
              </p>
              <button
                type="button"
                onClick={handleRetakeQuiz}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake This Exam</span>
              </button>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {activeQuiz.questions.map((q, idx) => {
              const currentAns = userAnswers[q.id] || "";
              const hasAnswered = currentAns.length > 0;
              const isCorrect = isSubmitted
                ? q.isCorrect
                : currentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    isSubmitted
                      ? q.isCorrect
                        ? "bg-emerald-500/[0.04] border-emerald-500/30"
                        : "bg-rose-500/[0.04] border-rose-500/30"
                      : "bg-white dark:bg-[#151620] border-stone-200 dark:border-zinc-800 shadow-sm"
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold uppercase">
                        {q.type.replace("_", " ")}
                      </span>
                    </div>

                    {q.hint && !isSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleToggleHint(q.id)}
                        className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium hover:underline"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{revealedHints[q.id] ? "Hide Hint" : "Hint"}</span>
                      </button>
                    )}
                  </div>

                  {/* Question statement */}
                  <p className="text-sm sm:text-base font-semibold mb-4 text-stone-900 dark:text-zinc-100">
                    {q.question}
                  </p>

                  {/* Hint Reveal */}
                  {revealedHints[q.id] && q.hint && !isSubmitted && (
                    <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs italic">
                      💡 {q.hint}
                    </div>
                  )}

                  {/* Options / Input based on question type */}
                  {q.type === "mcq" || q.type === "true_false" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(q.options || ["True", "False"]).map((opt) => {
                        const isSelected = currentAns === opt;
                        const isThisCorrect = opt === q.correctAnswer;

                        let optClasses =
                          "border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/60 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-800 dark:text-zinc-200";

                        if (isSubmitted) {
                          if (isThisCorrect) {
                            optClasses =
                              "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-medium";
                          } else if (isSelected && !isThisCorrect) {
                            optClasses =
                              "border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-300 line-through";
                          }
                        } else if (isSelected) {
                          optClasses =
                            "border-purple-600 bg-purple-600/10 text-purple-700 dark:text-purple-300 font-medium ring-1 ring-purple-600";
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${optClasses}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && isThisCorrect && (
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            )}
                            {isSubmitted && isSelected && !isThisCorrect && (
                              <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fill in the blank input */
                    <div className="space-y-2">
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={currentAns}
                        onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full sm:w-80 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {/* AI Explanation (Shown when submitted or instant explanation enabled) */}
                  {isSubmitted && (
                    <div className="mt-4 pt-3 border-t border-inherit text-xs space-y-1">
                      <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {q.isCorrect ? "✅ Correct Answer" : "❌ Explanation:"}
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                        {q.explanation}
                      </p>
                      {!q.isCorrect && (
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Target Answer: <strong>{q.correctAnswer}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Exam Button */}
          {!isSubmitted && (
            <div className="flex justify-end pt-4">
              <button
                id="submit-quiz-btn"
                type="button"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length === 0}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-40"
              >
                <span>Submit Diagnostic Exam</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
          <p className="text-xs text-zinc-500">No active quizzes found.</p>
        </div>
      )}
    </div>
  );
};
