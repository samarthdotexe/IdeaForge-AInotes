import type * as React from "react";
import { ThemeConfig, ThemeId, FontStyle, PaperPattern } from "./types";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  bgClass: string;
  sidebarBgClass: string;
  cardBgClass: string;
  activeItemClass: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  accentHex: string;
  accentBg: string;
  accentText: string;
  previewColors: string[];
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  "sophisticated-dark": {
    id: "sophisticated-dark",
    name: "Sophisticated Dark",
    tagline: "Matte obsidian canvas with luminous indigo and violet accents",
    isDark: true,
    bgClass: "bg-[#0A0A0A]",
    sidebarBgClass: "bg-[#0D0D0D]",
    cardBgClass: "bg-[#111111]",
    activeItemClass: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    textPrimary: "text-white",
    textSecondary: "text-[#E0E0E0]",
    textMuted: "text-[#777777]",
    borderColor: "border-[#222222]",
    accentHex: "#6366f1",
    accentBg: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20",
    accentText: "text-indigo-400",
    previewColors: ["#0A0A0A", "#0D0D0D", "#6366f1", "#10b981"],
  },
  "light-minimal": {
    id: "light-minimal",
    name: "Crisp Studio",
    tagline: "Clean, distraction-free Scandinavian paper aesthetic",
    isDark: false,
    bgClass: "bg-stone-50",
    sidebarBgClass: "bg-white",
    cardBgClass: "bg-white",
    activeItemClass: "bg-stone-100 text-stone-900 border-stone-300",
    textPrimary: "text-stone-900",
    textSecondary: "text-stone-700",
    textMuted: "text-stone-400",
    borderColor: "border-stone-200",
    accentHex: "#2563eb",
    accentBg: "bg-blue-600 hover:bg-blue-700 text-white",
    accentText: "text-blue-600",
    previewColors: ["#fafaf9", "#ffffff", "#2563eb", "#1c1917"],
  },
  "dark-obsidian": {
    id: "dark-obsidian",
    name: "Midnight Obsidian",
    tagline: "Deep OLED dark mode with violet luminescence",
    isDark: true,
    bgClass: "bg-[#0c0d12]",
    sidebarBgClass: "bg-[#12131a]",
    cardBgClass: "bg-[#181924]",
    activeItemClass: "bg-[#222436] text-white border-indigo-500/40",
    textPrimary: "text-zinc-100",
    textSecondary: "text-zinc-300",
    textMuted: "text-zinc-500",
    borderColor: "border-zinc-800",
    accentHex: "#6366f1",
    accentBg: "bg-indigo-600 hover:bg-indigo-500 text-white",
    accentText: "text-indigo-400",
    previewColors: ["#0c0d12", "#181924", "#6366f1", "#f4f4f5"],
  },
  "tokyo-neon": {
    id: "tokyo-neon",
    name: "Tokyo Cyber Neon",
    tagline: "High-contrast electric cyan and magenta for intense focus",
    isDark: true,
    bgClass: "bg-[#090a10]",
    sidebarBgClass: "bg-[#0f111a]",
    cardBgClass: "bg-[#141724]",
    activeItemClass: "bg-cyan-950/40 text-cyan-300 border-cyan-500/50",
    textPrimary: "text-slate-100",
    textSecondary: "text-slate-300",
    textMuted: "text-slate-500",
    borderColor: "border-slate-800",
    accentHex: "#06b6d4",
    accentBg: "bg-cyan-500 hover:bg-cyan-400 text-black font-semibold",
    accentText: "text-cyan-400",
    previewColors: ["#090a10", "#141724", "#06b6d4", "#ec4899"],
  },
  "sepia-academia": {
    id: "sepia-academia",
    name: "Sepia Dark Academia",
    tagline: "Warm vintage library parchment and aged leather vibe",
    isDark: false,
    bgClass: "bg-[#fbf7ee]",
    sidebarBgClass: "bg-[#f3edd9]",
    cardBgClass: "bg-[#fffdf7]",
    activeItemClass: "bg-[#e8dec0] text-[#3c2a1e] border-[#cbb896]",
    textPrimary: "text-[#2e2118]",
    textSecondary: "text-[#4d3a2d]",
    textMuted: "text-[#917965]",
    borderColor: "border-[#dfd3bc]",
    accentHex: "#a0522d",
    accentBg: "bg-[#8b4513] hover:bg-[#72380f] text-[#fdfbf7]",
    accentText: "text-[#8b4513]",
    previewColors: ["#fbf7ee", "#f3edd9", "#8b4513", "#2e2118"],
  },
  "nordic-frost": {
    id: "nordic-frost",
    name: "Nordic Frost",
    tagline: "Calm alpine slate and glacial ice blue tones",
    isDark: false,
    bgClass: "bg-[#f1f5f9]",
    sidebarBgClass: "bg-[#e2e8f0]",
    cardBgClass: "bg-[#ffffff]",
    activeItemClass: "bg-[#cbd5e1] text-slate-900 border-sky-400",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-700",
    textMuted: "text-slate-400",
    borderColor: "border-slate-300",
    accentHex: "#0284c7",
    accentBg: "bg-sky-600 hover:bg-sky-500 text-white",
    accentText: "text-sky-600",
    previewColors: ["#f1f5f9", "#ffffff", "#0284c7", "#0f172a"],
  },
  "emerald-forest": {
    id: "emerald-forest",
    name: "Emerald Sanctuary",
    tagline: "Natural forest greens and matcha calmness for low eye-strain",
    isDark: true,
    bgClass: "bg-[#0b1410]",
    sidebarBgClass: "bg-[#111e19]",
    cardBgClass: "bg-[#172822]",
    activeItemClass: "bg-[#213a31] text-emerald-300 border-emerald-500/40",
    textPrimary: "text-emerald-50",
    textSecondary: "text-emerald-200",
    textMuted: "text-emerald-600",
    borderColor: "border-emerald-900/60",
    accentHex: "#10b981",
    accentBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
    accentText: "text-emerald-400",
    previewColors: ["#0b1410", "#172822", "#10b981", "#ecfdf5"],
  },
  "cyberpunk-gold": {
    id: "cyberpunk-gold",
    name: "Cyberpunk Amber",
    tagline: "High-voltage amber and deep carbon fiber for late-night grind",
    isDark: true,
    bgClass: "bg-[#110f0b]",
    sidebarBgClass: "bg-[#1a1711]",
    cardBgClass: "bg-[#241f17]",
    activeItemClass: "bg-[#383022] text-amber-300 border-amber-500/50",
    textPrimary: "text-amber-100",
    textSecondary: "text-amber-200/80",
    textMuted: "text-amber-700",
    borderColor: "border-amber-900/40",
    accentHex: "#f59e0b",
    accentBg: "bg-amber-500 hover:bg-amber-400 text-black font-semibold",
    accentText: "text-amber-400",
    previewColors: ["#110f0b", "#241f17", "#f59e0b", "#fef3c7"],
  },
  "sunset-rose": {
    id: "sunset-rose",
    name: "Sunset Rose",
    tagline: "Warm dusky rose, mauve, and soft golden light",
    isDark: false,
    bgClass: "bg-[#fff1f2]",
    sidebarBgClass: "bg-[#ffe4e6]",
    cardBgClass: "bg-[#ffffff]",
    activeItemClass: "bg-[#fecdd3] text-rose-950 border-rose-400",
    textPrimary: "text-rose-950",
    textSecondary: "text-rose-800",
    textMuted: "text-rose-400",
    borderColor: "border-rose-200",
    accentHex: "#e11d48",
    accentBg: "bg-rose-600 hover:bg-rose-500 text-white",
    accentText: "text-rose-600",
    previewColors: ["#fff1f2", "#ffffff", "#e11d48", "#4c0519"],
  },
};

export const FONT_CLASSES: Record<FontStyle, string> = {
  sans: "font-sans",
  serif: "font-serif tracking-normal",
  mono: "font-mono text-[14px]",
  dyslexic: "font-sans tracking-wide leading-relaxed",
};

export const THEME_CONFIG_KEY = "ideaforge_theme_config";

export function getPaperPatternStyle(pattern: PaperPattern, isDark: boolean): React.CSSProperties {
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)";
  const dotColor = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
  const ruledColor = isDark ? "rgba(99, 102, 241, 0.12)" : "rgba(37, 99, 235, 0.08)";

  switch (pattern) {
    case "ruled":
      return {
        backgroundImage: `linear-gradient(${ruledColor} 1px, transparent 1px)`,
        backgroundSize: "100% 28px",
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      };
    case "dots":
      return {
        backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: "20px 20px",
      };
    case "cornell":
      return {
        backgroundImage: `linear-gradient(to right, ${isDark ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.2)"} 1px, transparent 1px)`,
        backgroundSize: "100% 100%",
        backgroundPosition: "28% 0",
      };
    case "blank":
    default:
      return {};
  }
}
