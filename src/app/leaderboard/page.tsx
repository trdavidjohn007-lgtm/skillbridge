"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEMO_LEADERBOARD_TUTORS, DEMO_LEADERBOARD_LEARNERS, fetchWithFallback } from "@/lib/demo-data";
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

const RANK_STYLES = [
  "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-500/25",
  "bg-gradient-to-r from-slate-300 to-slate-400 text-white",
  "bg-gradient-to-r from-orange-300 to-orange-400 text-white",
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<any[]>([]);
  const [learners, setLearners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"tutors" | "learners">("tutors");

  useEffect(() => {
    fetchWithFallback("/api/p2p/leaderboard", { tutors: DEMO_LEADERBOARD_TUTORS, learners: DEMO_LEADERBOARD_LEARNERS })
      .then((data) => {
        setTutors(data.tutors || DEMO_LEADERBOARD_TUTORS);
        setLearners(data.learners || DEMO_LEADERBOARD_LEARNERS);
        setLoading(false);
      })
      .catch(() => {
        setTutors(DEMO_LEADERBOARD_TUTORS);
        setLearners(DEMO_LEADERBOARD_LEARNERS);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentList = tab === "tutors" ? tutors : learners;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activePage="Leaderboard" />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <FadeIn>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2">🏆 Leaderboard</h1>
            <p className="text-slate-500">Top performers in the SkillBridge community</p>
          </div>
        </FadeIn>

        {/* Tab Toggle */}
        <FadeIn delay={100}>
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-1 border border-slate-200 inline-flex">
              <button onClick={() => setTab("tutors")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "tutors" ? "bg-orange-500 text-white shadow-md" : "text-slate-500"}`}>
                👨‍🏫 Top Tutors
              </button>
              <button onClick={() => setTab("learners")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "learners" ? "bg-orange-500 text-white shadow-md" : "text-slate-500"}`}>
                🎓 Top Learners
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Top 3 Podium */}
        {currentList.length >= 3 && (
          <FadeIn delay={200}>
            <div className="flex items-end justify-center gap-4 mb-10">
              {[1, 0, 2].map((idx) => {
                const user = currentList[idx];
                if (!user) return null;
                const isFirst = idx === 0;
                return (
                  <div key={idx} className={`text-center ${isFirst ? "order-first" : ""}`}>
                    <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-3 ${
                      isFirst
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-amber-500/25"
                        : idx === 1
                        ? "bg-gradient-to-br from-slate-200 to-slate-300"
                        : "bg-gradient-to-br from-orange-200 to-orange-300"
                    }`}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                      ) : (
                        <span className="text-white font-bold">{user.anonymousName?.[0]}</span>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold mb-2 ${RANK_STYLES[idx]}`}>
                      #{idx + 1}
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{user.anonymousName}</div>
                    {tab === "tutors" ? (
                      <div className="text-xs text-slate-400 mt-1">
                        ⭐ {user.avgRating || "0"} • {user.totalSessions || 0} sessions
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 mt-1">
                        💬 {user.totalSessions || 0} sessions • {Number(user.totalHours || 0).toFixed(1)}h
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </FadeIn>
        )}

        {/* Full List */}
        <FadeIn delay={300}>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {currentList.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Rankings Yet</h3>
                <p className="text-slate-500">Be the first to complete a session!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {currentList.map((user, i) => (
                  <div key={user.userId} className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${
                    i < 3 ? "bg-gradient-to-r from-orange-50/50 to-transparent" : ""
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                      i < 3 ? RANK_STYLES[i] : "bg-slate-100 text-slate-400"
                    }`}>
                      #{i + 1}
                    </div>

                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">{user.anonymousName?.[0]}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{user.anonymousName}</span>
                        {user.verifiedBadge && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-semibold">✓ Verified</span>
                        )}
                      </div>
                      {tab === "tutors" && user.subjects && (
                        <div className="flex gap-1 mt-1">
                          {(typeof user.subjects === 'string' ? JSON.parse(user.subjects) : user.subjects || []).slice(0, 3).map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      {tab === "tutors" ? (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-bold text-slate-900">{user.avgRating || "0"}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{user.totalSessions || 0} sessions</div>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-slate-900">{user.totalSessions || 0}</div>
                          <div className="text-xs text-slate-400">sessions</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
