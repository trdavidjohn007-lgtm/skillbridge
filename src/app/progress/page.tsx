"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SkillBot from "@/components/SkillBot";
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

const BADGES = [
  { type: "first_session", name: "First Steps", icon: "🎯", desc: "Complete your first session" },
  { type: "five_sessions", name: "Regular Learner", icon: "📚", desc: "Complete 5 sessions" },
  { type: "ten_sessions", name: "Dedicated Student", icon: "🏆", desc: "Complete 10 sessions" },
  { type: "five_star", name: "Top Rated", icon: "⭐", desc: "Receive a 5-star rating" },
  { type: "hundred_credits", name: "Credit Collector", icon: "🪙", desc: "Earn 100 credits" },
  { type: "first_teach", name: "Born Teacher", icon: "👨‍🏫", desc: "Complete your first tutoring session" },
  { type: "week_streak", name: "Week Warrior", icon: "🔥", desc: "7-day learning streak" },
  { type: "resource_explorer", name: "Resource Explorer", icon: "🗺️", desc: "Bookmark 10 resources" },
];

const TOPIC_ICONS: Record<string, string> = {
  Python: "🐍", DSA: "🔗", "Web Development": "🌐", DBMS: "🗄️",
  "Machine Learning": "🤖", "Operating Systems": "💻", "Computer Networks": "🌍",
  "C Programming": "⚙️", Java: "☕", "C++": "⚡", Cybersecurity: "🔒",
  "Data Science": "📊", DevOps: "🚀",
};

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "credits" | "badges">("overview");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/p2p/me").then((r) => r.json()),
        fetch("/api/p2p/credits").then((r) => r.json()),
        fetch("/api/p2p/sessions").then((r) => r.json()),
      ]).then(([profileData, creditsData, sessionsData]) => {
        setProfile(profileData);
        setCredits(creditsData);
        setSessionsList(Array.isArray(sessionsData) ? sessionsData : []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalHours = profile?.tutorProfile?.totalHours || profile?.learnerProfile?.totalHours || "0";
  const totalSessions = sessionsList.length;
  const completedSessions = sessionsList.filter((s) => s.status === "completed").length;
  const balance = credits?.balance ?? 100;
  const streak = 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activePage="Progress" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <FadeIn>
          <h1 className="text-3xl font-black text-slate-900 mb-8">📊 Your Progress</h1>
        </FadeIn>

        {/* Stats Cards */}
        <FadeIn delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: "🔥", value: streak, label: "Day Streak", color: "from-amber-50 to-orange-50 border-amber-200/50" },
              { icon: "🪙", value: balance, label: "Credits", color: "from-green-50 to-emerald-50 border-green-200/50" },
              { icon: "💬", value: totalSessions, label: "Sessions", color: "from-blue-50 to-cyan-50 border-blue-200/50" },
              { icon: "⏱️", value: `${Number(totalHours).toFixed(1)}h`, label: "Hours Learned", color: "from-purple-50 to-pink-50 border-purple-200/50" },
            ].map((stat, i) => (
              <div key={i} className={`p-5 bg-gradient-to-br ${stat.color} border border-slate-200/50 rounded-2xl`}>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={200}>
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 mb-6 w-fit">
            {(["overview", "sessions", "credits", "badges"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab ? "bg-orange-500 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Streak Calendar */}
            <FadeIn delay={300}>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">🔥 Learning Streak</h3>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 28 }, (_, i) => {
                    const isActive = i < completedSessions;
                    const isToday = i === 27;
                    return (
                      <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                        isActive ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white" :
                        isToday ? "bg-orange-50 border-2 border-orange-400 text-orange-600" :
                        "bg-slate-50 text-slate-300"
                      }`}>
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-sm text-slate-500">
                  {completedSessions} active days this month
                </div>
              </div>
            </FadeIn>

            {/* Skills Map */}
            <FadeIn delay={400}>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">🎯 Skills Map</h3>
                <div className="space-y-3">
                  {(profile?.tutorProfile?.subjects || profile?.learnerProfile?.interests || ["Python", "DSA", "Web Development"]).map((skill: string) => {
                    const progress = Math.floor(Math.random() * 80) + 20;
                    return (
                      <div key={skill} className="flex items-center gap-3">
                        <span className="text-lg w-8">{TOPIC_ICONS[skill] || "📖"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700">{skill}</span>
                            <span className="text-xs text-slate-400">{progress}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"
                              style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        {activeTab === "sessions" && (
          <FadeIn delay={300}>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {sessionsList.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No Sessions Yet</h3>
                  <p className="text-slate-500">Your completed sessions will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {sessionsList.map((s) => (
                    <div key={s.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/session/${s.id}`)}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${
                        s.status === "completed" ? "bg-green-50" : s.status === "active" ? "bg-blue-50" : "bg-slate-100"
                      }`}>
                        {s.status === "completed" ? "✅" : s.status === "active" ? "💬" : "⏳"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">{s.topic || "Session"}</div>
                        <div className="text-sm text-slate-400">
                          {s.isTutor ? "👨‍🏫 Tutoring" : "🎓 Learning"} • {new Date(s.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        {s.creditsTransferred && (
                          <div className="text-sm font-bold text-green-600">+{s.creditsTransferred} 🪙</div>
                        )}
                        {s.durationSeconds && (
                          <div className="text-xs text-slate-400">{Math.floor(s.durationSeconds / 60)} min</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {activeTab === "credits" && (
          <FadeIn delay={300}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/50 rounded-2xl p-6 text-center">
                  <div className="text-5xl font-black text-orange-600 mb-1">{balance}</div>
                  <div className="text-sm text-orange-500 mb-4">Available Credits</div>
                  <div className="flex justify-center gap-6 text-sm">
                    <div>
                      <div className="font-bold text-green-600">+{credits?.totalEarned || 0}</div>
                      <div className="text-slate-400 text-xs">Earned</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-500">-{credits?.totalSpent || 0}</div>
                      <div className="text-slate-400 text-xs">Spent</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Transaction History</h3>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {(credits?.transactions || []).length === 0 ? (
                      <div className="p-12 text-center text-slate-400">No transactions yet</div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {(credits?.transactions || []).map((tx: any) => (
                          <div key={tx.id} className="flex items-center gap-3 px-6 py-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                              tx.amount > 0 ? "bg-green-50" : "bg-red-50"
                            }`}>
                              {tx.amount > 0 ? "📈" : "📉"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-700 truncate">{tx.description || tx.type}</div>
                              <div className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()}</div>
                            </div>
                            <span className={`text-sm font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                              {tx.amount > 0 ? "+" : ""}{tx.amount} 🪙
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {activeTab === "badges" && (
          <FadeIn delay={300}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BADGES.map((badge, i) => {
                const earned = completedSessions > i || (badge.type === "first_session" && completedSessions > 0);
                return (
                  <div key={badge.type} className={`p-5 rounded-2xl border text-center transition-all ${
                    earned
                      ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-md"
                      : "bg-white border-slate-200 opacity-50 grayscale"
                  }`}>
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs text-slate-500">{badge.desc}</p>
                    {earned && <div className="mt-2 text-xs text-orange-600 font-semibold">✅ Earned</div>}
                  </div>
                );
              })}
            </div>
          </FadeIn>
        )}
      </div>
      <SkillBot />
    </div>
  );
}
