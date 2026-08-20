import React from "react";
import { ThemeConfig, ThemeId, FontStyle, PaperPattern } from "../types";
import { THEMES } from "../themes";
import { Palette, Type, Grid, Check, Sparkles, X } from "lucide-react";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onUpdateTheme: (newConfig: ThemeConfig) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onUpdateTheme,
}) => {
  if (!isOpen) return null;

  const fontOptions: { id: FontStyle; name: string; desc: string }[] = [
    { id: "sans", name: "Plus Jakarta Sans", desc: "Crisp, modern, high legibility" },
    { id: "serif", name: "Merriweather Serif", desc: "Refined, literary reading experience" },
    { id: "mono", name: "JetBrains Mono", desc: "Precise, code & formula alignment" },
    { id: "dyslexic", name: "Dyslexic Friendly", desc: "Wide tracking & clear letter shapes" },
  ];

  const paperOptions: { id: PaperPattern; name: string; desc: string }[] = [
    { id: "blank", name: "Clean Blank", desc: "Pure distraction-free canvas" },
    { id: "ruled", name: "College Ruled", desc: "Classic lined notebook paper" },
    { id: "grid", name: "Engineering Grid", desc: "Precision graph paper for diagrams" },
    { id: "dots", name: "Dot Matrix", desc: "Bullet journal aesthetic" },
    { id: "cornell", name: "Cornell Matrix", desc: "Left cue split line layout" },
  ];

  const handleSelectTheme = (themeId: ThemeId) => {
    const target = THEMES[themeId];
    onUpdateTheme({
      ...currentTheme,
      id: themeId,
      name: target.name,
      isDark: target.isDark,
      accentColor: target.accentHex,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#12131c] border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-scaleUp text-stone-900 dark:text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Studio Theme & Styling Engine</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Custom presets, typography, paper grids & student aesthetics
              </p>
            </div>
          </div>
          <button
            id="close-theme-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Theme Presets Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Theme Aesthetics ({Object.keys(THEMES).length} Presets)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(THEMES).map((th) => {
              const isSelected = currentTheme.id === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => handleSelectTheme(th.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between h-28 group shadow-sm ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20"
                      : "border-stone-200 dark:border-zinc-800 hover:border-stone-400 dark:hover:border-zinc-600 bg-stone-50/50 dark:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {th.previewColors.map((colorHex, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10"
                          style={{ backgroundColor: colorHex }}
                        />
                      ))}
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-xs leading-tight text-stone-900 dark:text-zinc-100">
                      {th.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {th.isDark ? "Dark OLED" : "Light Studio"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Paper Grid Patterns */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-blue-500" />
            <span>Note Paper Background Pattern</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {paperOptions.map((opt) => {
              const isSelected = currentTheme.paperPattern === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateTheme({ ...currentTheme, paperPattern: opt.id })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-300 font-semibold"
                      : "border-stone-200 dark:border-zinc-800 hover:border-stone-400 dark:hover:border-zinc-700 bg-stone-50/30 dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <div className="text-xs">{opt.name}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Typography Styles */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-purple-500" />
            <span>Font Family & Readability</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fontOptions.map((f) => {
              const isSelected = currentTheme.fontStyle === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateTheme({ ...currentTheme, fontStyle: f.id })}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-semibold"
                      : "border-stone-200 dark:border-zinc-800 hover:border-stone-400 dark:hover:border-zinc-700 bg-stone-50/30 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{f.name}</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{f.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-inherit flex items-center justify-between">
          <span className="text-xs text-zinc-500">All styling preferences persist locally.</span>
          <button
            id="theme-done-btn"
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Apply Styling
          </button>
        </div>
      </div>
    </div>
  );
};
