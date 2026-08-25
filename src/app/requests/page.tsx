"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DEMO_REQUESTS, fetchWithFallback } from "@/lib/demo-data";
import Navbar from "@/components/Navbar";


function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms` }}>
      {children}
    </div>
  );
}

export default function RequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    fetchWithFallback("/api/p2p/requests", DEMO_REQUESTS)
      .then((data) => { setRequests(Array.isArray(data) ? data : DEMO_REQUESTS); setLoading(false); })
      .catch(() => { setRequests(DEMO_REQUESTS); setLoading(false); });
  }, [status, router]);

  const handleAccept = async (requestId: string) => {
    setAccepting(requestId);
    setAcceptError(null);
    try {
      const res = await fetch("/api/p2p/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/session/${data.id}`);
      } else {
        setAcceptError(data.error || "Failed to accept request. Try again.");
        setTimeout(() => setAcceptError(null), 5000);
      }
    } catch (err) {
      setAcceptError("Network error. Please check your connection.");
      setTimeout(() => setAcceptError(null), 5000);
    } finally {
      setAccepting(null);
    }
  };

  const TOPIC_ICONS: Record<string, string> = {
    Python: "🐍", DSA: "🔗", "Web Development": "🌐", DBMS: "🗄️",
    "Machine Learning": "🤖", "Operating Systems": "💻", "Computer Networks": "🌍",
    "C Programming": "⚙️", Java: "☕", "C++": "⚡", Cybersecurity: "🔒",
    "Data Science": "📊", DevOps: "🚀",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activePage="Requests" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Help Requests</h1>
            <p className="text-slate-500">Browse and accept requests from learners who need help</p>
          </div>
        </FadeIn>

        {acceptError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
            <span>⚠️</span> {acceptError}
          </div>
        )}
        {requests.length === 0 ? (
          <FadeIn delay={100}>
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Requests</h3>
              <p className="text-slate-500 mb-6">Check back soon — learners post requests regularly!</p>
              <button onClick={() => router.push("/resources")} className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                Browse Free Resources Instead →
              </button>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req, i) => (
              <FadeIn key={req.id} delay={i * 80}>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {TOPIC_ICONS[req.tags?.[0]] || "📚"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{req.topic}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-[8px] text-white font-bold">
                          {req.learnerName?.[0] || "?"}
                        </div>
                        <span className="text-xs text-slate-400">{req.learnerName || "Anonymous"}</span>
                      </div>
                    </div>
                  </div>

                  {req.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{req.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(req.tags || []).slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>⏱️ {req.durationMins || 30} min</span>
                      <span>🪙 {req.creditCost || 30} credits</span>
                    </div>
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={accepting === req.id}
                      className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {accepting === req.id ? "Accepting..." : "Accept ✓"}
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
