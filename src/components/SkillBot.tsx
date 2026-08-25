"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  resources?: any[];
  suggestions?: string[];
  timestamp: Date;
}

export default function SkillBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "👋 **Hi! I'm SkillBot!**\n\nI can help you find free resources, create study plans, and answer CS questions.\n\nWhat would you like to learn?",
      suggestions: ["Learn Python", "Learn DSA", "Show learning roadmap"],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/p2p/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: data.text,
        resources: data.resources,
        suggestions: data.suggestions,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          text: "Sorry, I encountered an error. Please try again!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text: string) => {
    // Sanitize HTML entities first to prevent XSS
    const escapeHtml = (str: string) => str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    return text
      .split("\n")
      .map((line) => {
        let safe = escapeHtml(line);
        // Bold (only after escaping)
        safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
        // Bullet points
        if (safe.startsWith("• ") || safe.startsWith("- ")) {
          return `<div class="flex gap-2 ml-2"><span class="text-orange-400">•</span><span>${safe.slice(2)}</span></div>`;
        }
        return `<div>${safe}</div>`;
      })
      .join("");
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? "bg-slate-800 hover:bg-slate-700 shadow-slate-800/25"
            : "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
        }`}
      >
        {isOpen ? (
          <span className="text-white text-xl">✕</span>
        ) : (
          <div className="relative">
            <span className="text-white text-xl">🤖</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">SkillBot</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white/70 text-xs">Always available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[340px] overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] ${
                  msg.type === "user"
                    ? "bg-orange-500 text-white rounded-2xl rounded-br-md px-4 py-3"
                    : "bg-slate-100 text-slate-700 rounded-2xl rounded-bl-md px-4 py-3"
                }`}
              >
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />

                {/* Resources */}
                {msg.resources && msg.resources.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.resources.slice(0, 3).map((r: any) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2.5 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {r.platform === "YouTube" ? "🎥" : r.platform === "NPTEL" ? "🎓" : r.platform === "LeetCode" || r.platform === "HackerRank" ? "💻" : "📖"}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate">{r.title}</div>
                            <div className="text-[10px] text-slate-400">{r.platform} • {r.difficulty}</div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); sendMessage(s); }}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-300 text-xs font-medium text-slate-600 rounded-full transition-all relative z-10"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
