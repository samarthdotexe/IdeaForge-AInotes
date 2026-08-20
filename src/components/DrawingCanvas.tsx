import React, { useRef, useState, useEffect } from "react";
import { Pen, Highlighter, Eraser, RotateCcw, Trash2, Download, Square, Circle, ArrowRight, Minus } from "lucide-react";

interface DrawingCanvasProps {
  initialData?: string;
  onSave: (dataUrl: string) => void;
  isDark: boolean;
}

type Tool = "pen" | "highlighter" | "eraser" | "line" | "rect" | "circle" | "arrow";

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ initialData, onSave, isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>(isDark ? "#ffffff" : "#1e293b");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  const colors = isDark
    ? ["#ffffff", "#38bdf8", "#4ade80", "#f43f5e", "#fbbf24", "#c084fc", "#94a3b8"]
    : ["#0f172a", "#0284c7", "#16a34a", "#dc2626", "#d97706", "#9333ea", "#64748b"];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const prevData = canvas.toDataURL();
      canvas.width = container.clientWidth || 800;
      canvas.height = 480;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (initialData) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          saveState();
        };
        img.src = initialData;
      } else if (prevData && prevData.length > 50) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = prevData;
      }
    };

    resizeCanvas();
  }, [initialData]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]);
    onSave(canvas.toDataURL());
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
    onSave(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setStartX(x);
    setStartY(y);
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === "highlighter") {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth * 3.5;
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = strokeWidth * 4;
    } else {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    if (tool === "pen" || tool === "highlighter" || tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (snapshot) {
      // Shape drawing with live preview
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;

      if (tool === "line") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === "arrow") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
        // Arrow head
        const angle = Math.atan2(y - startY, x - startX);
        const headLen = 12 + strokeWidth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
    setIsDrawing(false);
    saveState();
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ideaforge-sketch-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div ref={containerRef} className="flex flex-col w-full rounded-xl border border-inherit overflow-hidden bg-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-black/5 dark:bg-white/5 border-b border-inherit text-xs select-none">
        {/* Tool selector */}
        <div className="flex items-center gap-1">
          <button
            id="tool-pen"
            type="button"
            onClick={() => setTool("pen")}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              tool === "pen"
                ? "bg-blue-600 text-white font-medium shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            title="Pen"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            id="tool-highlighter"
            type="button"
            onClick={() => setTool("highlighter")}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              tool === "highlighter"
                ? "bg-amber-500 text-white font-medium shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlight</span>
          </button>

          <button
            id="tool-eraser"
            type="button"
            onClick={() => setTool("eraser")}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              tool === "eraser"
                ? "bg-rose-600 text-white font-medium shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          <div className="w-[1px] h-4 bg-inherit mx-1" />

          {/* Shapes */}
          <button
            id="tool-line"
            type="button"
            onClick={() => setTool("line")}
            className={`p-1.5 rounded-lg transition-all ${
              tool === "line"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            title="Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            id="tool-arrow"
            type="button"
            onClick={() => setTool("arrow")}
            className={`p-1.5 rounded-lg transition-all ${
              tool === "arrow"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            title="Arrow"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="tool-rect"
            type="button"
            onClick={() => setTool("rect")}
            className={`p-1.5 rounded-lg transition-all ${
              tool === "rect"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            title="Rectangle"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            id="tool-circle"
            type="button"
            onClick={() => setTool("circle")}
            className={`p-1.5 rounded-lg transition-all ${
              tool === "circle"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            title="Circle"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Colors & Stroke */}
        <div className="flex items-center gap-2">
          {/* Palette */}
          <div className="flex items-center gap-1">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border transition-all ${
                  color === c ? "scale-115 ring-2 ring-blue-500 ring-offset-1" : "hover:scale-105 opacity-85"
                }`}
                style={{ backgroundColor: c, borderColor: isDark ? "#4b5563" : "#cbd5e1" }}
                title={`Color: ${c}`}
              />
            ))}
          </div>

          {/* Stroke width */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-inherit">
            <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-medium">Size</span>
            <input
              id="stroke-width-slider"
              type="range"
              min="1"
              max="12"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-16 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Undo & Clear & Download */}
          <div className="flex items-center gap-1 pl-1 border-l border-inherit">
            <button
              id="draw-undo-btn"
              type="button"
              onClick={undo}
              disabled={history.length <= 1}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              id="draw-clear-btn"
              type="button"
              onClick={clearCanvas}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-rose-500/10 hover:text-rose-500"
              title="Clear Canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="draw-download-btn"
              type="button"
              onClick={downloadDrawing}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
              title="Download PNG"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-[480px] bg-white/40 dark:bg-black/30 cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
