import React, { useState } from "react";
import { Notebook, Section, Note } from "../types";
import { Folder, FolderPlus, FileText, Plus, Pin, Star, ChevronRight, ChevronDown, Tag, Trash2, Copy, Sparkles, Book, MoreVertical, Check } from "lucide-react";

interface SidebarProps {
  notebooks: Notebook[];
  sections: Section[];
  notes: Note[];
  activeNotebookId: string;
  setActiveNotebookId: (id: string) => void;
  activeSectionId: string;
  setActiveSectionId: (id: string) => void;
  activeNoteId: string;
  setActiveNoteId: (id: string) => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;
  onAddNotebook: (title: string, color: string, icon: string) => void;
  onAddSection: (notebookId: string, title: string, color: string) => void;
  onAddNote: (notebookId: string, sectionId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onDuplicateNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  isDark: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notebooks,
  sections,
  notes,
  activeNotebookId,
  setActiveNotebookId,
  activeSectionId,
  setActiveSectionId,
  activeNoteId,
  setActiveNoteId,
  selectedTagFilter,
  setSelectedTagFilter,
  onAddNotebook,
  onAddSection,
  onAddNote,
  onDeleteNote,
  onDuplicateNote,
  onTogglePin,
  onToggleFavorite,
  isDark,
}) => {
  const [isAddingNotebook, setIsAddingNotebook] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [newNotebookColor, setNewNotebookColor] = useState("#3b82f6");

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const [collapsedNotebooks, setCollapsedNotebooks] = useState<Record<string, boolean>>({});

  // Collect all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  // Filter notes by active section, notebook, or tag
  const filteredNotes = notes.filter((n) => {
    if (selectedTagFilter) {
      return n.tags?.includes(selectedTagFilter);
    }
    if (activeSectionId) {
      return n.sectionId === activeSectionId;
    }
    if (activeNotebookId) {
      return n.notebookId === activeNotebookId;
    }
    return true;
  });

  // Pinned vs Regular Notes
  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const regularNotes = filteredNotes.filter((n) => !n.isPinned);

  const activeNotebook = notebooks.find((nb) => nb.id === activeNotebookId);
  const activeNotebookSections = sections.filter((s) => s.notebookId === activeNotebookId);

  const handleCreateNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;
    onAddNotebook(newNotebookTitle.trim(), newNotebookColor, "Book");
    setNewNotebookTitle("");
    setIsAddingNotebook(false);
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    onAddSection(activeNotebookId || notebooks[0]?.id, newSectionTitle.trim(), "#3b82f6");
    setNewSectionTitle("");
    setIsAddingSection(false);
  };

  const colorsList = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

  return (
    <aside className="w-full md:w-80 lg:w-88 border-r border-[#222] bg-[#0D0D0D] flex flex-col h-full overflow-hidden select-none flex-shrink-0 text-[#E0E0E0]">
      {/* 1. Notebooks Selector & Header */}
      <div className="p-3.5 border-b border-[#222] space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#555] font-bold">
          <span>Notebooks & Courses</span>
          <button
            id="add-notebook-btn"
            type="button"
            onClick={() => setIsAddingNotebook(!isAddingNotebook)}
            className="p-1 rounded-md hover:bg-[#1A1A1A] text-[#888] hover:text-white transition-colors"
            title="Create Notebook"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notebooks Horizontal / Vertical Dropdown List */}
        <div className="flex flex-col gap-1 max-h-36 overflow-y-auto no-scrollbar">
          {notebooks.map((nb) => {
            const isSelected = activeNotebookId === nb.id;
            const count = notes.filter((n) => n.notebookId === nb.id).length;
            return (
              <button
                key={nb.id}
                type="button"
                onClick={() => {
                  setActiveNotebookId(nb.id);
                  const firstSec = sections.find((s) => s.notebookId === nb.id);
                  if (firstSec) setActiveSectionId(firstSec.id);
                  setSelectedTagFilter(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                  isSelected
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    : "text-[#888] hover:bg-[#1A1A1A] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: nb.color }}
                  />
                  <span className="truncate">{nb.title}</span>
                </div>
                <span className="text-[10px] text-[#666] px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#222] font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add Notebook Inline Form */}
        {isAddingNotebook && (
          <form onSubmit={handleCreateNotebook} className="p-2.5 rounded-xl bg-[#151515] border border-[#333] space-y-2 animate-fadeIn">
            <input
              type="text"
              required
              value={newNotebookTitle}
              onChange={(e) => setNewNotebookTitle(e.target.value)}
              placeholder="e.g. CS 182: Deep Learning"
              className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#666] focus:border-indigo-500 outline-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {colorsList.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewNotebookColor(c)}
                    className={`w-3.5 h-3.5 rounded-full ${newNotebookColor === c ? "ring-2 ring-indigo-400" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNotebook(false)}
                  className="px-2 py-0.5 text-[10px] text-[#777] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 2. Sections Tabs (OneNote Style) */}
      <div className="p-3 border-b border-[#222] space-y-1.5 bg-[#0A0A0A]/40">
        <div className="flex items-center justify-between text-[10px] text-[#555] font-bold uppercase tracking-widest">
          <span>Sections ({activeNotebookSections.length})</span>
          <button
            id="add-section-btn"
            type="button"
            onClick={() => setIsAddingSection(!isAddingSection)}
            className="text-[10px] text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" /> Section
          </button>
        </div>

        {/* Section Chips */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveSectionId("");
              setSelectedTagFilter(null);
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              !activeSectionId && !selectedTagFilter
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-[#1A1A1A] text-[#888] hover:text-white border border-[#262626] hover:bg-[#222]"
            }`}
          >
            All Sections
          </button>
          {activeNotebookSections.map((sec) => {
            const isSecActive = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveSectionId(sec.id);
                  setSelectedTagFilter(null);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium truncate max-w-[160px] transition-colors ${
                  isSecActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-[#1A1A1A] text-[#888] hover:text-white border border-[#262626] hover:bg-[#222]"
                }`}
              >
                {sec.title}
              </button>
            );
          })}
        </div>

        {/* Inline Add Section Form */}
        {isAddingSection && (
          <form onSubmit={handleCreateSection} className="p-2 rounded-xl bg-[#151515] border border-[#333] flex items-center gap-1 mt-1">
            <input
              type="text"
              required
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="New section name..."
              className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-lg px-2 py-0.5 text-xs text-white placeholder-[#666] focus:border-indigo-500 outline-none"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Add
            </button>
          </form>
        )}
      </div>

      {/* 3. Tags Filter Bar (if tags exist) */}
      {allTags.length > 0 && (
        <div className="px-3 py-2 border-b border-[#222] flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px]">
          <Tag className="w-3 h-3 text-[#555] flex-shrink-0" />
          <button
            type="button"
            onClick={() => setSelectedTagFilter(null)}
            className={`px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
              selectedTagFilter === null
                ? "bg-[#333] text-white"
                : "bg-[#1A1A1A] text-[#777] hover:text-white"
            }`}
          >
            All Tags
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTagFilter(selectedTagFilter === t ? null : t)}
              className={`px-2 py-0.5 rounded-full flex-shrink-0 font-medium transition-colors ${
                selectedTagFilter === t
                  ? "bg-indigo-600 text-white"
                  : "bg-[#1A1A1A] text-[#888] hover:text-white border border-[#222]"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {/* 4. Notes List (Main Scroll Area) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {/* Pinned Section */}
        {pinnedNotes.length > 0 && (
          <div className="mb-2">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1">
              <Pin className="w-3 h-3" />
              <span>Pinned Notes ({pinnedNotes.length})</span>
            </div>
            {pinnedNotes.map((n) => renderNoteCard(n))}
          </div>
        )}

        {/* Regular Notes */}
        {regularNotes.length > 0 ? (
          <div>
            {pinnedNotes.length > 0 && (
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#555]">
                All Notes ({regularNotes.length})
              </div>
            )}
            {regularNotes.map((n) => renderNoteCard(n))}
          </div>
        ) : pinnedNotes.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#666]">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No notes in this view.</p>
            <button
              type="button"
              onClick={() => onAddNote(activeNotebookId || notebooks[0]?.id, activeSectionId || sections[0]?.id)}
              className="mt-2 text-indigo-400 font-semibold hover:underline"
            >
              + Create First Note
            </button>
          </div>
        ) : null}
      </div>

      {/* AI Intelligence Quota widget */}
      <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#333] mb-2 mx-3">
        <div className="flex items-center justify-between text-xs text-[#888] mb-1.5 font-medium">
          <span>AI Quota</span>
          <span className="text-indigo-400 font-mono text-[11px]">85% used</span>
        </div>
        <div className="w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full w-[85%] rounded-full"></div>
        </div>
      </div>

      {/* 5. Bottom New Note Action */}
      <div className="p-3 border-t border-[#222] bg-[#0D0D0D]">
        <button
          id="sidebar-create-note-btn"
          type="button"
          onClick={() => onAddNote(activeNotebookId || notebooks[0]?.id, activeSectionId || sections[0]?.id)}
          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New Note Page</span>
        </button>
      </div>
    </aside>
  );

  function renderNoteCard(note: Note) {
    const isSelected = activeNoteId === note.id;
    return (
      <div
        key={note.id}
        onClick={() => setActiveNoteId(note.id)}
        className={`group p-3 rounded-xl border text-left cursor-pointer transition-all relative ${
          isSelected
            ? "bg-[#181818] border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20"
            : "bg-[#111111] border-[#222] hover:bg-[#161616] hover:border-[#333]"
        }`}
      >
        <div className="flex items-start justify-between gap-1 mb-1">
          <h4
            className={`font-semibold text-xs leading-snug line-clamp-1 ${
              isSelected ? "text-indigo-300" : "text-[#DDD]"
            }`}
          >
            {note.title || "Untitled Note"}
          </h4>

          {/* Quick Icons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              className={`p-1 rounded hover:bg-[#222] ${
                note.isPinned ? "text-amber-400 opacity-100" : "text-[#777]"
              }`}
              title={note.isPinned ? "Unpin" : "Pin to Top"}
            >
              <Pin className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateNote(note.id);
              }}
              className="p-1 rounded text-[#777] hover:text-white hover:bg-[#222]"
              title="Duplicate Note"
            >
              <Copy className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
              className="p-1 rounded text-[#777] hover:text-rose-400 hover:bg-rose-500/10"
              title="Delete Note"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content Snippet */}
        <p className="text-[11px] text-[#888] line-clamp-2 leading-relaxed font-sans">
          {note.content?.replace(/#|\*|>|`/g, "") || "Empty note body..."}
        </p>

        {/* Tags & Date footer */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#222] text-[10px] text-[#666]">
          <div className="flex items-center gap-1 overflow-hidden">
            {note.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.2 rounded bg-[#1C1C1C] border border-[#282828] text-indigo-300 truncate max-w-[80px]"
              >
                #{tag}
              </span>
            ))}
            {(note.tags?.length || 0) > 2 && (
              <span className="text-[9px] text-[#666]">+{note.tags.length - 2}</span>
            )}
          </div>
          <span className="font-mono text-[9px] text-[#555]">{note.updatedAt?.slice(5, 10)}</span>
        </div>
      </div>
    );
  }
};
