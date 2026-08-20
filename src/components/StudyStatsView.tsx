import React from "react";
import { StudyStats, Note, Flashcard, Quiz } from "../types";
import { Flame, Brain, Award, Clock, BookOpen, CheckCircle, TrendingUp, Sparkles, Calendar } from "lucide-react";

interface StudyStatsViewProps {
  stats: StudyStats;
  notes: Note[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  isDark: boolean;
}

export const StudyStatsView: React.FC<StudyStatsViewProps> = ({
  stats,
  notes,
  flashcards,
  quizzes,
  isDark,
}) => {
  const masteredCards = flashcards.filter((c) => (c.masteryScore || 0) >= 80).length;
  const inProgressCards = flashcards.filter((c) => (c.masteryScore || 0) > 0 && (c.masteryScore || 0) < 80).length;
  const newCards = flashcards.length - masteredCards - inProgressCards;

  const totalWords = notes.reduce((acc, n) => acc + (n.content?.split(/\s+/).length || 0), 0);

  const completedQuizzes = quizzes.filter((q) => q.score !== undefined);
  const avgQuizScore = completedQuizzes.length
    ? Math.round(completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) / completedQuizzes.length)
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Student Study Analytics & Retention Hub</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Cognitive mastery metrics, spaced repetition progression & exam readiness
            </p>
          </div>
        </div>

        {/* Streak Highlight Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          <div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {stats.streakDays} Day Active Streak!
            </div>
            <div className="text-[10px] text-zinc-500">Keep learning daily</div>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Bento Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151620] border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Notes</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-zinc-100">
              {notes.length}
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">~{totalWords.toLocaleString()} words authored</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#151620] border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cards Mastered</span>
            <Brain className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-zinc-100">
              {masteredCards} <span className="text-sm font-normal text-zinc-400">/ {flashcards.length}</span>
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              {flashcards.length ? Math.round((masteredCards / flashcards.length) * 100) : 0}% retention rate
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#151620] border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Exam Score</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-zinc-100">
              {avgQuizScore}%
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">{completedQuizzes.length} exams completed</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#151620] border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Study Time</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-zinc-100">
              {Math.round(stats.totalStudyMinutes / 60)}h {stats.totalStudyMinutes % 60}m
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">Active cognitive focus</p>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Mastery & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Heatmap / Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#151620] border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm">Study Activity & Recall Log</h3>
              <p className="text-xs text-zinc-500">Cards reviewed & notes engaged per day</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High Momentum
            </span>
          </div>

          {/* Simple Clean Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 px-2 border-b border-inherit">
            {stats.activityHistory.map((item, idx) => {
              const maxCount = Math.max(...stats.activityHistory.map((h) => h.count), 25);
              const heightPercent = Math.round((item.count / maxCount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold text-blue-500">
                    {item.count}
                  </div>
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-xl transition-all duration-500 hover:brightness-110"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  />
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-3">
            <span>Consistent daily review doubles long-term memory retention.</span>
            <span className="font-semibold text-stone-800 dark:text-zinc-200">
              SM-2 Algorithm Active
            </span>
          </div>
        </div>

        {/* Right 1 Col: Memory Retention Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#151620] border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm mb-1">Knowledge Deck Distribution</h3>
            <p className="text-xs text-zinc-500 mb-4">Breakdown across spaced repetition buckets</p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">Mastered (≥80%)</span>
                  <span>{masteredCards} cards</span>
                </div>
                <div className="w-full h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${flashcards.length ? (masteredCards / flashcards.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span className="text-amber-600 dark:text-amber-400">In Progress (&lt;80%)</span>
                  <span>{inProgressCards} cards</span>
                </div>
                <div className="w-full h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${flashcards.length ? (inProgressCards / flashcards.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span className="text-blue-600 dark:text-blue-400">New / Unstudied</span>
                  <span>{newCards} cards</span>
                </div>
                <div className="w-full h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${flashcards.length ? (newCards / flashcards.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-800 dark:text-indigo-300">
            <div className="font-semibold flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" /> Pro Study Tip
            </div>
            Generate a 5-question AI quiz immediately after taking a note to lock in the Ebbinghaus forgetting curve protection.
          </div>
        </div>
      </div>
    </div>
  );
};
