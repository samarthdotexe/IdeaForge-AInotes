import React, { useState } from "react";
import { ConceptMap, Note } from "../types";
import { Sparkles, Network, RefreshCw, Layers, ZoomIn, ZoomOut, Share2, Info } from "lucide-react";

interface ConceptGraphViewProps {
  conceptMap: ConceptMap | null;
  activeNote?: Note | null;
  onGenerateConceptMap: (noteId: string) => Promise<void>;
  isDark: boolean;
}

export const ConceptGraphView: React.FC<ConceptGraphViewProps> = ({
  conceptMap,
  activeNote,
  onGenerateConceptMap,
  isDark,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const selectedNode = conceptMap?.nodes.find((n) => n.id === selectedNodeId);
  const noteTitle = activeNote?.title || "Active Note";

  const handleGenerate = async () => {
    if (!activeNote?.id) return;
    setIsGenerating(true);
    try {
      await onGenerateConceptMap(activeNote.id);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-8 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AI Knowledge & Concept Graph</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive structural mindmap & semantic connections for <strong>"{noteTitle}"</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="refresh-concept-map-btn"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !activeNote}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Synthesizing Graph..." : "Generate Concept Graph"}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 mt-4 overflow-hidden">
        {/* Visual Graph Viewport */}
        <div className="flex-1 relative rounded-3xl border border-inherit bg-stone-50/50 dark:bg-[#10121d] overflow-hidden flex items-center justify-center p-6 select-none shadow-inner">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-inherit rounded-xl p-1 shadow-sm z-10">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 text-xs"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] px-1 font-mono text-zinc-500">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 text-xs"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {conceptMap && conceptMap.nodes && conceptMap.nodes.length > 0 ? (
            <div
              className="w-full h-full relative transition-transform duration-200 flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Central Theme Hub */}
              <div className="flex flex-col items-center gap-6 max-w-2xl w-full">
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl tracking-wide flex items-center gap-2 border border-white/20">
                  <Sparkles className="w-4 h-4" />
                  <span>{conceptMap.centralTheme || activeNote.title}</span>
                </div>

                {/* Nodes Grid / Flow */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                  {conceptMap.nodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const catColors: Record<string, string> = {
                      core: "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300",
                      subtopic: "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300",
                      principle: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                      example: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    };
                    const colorStyle = catColors[node.category] || catColors.core;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-md hover:scale-103 backdrop-blur-md flex flex-col justify-between ${
                          isSelected
                            ? "ring-2 ring-cyan-500 ring-offset-2 scale-103 bg-white dark:bg-zinc-800"
                            : "bg-white/80 dark:bg-zinc-900/80"
                        } ${colorStyle}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                            {node.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-zinc-100 leading-snug">
                          {node.label}
                        </h4>
                        {node.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {node.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Semantic Link badges */}
                {conceptMap.links && conceptMap.links.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    {conceptMap.links.slice(0, 6).map((link, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 rounded-full bg-stone-200 dark:bg-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{link.source}</span>
                        <span className="text-zinc-400">→ ({link.relation}) →</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{link.target}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <Network className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold">No Concept Map Generated Yet</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-6">
                Click below to let Socrates AI analyze this note and synthesize an interconnected knowledge graph.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? "Synthesizing Graph..." : "Generate AI Concept Graph"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Node Detail Inspector Sidebar */}
        {selectedNode && (
          <div className="w-full lg:w-80 rounded-3xl border border-inherit bg-white dark:bg-[#151620] p-5 shadow-xl flex flex-col justify-between animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  Concept Inspector
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-700"
                >
                  ✕
                </button>
              </div>

              <h3 className="font-bold text-base text-stone-900 dark:text-zinc-100 mb-2">
                {selectedNode.label}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                {selectedNode.description || "Core sub-concept extracted directly from the notes."}
              </p>

              {/* Related Links */}
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Connected Relations
              </h4>
              <div className="space-y-1.5">
                {conceptMap?.links
                  .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                  .map((l, i) => (
                    <div key={i} className="p-2 rounded-xl bg-stone-50 dark:bg-zinc-800/60 text-xs">
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">{l.relation}</span>:{" "}
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {l.source === selectedNode.id ? l.target : l.source}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t border-inherit text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Grounded in note: {noteTitle}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
