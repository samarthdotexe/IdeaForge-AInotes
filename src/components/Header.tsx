import React from "react";
import { ActiveView, ThemeConfig, StudyStats } from "../types";
import { Sparkles, BookOpen, Layers, Award, Network, BarChart2, Palette, Flame, Plus, Search, Database, Moon, Sun } from "lucide-react";

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  themeConfig: ThemeConfig;
  onOpenThemeModal: () => void;
  onOpenExportModal: () => void;
  onQuickNewNote: () => void;
  stats: StudyStats;
  onToggleQuickDark: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  themeConfig,
  onOpenThemeModal,
  onOpenExportModal,
  onQuickNewNote,
  stats,
  onToggleQuickDark,
}) => {
  const navTabs: { id: ActiveView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "notes", label: "Notes", icon: BookOpen },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "quizzes", label: "Quiz Arena", icon: Award },
    { id: "concept-map", label: "Concept Graph", icon: Network },
    { id: "study-stats", label: "Analytics", icon: BarChart2 },
  ];

  return (
    <header className="h-16 border-b border-[#222] bg-[#0F0F0F] px-4 sm:px-6 flex items-center justify-between gap-3 select-none flex-shrink-0 z-30">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView("notes")}>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <span className="text-white font-bold text-base leading-none">F</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-semibold tracking-tight text-white flex items-center gap-1.5 leading-none">
              IdeaForge
              <span className="text-[10px] font-medium text-indigo-400 bg-indigo-400/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                Pro
              </span>
            </div>
            <div className="text-[10px] text-[#777] font-medium tracking-wide mt-0.5">
              AI Intelligent Note & Study Workspace
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-60 ml-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, tags..."
            className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E0E0E0] placeholder-[#666] focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#777] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Center: Main View Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#262626]">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-xs"
                  : "text-[#888] hover:bg-[#1A1A1A] hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-2">
        {/* Cloud Sync Status Indicator */}
        <div className="hidden xl:flex items-center bg-[#1A1A1A] rounded-full px-3 py-1 text-[11px] border border-[#333] text-[#AAA]">
          <span className="text-emerald-400 mr-2 text-[10px] animate-pulse">●</span>
          <span>Cloud Sync Active</span>
        </div>

        {/* Streak Chip */}
        <div
          onClick={() => setActiveView("study-stats")}
          className="cursor-pointer hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A1A1A] border border-[#333] text-amber-400 text-xs font-medium hover:bg-[#222] transition-colors"
          title="Daily Study Streak"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{stats.streakDays}d</span>
        </div>

        {/* Quick New Note Button */}
        <button
          id="header-quick-new-note"
          type="button"
          onClick={onQuickNewNote}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          title="Create New Note"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Note</span>
        </button>

        {/* Theme Customizer Trigger */}
        <button
          id="open-theme-btn"
          type="button"
          onClick={onOpenThemeModal}
          className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-[#888] hover:text-white text-xs transition-colors"
          title="Customize Theme & Paper"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Quick Dark Toggle */}
        <button
          id="toggle-dark-mode-btn"
          type="button"
          onClick={onToggleQuickDark}
          className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-[#888] hover:text-white text-xs transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {themeConfig.isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#888]" />}
        </button>

        {/* Export / Backup */}
        <button
          id="open-export-btn"
          type="button"
          onClick={onOpenExportModal}
          className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-[#888] hover:text-white text-xs transition-colors hidden sm:block"
          title="Backup & Restore"
        >
          <Database className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
