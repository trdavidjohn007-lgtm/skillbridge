"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SkillBot from "@/components/SkillBot";
import OnboardingModal from "@/components/OnboardingModal";
import Navbar from "@/components/Navbar";
import {
  DEMO_PROFILE,
  DEMO_SESSIONS,
  DEMO_CREDIT_TRANSACTIONS,
  fetchWithFallback,
} from "@/lib/demo-data";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({ topic: "", description: "", tags: [] as string[], durationMins: 30 });
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState("");

  const TOPICS = ["Python", "DSA", "Web Development", "DBMS", "Machine Learning", "Operating Systems", "Computer Networks", "C Programming", "Java", "C++"];

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (status === "authenticated") {
      Promise.all([
        fetchWithFallback("/api/p2p/me", DEMO_PROFILE),
        fetchWithFallback("/api/p2p/credits", { balance: 100, totalEarned: 70, totalSpent: 30, transactions: DEMO_CREDIT_TRANSACTIONS }),
        fetchWithFallback("/api/p2p/sessions", DEMO_SESSIONS),
      ]).then(([profileData, creditsData, sessionsData]) => {
        setProfile(profileData);
        setCredits(creditsData);
        setSessionsList(Array.isArray(sessionsData) ? sessionsData : DEMO_SESSIONS);
        setLoading(false);
      }).catch(() => {
        setProfile(DEMO_PROFILE);
        setCredits({ balance: 100, totalEarned: 70, totalSpent: 30, transactions: DEMO_CREDIT_TRANSACTIONS });
        setSessionsList(DEMO_SESSIONS);
        setLoading(false);
      });
    }
  }, [status, router]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRequest.tags.length === 0) return;
    setSubmitting(true);
    setRequestError("");
    try {
      const res = await fetch("/api/p2p/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest),
      });
      const data = await res.json();
      if (res.ok) {
        setRequestSuccess(true);
        setNewRequest({ topic: "", description: "", tags: [], durationMins: 30 });
        setTimeout(() => { setRequestSuccess(false); setShowNewRequest(false); }, 2000);
      } else {
        setRequestError(data.error || "Failed to post request. Please try again.");
      }
    } catch (err) {
      setRequestError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tutorProfile = profile?.tutorProfile;
  const learnerProfile = profile?.learnerProfile;
  const balance = credits?.balance ?? 100;
  const anonymousName = tutorProfile?.anonymousName || learnerProfile?.anonymousName || "Student";

  return (
    <div className="min-h-screen bg-slate-50">
      <OnboardingModal />

      <Navbar activePage="Dashboard" credits={balance} anonymousName={anonymousName} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Banner — Clean gradient */}
        <FadeIn>
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden mb-6 sm:mb-8">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl font-black mb-1">
                Welcome, {anonymousName}! 👋
              </h1>
              <p className="text-orange-100 text-sm sm:text-base">
                Ready to learn or teach? You have <strong className="text-white">{balance} credits</strong> to start.
              </p>
              <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-6">
                {[
                  { val: balance, label: "Credits" },
                  { val: sessionsList.length, label: "Sessions" },
                  { val: tutorProfile?.avgRating || "—", label: "Avg Rating" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/15 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                    <div className="text-xl sm:text-2xl font-black">{s.val}</div>
                    <div className="text-xs text-orange-100">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { icon: "📝", title: "Post Help Request", desc: "Need help? Ask a peer tutor", color: "orange", action: () => setShowNewRequest(true) },
              { icon: "🔍", title: "Browse Requests", desc: "Find someone to help", color: "blue", action: () => router.push("/requests") },
              { icon: "📚", title: "Free Resources", desc: "50+ curated courses & tutorials", color: "purple", action: () => router.push("/resources") },
            ].map((item, i) => (
              <button key={i} onClick={item.action}
                className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 text-left group">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-0.5">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Recent Activity */}
          <FadeIn delay={200} className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm">Recent Sessions</h2>
                <button onClick={() => router.push("/progress")} className="text-xs text-orange-500 font-medium hover:text-orange-600">
                  View all →
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {sessionsList.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/session/${s.id}`)}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                      s.status === "completed" ? "bg-green-50" : s.status === "active" ? "bg-blue-50" : "bg-slate-100"
                    }`}>
                      {s.status === "completed" ? "✅" : s.status === "active" ? "💬" : "⏳"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 text-sm truncate">{s.topic || "Session"}</div>
                      <div className="text-xs text-slate-400">
                        {s.isTutor ? "Teaching" : "Learning"} • {new Date(s.startedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {s.creditsTransferred ? (
                        <span className="text-sm font-bold text-green-600">+{s.creditsTransferred} 🪙</span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === "active" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                          {s.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Credit Ledger */}
          <FadeIn delay={300}>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-sm">Credit History</h2>
              </div>
              <div className="p-5 space-y-3">
                {(credits?.transactions || DEMO_CREDIT_TRANSACTIONS).slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${tx.amount > 0 ? "bg-green-50" : "bg-red-50"}`}>
                        {tx.amount > 0 ? "📈" : "📉"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-700 truncate">{tx.description || tx.type}</div>
                        <div className="text-[11px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ml-2 ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Post Help Request</h2>
              <button onClick={() => setShowNewRequest(false)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">✕</button>
            </div>
            {requestSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium flex items-center gap-2 mb-2">
                <span>✅</span> Request posted! Tutors will be notified.
              </div>
            )}
            {requestError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2 mb-2">
                <span>⚠️</span> {requestError}
              </div>
            )}
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">What do you need help with?</label>
                <input type="text" value={newRequest.topic} onChange={(e) => setNewRequest((p) => ({ ...p, topic: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                  placeholder="e.g., Binary Trees in DSA" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Topic Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button key={t} type="button" onClick={() => setNewRequest((p) => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t] }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${newRequest.tags.includes(t) ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map((d) => (
                    <button key={d} type="button" onClick={() => setNewRequest((p) => ({ ...p, durationMins: d }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${newRequest.durationMins === d ? "bg-orange-500 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {d} min
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-slate-500">Cost: <span className="font-bold text-orange-600">{newRequest.durationMins}</span> credits</div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewRequest(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || newRequest.tags.length === 0} className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? "Posting..." : "Post Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trending Courses */}
      <FadeIn delay={400}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <h2 className="font-bold text-slate-900 text-sm">Trending Courses</h2>
              </div>
              <button onClick={() => router.push("/resources")} className="text-xs text-orange-500 font-medium hover:text-orange-600">View all →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {[
                { title: "Python for Everybody", platform: "Coursera", icon: "🐍", url: "https://www.py4e.com/", tag: "Beginner", tagColor: "bg-green-50 text-green-600", learners: "2.4M" },
                { title: "CS50: Intro to CS", platform: "Harvard/YouTube", icon: "🎓", url: "https://www.youtube.com/watch?v=3LPJfIKxwWc", tag: "Popular", tagColor: "bg-orange-50 text-orange-600", learners: "5.1M" },
                { title: "Machine Learning Specialization", platform: "Coursera", icon: "🤖", url: "https://www.coursera.org/specializations/machine-learning-introduction", tag: "Trending", tagColor: "bg-purple-50 text-purple-600", learners: "1.8M" },
                { title: "The Odin Project", platform: "Free Course", icon: "🌐", url: "https://www.theodinproject.com/", tag: "Web Dev", tagColor: "bg-blue-50 text-blue-600", learners: "890K" },
              ].map((course, i) => (
                <a key={i} href={course.url} target="_blank" rel="noopener noreferrer"
                  className="p-4 hover:bg-slate-50 transition-colors group block">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{course.icon}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-orange-600 transition-colors">{course.title}</h3>
                      <div className="text-xs text-slate-400">{course.platform}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${course.tagColor}`}>{course.tag}</span>
                    <span className="text-[11px] text-slate-400">{course.learners} learners</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Trending Motivational Quotes */}
      <FadeIn delay={500}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">💬</span>
                <h2 className="font-bold text-sm">Daily Study Quote</h2>
              </div>
              <div className="space-y-4">
                {[
                  { text: "The expert in anything was once a beginner.", author: "Helen Hayes", icon: "🌱" },
                  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", icon: "💪" },
                  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", icon: "🐢" },
                  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", icon: "❤️" },
                ].map((quote, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{quote.icon}</span>
                    <div>
                      <blockquote className="text-sm font-medium italic leading-relaxed">&ldquo;{quote.text}&rdquo;</blockquote>
                      <div className="text-xs text-orange-100 mt-1">— {quote.author}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push("/study-motivation")} className="mt-4 text-xs text-orange-100 hover:text-white font-medium transition-colors">
                See more quotes →
              </button>
            </div>
          </div>
        </div>
      </FadeIn>

      <SkillBot />
    </div>
  );
}
