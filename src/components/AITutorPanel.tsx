import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, X, Lightbulb, HelpCircle, Flame, BookOpen, Copy, Check, ArrowRight } from "lucide-react";
import { ChatMessage, Note } from "../types";

interface AITutorPanelProps {
  note?: Note | null;
  activeNote?: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onInsertText?: (text: string) => void;
  onInsertToNote?: (text: string) => void;
  allNotes?: Note[];
  isDark?: boolean;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  note: propNote,
  activeNote,
  isOpen,
  onClose,
  onInsertText,
  onInsertToNote,
  isDark,
}) => {
  const note = propNote || activeNote || null;
  const insertHandler = onInsertToNote || onInsertText || (() => {});
  const noteTitle = note?.title || "Active Note";
  const noteContent = note?.content || "";

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "model",
      text: note
        ? `Hello! I'm your **Forge Intelligence Copilot** for *"**${note.title || "Untitled Note"}**"*. \n\nI can explain confusing terms, craft memorable mnemonics, predict tricky exam questions, or quiz your understanding. How can I help you master this material?`
        : `Hello! I'm your **Forge Intelligence Copilot**. Select a note from your notebook to begin grounded study assistance, or ask me any question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const sendMessage = async (customMessage?: string, actionType?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() && !actionType) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: actionType
        ? actionType === "mnemonic"
          ? "💡 Generate memorable mnemonics for this note"
          : actionType === "predict_exam"
          ? "🎯 Predict 3 probable tricky exam questions"
          : actionType === "find_gaps"
          ? "🔍 Find critical knowledge gaps or missing nuances"
          : textToSend
        : textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteTitle,
          noteContent,
          message: textToSend,
          actionType,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `mod-${Date.now()}`,
        role: "model",
        text: data.reply || "I analyzed your note. Let me know if you need more depth!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: `⚠️ Error reaching AI Tutor: ${err.message || "Please check connection"}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="ai-tutor-panel"
      className="fixed inset-y-0 right-0 w-full sm:w-[400px] z-40 flex flex-col shadow-2xl border-l border-[#222] bg-[#0F0F0F] text-[#E0E0E0] transition-all duration-300 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#222] bg-[#0D0D0D]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5 text-white">
              Forge Intelligence
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                Copilot
              </span>
            </h3>
            <p className="text-[11px] text-[#777] truncate max-w-[220px]">
              {noteTitle}
            </p>
          </div>
        </div>
        <button
          id="close-tutor-btn"
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#777] hover:text-white hover:bg-[#1A1A1A] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="p-3 bg-[#0A0A0A] border-b border-[#222] flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <button
          type="button"
          onClick={() => sendMessage("", "mnemonic")}
          disabled={loading}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A1A1A] text-amber-400 border border-[#333] hover:bg-[#222] transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          <span>Mnemonics</span>
        </button>
        <button
          type="button"
          onClick={() => sendMessage("", "predict_exam")}
          disabled={loading}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A1A1A] text-indigo-400 border border-[#333] hover:bg-[#222] transition-colors"
        >
          <Flame className="w-3 h-3" />
          <span>Predict Exam</span>
        </button>
        <button
          type="button"
          onClick={() => sendMessage("", "find_gaps")}
          disabled={loading}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A1A1A] text-violet-400 border border-[#333] hover:bg-[#222] transition-colors"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Find Gaps</span>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "model" && (
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-3 relative group ${
                m.role === "user"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-[#151515] border border-[#222] text-[#CCC]"
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>
              <div className="flex items-center justify-between mt-1.5 text-[9px] opacity-70">
                <span>{m.timestamp}</span>
                {m.role === "model" && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => copyMessage(m.text, m.id)}
                      className="p-1 hover:text-indigo-400"
                      title="Copy response"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHandler(`\n\n> **AI Tutor Insight:**\n${m.text}\n`)}
                      className="p-1 hover:text-indigo-400"
                      title="Insert into note"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {m.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-[#333] text-[#AAA] flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[#777] italic text-xs py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-100" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-200" />
            <span>Analyzing note concepts...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-3 border-t border-[#222] bg-[#0D0D0D] flex items-center gap-2"
      >
        <input
          id="tutor-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about this note..."
          disabled={loading}
          className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-lg px-3.5 py-2 text-xs focus:border-indigo-500 outline-none text-[#E0E0E0] placeholder-[#666] transition-colors"
        />
        <button
          id="send-tutor-msg-btn"
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 transition-all shadow-md shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
