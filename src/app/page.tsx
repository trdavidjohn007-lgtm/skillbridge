"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import BridgeLogo from "@/components/BridgeLogo";

// ============================================================
// ANIMATION COMPONENTS
// ============================================================

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function FloatingOrb({ size, color, delay }: { size: number; color: string; delay: number }) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(80px)",
        opacity: 0.3,
        animation: `float ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"learner" | "tutor" | "both">("both");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const TOPICS = [
    "Python", "DSA", "Web Development", "DBMS", "Machine Learning",
    "Operating Systems", "Computer Networks", "C Programming", "Java", "C++",
    "Cybersecurity", "Data Science", "DevOps",
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (authMode === "signup") {
        // First sign in to create account
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Authentication failed. Please try again.");
          setLoading(false);
          return;
        }

        // Then create P2P profile
        const profileRes = await fetch("/api/p2p/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, subjects: role !== "learner" ? subjects : [], interests: role !== "tutor" ? subjects : [] }),
        });

        if (profileRes.ok) {
          router.push("/dashboard");
        } else {
          setError("Failed to create profile");
        }
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError("Invalid credentials");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (s: string) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  // If logged in, show dashboard redirect
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Background orbs */}
      <FloatingOrb size={600} color="#ff6b00" delay={0} />
      <FloatingOrb size={400} color="#8b5cf6" delay={2} />
      <FloatingOrb size={300} color="#06b6d4" delay={4} />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 overflow-hidden">
            <BridgeLogo size={28} white />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">SkillBridge</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {session ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 sm:px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 text-sm"
            >
              Dashboard →
            </button>
          ) : (
            <>
              <button
                onClick={() => { setAuthMode("login"); setShowAuth(true); }}
                className="hidden sm:block px-5 py-2.5 text-white/80 hover:text-white font-medium transition-colors text-sm"
              >
                Log In
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setShowAuth(true); }}
                className="px-5 sm:px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 text-sm"
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            100% Free for Students • Anonymous • Safe
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 className="text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight max-w-4xl">
            Learn from Peers.{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Teach to Earn.
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="text-xl text-white/60 max-w-2xl mt-6 leading-relaxed">
            The AI-powered platform connecting engineering students for anonymous, 
            credit-based peer tutoring. Get help with any CS topic — or earn credits 
            by teaching what you know.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="flex items-center gap-4 mt-10">
            <button
              onClick={() => { setAuthMode("signup"); setShowAuth(true); }}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              Start Learning for Free →
            </button>
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-lg rounded-2xl border border-white/10 transition-all duration-200"
            >
              See How It Works
            </button>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={400}>
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg">
            {[
              { value: 50, suffix: "+", label: "Free Resources" },
              { value: 13, suffix: "", label: "CS Topics" },
              { value: 100, suffix: "", label: "Starting Credits" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-black text-white">
                  <CountUp target={stat.value} />
                  {stat.suffix}
                </div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Features */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <FadeIn>
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            Why <span className="text-orange-400">SkillBridge</span>?
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🔒",
              title: "100% Anonymous",
              desc: "Auto-generated pseudonyms and avatars. No real names, no personal data shared. Learn and teach in complete privacy.",
              color: "from-blue-500/10 to-cyan-500/10",
              border: "border-blue-500/20",
            },
            {
              icon: "🪙",
              title: "Credit Economy",
              desc: "Start with 100 free credits. Earn more by tutoring peers. Spend credits to get help. No real money needed.",
              color: "from-orange-500/10 to-amber-500/10",
              border: "border-orange-500/20",
            },
            {
              icon: "🤖",
              title: "AI-Powered Matching",
              desc: "Get matched with the best tutors for your topic. AI chatbot helps you find resources and plan your learning path.",
              color: "from-purple-500/10 to-pink-500/10",
              border: "border-purple-500/20",
            },
            {
              icon: "📚",
              title: "50+ Free Resources",
              desc: "Curated NPTEL courses, YouTube playlists, LeetCode problems, and more — all mapped to every CS topic.",
              color: "from-green-500/10 to-emerald-500/10",
              border: "border-green-500/20",
            },
            {
              icon: "🛡️",
              title: "Safe & Moderated",
              desc: "Real-time PII detection, session transcripts, and instant reporting. Your safety is our priority.",
              color: "from-red-500/10 to-rose-500/10",
              border: "border-red-500/20",
            },
            {
              icon: "📊",
              title: "Track Progress",
              desc: "Learning streaks, skill maps, achievement badges, and leaderboard. Watch yourself grow.",
              color: "from-cyan-500/10 to-blue-500/10",
              border: "border-cyan-500/20",
            },
            {
              icon: "📸",
              title: "Study Motivation",
              desc: "Curated Instagram study reels, quotes, and tips from top study influencers. Stay inspired daily.",
              color: "from-pink-500/10 to-rose-500/10",
              border: "border-pink-500/20",
            },
          ].map((feature, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div
                className={`p-6 rounded-2xl bg-gradient-to-br ${feature.color} border ${feature.border} backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300`}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <FadeIn>
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            How It <span className="text-orange-400">Works</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "1", icon: "✍️", title: "Sign Up", desc: "Create account, choose role (Learner/Tutor/Both), get your anonymous profile" },
            { step: "2", icon: "📝", title: "Post or Accept", desc: "Learners post help requests. Tutors browse and accept matches" },
            { step: "3", icon: "💬", title: "Session", desc: "Anonymous chat room with PII redaction. Text-based communication" },
            { step: "4", icon: "⭐", title: "Rate & Earn", desc: "Rate your experience. Tutors earn credits. Build your Trust Score" },
          ].map((step, i) => (
            <FadeIn key={i} delay={i * 150}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg shadow-orange-500/25">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-orange-400 mb-2">STEP {step.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/50">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {authMode === "signup" ? "Create Account" : "Welcome Back"}
              </h2>
              <button
                onClick={() => { setShowAuth(false); setError(""); }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="you@university.edu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Any password works"
                  required
                />
                <p className="text-[11px] text-white/30 mt-1.5">No real password needed — just enter anything to get started</p>
              </div>

              {authMode === "signup" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">I want to...</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["learner", "tutor", "both"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                            role === r
                              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                              : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {r === "learner" ? "🎓 Learn" : r === "tutor" ? "👨‍🏫 Teach" : "🔄 Both"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      {role !== "learner" ? "Subjects I can teach" : "Subjects I want to learn"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleSubject(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            subjects.includes(t)
                              ? "bg-orange-500 text-white"
                              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait..." : authMode === "signup" ? "Create Account" : "Log In"}
              </button>

              <p className="text-center text-sm text-white/40">
                {authMode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setError(""); }}
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  {authMode === "signup" ? "Log In" : "Sign Up"}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center overflow-hidden">
              <BridgeLogo size={16} white />
            </div>
            <span className="text-white/40 text-sm">SkillBridge © 2026</span>
          </div>
          <div className="text-white/30 text-xs">
            Built with ❤️ for engineering students
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
