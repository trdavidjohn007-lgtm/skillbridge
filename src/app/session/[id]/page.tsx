"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

export default function SessionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [sessionData, setSessionData] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingTags, setRatingTags] = useState<string[]>([]);
  const [ended, setEnded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = (session?.user as any)?.id;

  const RATING_TAGS = [
    "Explained Clearly", "Patient", "Knew Subject", "Was Helpful",
    "Was Rude", "Didn't Know Subject", "Wasted Time", "Great Communication",
  ];

  const PII_PATTERNS = [
    /\b[\w.-]+@[\w.-]+\.\w+\b/gi,  // emails
    /\b\d{10}\b/g,                   // phone numbers
    /\b(?:\+91|91)?\s?\d{10}\b/g,   // Indian phone
    /@[a-zA-Z0-9_]+/g,              // social handles
    /\b(?:linkedin|instagram|twitter|facebook)\.com\/\S+/gi,
  ];

  function redactPII(text: string): string {
    let result = text;
    for (const pattern of PII_PATTERNS) {
      result = result.replace(pattern, "[redacted]");
    }
    return result;
  }

  // Fetch session data
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/p2p/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setSessionData(data);
        setMessages(data.messages || []);
        if (data.session?.status === "completed") {
          setEnded(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (!sessionData?.session || ended) return;
    const start = new Date(sessionData.session.startedAt).getTime();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionData, ended]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const redacted = redactPII(input);
    const userMsg = {
      id: Date.now().toString(),
      senderId: userId,
      content: redacted,
      createdAt: new Date().toISOString(),
      isSystem: false,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Save to server
    try {
      await fetch(`/api/p2p/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: redacted }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndSession = async () => {
    try {
      const res = await fetch(`/api/p2p/sessions/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      });
      if (res.ok) {
        setEnded(true);
        setShowRating(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async () => {
    try {
      await fetch(`/api/p2p/sessions/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report", reason: reportReason }),
      });
      setShowReport(false);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const submitRating = async () => {
    try {
      await fetch("/api/p2p/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, stars: rating, tags: ratingTags }),
      });
      setShowRating(false);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Session Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="text-slate-400 hover:text-white transition-colors">
              ← Back
            </button>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <h1 className="text-white font-bold">{sessionData?.topic || "Session"}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {(sessionData?.tags || []).map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">#{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${ended ? "bg-slate-700 text-slate-400" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
              <div className={`w-2 h-2 rounded-full ${ended ? "bg-slate-500" : "bg-green-400 animate-pulse"}`} />
              {formatTime(elapsed)}
            </div>

            {/* Anonymous badge */}
            <div className="px-3 py-2 rounded-xl bg-slate-700/50 border border-slate-600">
              <div className="text-xs text-slate-400">Anonymous Session</div>
              <div className="text-sm text-white font-medium">🔒 End-to-end safe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === userId;
            const isSystem = msg.isSystem;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="px-4 py-2 bg-slate-800/50 rounded-full text-xs text-slate-400">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  isMe
                    ? "bg-orange-500 text-white rounded-br-md"
                    : "bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700"
                }`}>
                  <div className="text-sm leading-relaxed">{msg.content}</div>
                  <div className={`text-[10px] mt-1 ${isMe ? "text-orange-200" : "text-slate-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!ended && (
          <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <span className="text-xs">🛡️</span>
                <span className="text-xs text-amber-400 font-medium">PII Auto-Redacted</span>
              </div>
              <button onClick={() => setShowReport(true)} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-medium hover:bg-red-500/20 transition-colors">
                ⚠️ Report & End
              </button>
            </div>
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                placeholder="Type a message..."
              />
              <button type="submit" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
                Send
              </button>
              <button type="button" onClick={handleEndSession} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors">
                End Session
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Rate This Session</h2>
            <p className="text-sm text-slate-500 text-center mb-6">How was your experience?</p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="text-4xl transition-transform hover:scale-110">
                  {s <= rating ? "⭐" : "☆"}
                </button>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {RATING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setRatingTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    ratingTags.includes(tag)
                      ? tag.startsWith("Was") || tag === "Didn't Know Subject" || tag === "Wasted Time"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <button onClick={submitRating} className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
              Submit Rating
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">⚠️ Report Session</h2>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 resize-none focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="What happened? Why are you reporting this session?"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowReport(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleReport} className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors">
                Report & End
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
