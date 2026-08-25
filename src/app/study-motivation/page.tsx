"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SkillBot from "@/components/SkillBot";
import Navbar from "@/components/Navbar";

// ============================================================
// ANIMATION
// ============================================================

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

// ============================================================
// QUOTE CAROUSEL COMPONENT
// ============================================================

function QuoteCarousel({ quotes }: { quotes: any[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  if (!quotes.length) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-8 md:p-12 text-white min-h-[280px] flex items-center">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />

      <div className="relative w-full">
        {quotes.map((quote, i) => (
          <div
            key={quote.id}
            className={`absolute inset-0 transition-all duration-700 ${
              i === current ? "opacity-100 translate-x-0" : i < current ? "opacity-0 -translate-x-8" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">{quote.icon}</div>
              <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-4 italic max-w-2xl mx-auto">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <div className="text-orange-100 font-medium">— {quote.author}</div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8 relative z-10">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function StudyMotivationPage() {
  const router = useRouter();
  const [data, setData] = useState<any>({ influencers: [], reels: [], quotes: [], tips: [] });
  const [loading, setLoading] = useState(true);
  const [activeReelFilter, setActiveReelFilter] = useState("all");
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [savedQuotes, setSavedQuotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/p2p/study-motivation")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          // API error — keep default empty state
          setLoading(false);
        } else {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleLike = (id: string) => {
    setLikedReels((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSavedQuotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredReels = (activeReelFilter === "all"
    ? data.reels
    : data.reels.filter((r: any) => r.category === activeReelFilter)) || [];

  const REEL_CATEGORIES = [
    { key: "all", label: "All", icon: "🔥" },
    { key: "technique", label: "Techniques", icon: "🧠" },
    { key: "routine", label: "Routines", icon: "📅" },
    { key: "study-with-me", label: "Study With Me", icon: "🎧" },
    { key: "motivation", label: "Motivation", icon: "💪" },
    { key: "lifestyle", label: "Lifestyle", icon: "🎨" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activePage="Motivation" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-sm font-medium mb-4">
              <span>📸</span> Instagram Study Community
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
              Study <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">Motivation</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Curated reels, quotes, and tips from the best study influencers on Instagram.
              Stay motivated, learn new techniques, and crush your goals.
            </p>
          </div>
        </FadeIn>

        {/* ─── QUOTE CAROUSEL ─── */}
        <FadeIn delay={100}>
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>💬</span> Daily Study Quotes
            </h2>
            <QuoteCarousel quotes={data.quotes} />
          </div>
        </FadeIn>

        {/* ─── STUDY TIPS CAROUSELS ─── */}
        <FadeIn delay={200}>
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>💡</span> Study Tips & Tricks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.tips || []).map((tip: any) => (
                <div
                  key={tip.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300 cursor-pointer"
                  onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{tip.title}</h3>
                        <span className="text-xs text-orange-500 font-medium">{tip.source}</span>
                      </div>
                    </div>

                    <div className={`space-y-2 ${expandedTip === tip.id ? "" : "max-h-[80px] overflow-hidden relative"}`}>
                      {tip.slides.map((slide: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{slide}</span>
                        </div>
                      ))}
                    </div>

                    {expandedTip !== tip.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                    )}

                    <div className="mt-3 text-xs text-orange-500 font-medium">
                      {expandedTip === tip.id ? "Show less ↑" : "Tap to read more ↓"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ─── REELS GRID ─── */}
        <FadeIn delay={300}>
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🎬</span> Study Reels
              </h2>
              <span className="text-sm text-slate-400">{filteredReels.length} reels</span>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {REEL_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveReelFilter(cat.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeReelFilter === cat.key
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Reels Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(filteredReels || []).map((reel: any, i: number) => (
                <div
                  key={reel.id}
                  className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden aspect-[9/16] cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{reel.thumbnail}</span>
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Duration badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[10px] text-white font-medium">
                    {reel.duration}
                  </div>

                  {/* Play button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <span className="text-slate-900 ml-1">▶</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-sm leading-snug mb-1 line-clamp-2">{reel.title}</h3>
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                      <span>{reel.influencer}</span>
                      <span>•</span>
                      <span>{reel.views} views</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(reel.id); }}
                        className="flex items-center gap-1 text-xs"
                      >
                        <span className={likedReels.has(reel.id) ? "scale-110" : ""}>
                          {likedReels.has(reel.id) ? "❤️" : "🤍"}
                        </span>
                        <span className="text-white/80">{reel.likes}</span>
                      </button>
                      <div className="flex gap-1">
                        {reel.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ─── INFLUENCER PROFILES ─── */}
        <FadeIn delay={400}>
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>👑</span> Top Study Influencers to Follow
            </h2>
            <p className="text-sm text-slate-500 mb-6">Follow these accounts for daily study motivation and tips</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data.influencers || []).map((inf: any) => (
                <a
                  key={inf.id}
                  href={inf.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-pink-200 transition-all duration-300 group block"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 via-orange-400 to-amber-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      {inf.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-pink-600 transition-colors">{inf.handle}</div>
                      <div className="text-xs text-slate-400">{inf.followers} followers</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{inf.bio}</p>

                  <div className="flex flex-wrap gap-1">
                    {inf.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-xs text-pink-500 font-medium group-hover:text-pink-600">
                    <span>Follow on Instagram</span>
                    <span>→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ─── STUDY METHODS QUICK REFERENCE ─── */}
        <FadeIn delay={500}>
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>🧪</span> Proven Study Methods
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: "Active Recall",
                  icon: "🧠",
                  description: "Test yourself instead of re-reading. Use flashcards, practice problems, or the blurting method.",
                  effectiveness: 95,
                  difficulty: "Medium",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  name: "Spaced Repetition",
                  icon: "🔄",
                  description: "Review at increasing intervals (1d, 3d, 7d, 14d, 30d). Apps like Anki automate this.",
                  effectiveness: 92,
                  difficulty: "Easy",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  name: "Pomodoro Technique",
                  icon: "🍅",
                  description: "Work 25 min, break 5 min. After 4 cycles, take a 15-30 min break.",
                  effectiveness: 85,
                  difficulty: "Easy",
                  color: "from-red-500 to-orange-500",
                },
                {
                  name: "Feynman Technique",
                  icon: "🎓",
                  description: "Explain concepts in simple terms. If you can't explain it simply, you don't understand it.",
                  effectiveness: 90,
                  difficulty: "Medium",
                  color: "from-amber-500 to-yellow-500",
                },
                {
                  name: "Mind Mapping",
                  icon: "🗺️",
                  description: "Visual diagrams connecting concepts. Great for understanding relationships between topics.",
                  effectiveness: 80,
                  difficulty: "Easy",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  name: "Interleaving",
                  icon: "🔀",
                  description: "Mix different topics in one study session instead of blocking. Improves problem-solving.",
                  effectiveness: 88,
                  difficulty: "Hard",
                  color: "from-indigo-500 to-blue-500",
                },
              ].map((method, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-xl`}>
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{method.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        method.difficulty === "Easy" ? "bg-green-50 text-green-600" :
                        method.difficulty === "Medium" ? "bg-amber-50 text-amber-600" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {method.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{method.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${method.color} rounded-full`}
                        style={{ width: `${method.effectiveness}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{method.effectiveness}%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Effectiveness score</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ─── SAVED QUOTES SECTION ─── */}
        <FadeIn delay={550}>
          {savedQuotes.size > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>🔖</span> Saved Quotes ({savedQuotes.size})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.quotes || []).filter((q: any) => savedQuotes.has(q.id)).map((quote: any) => (
                  <div key={quote.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{quote.icon}</span>
                      <div className="flex-1">
                        <blockquote className="text-sm text-slate-700 italic">&ldquo;{quote.text}&rdquo;</blockquote>
                        <div className="text-xs text-slate-400 mt-2">— {quote.author}</div>
                      </div>
                      <button onClick={() => toggleSave(quote.id)} className="text-pink-500">🔖</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FadeIn>

        {/* ─── INSTAGRAM CTA ─── */}
        <FadeIn delay={600}>
          <div className="bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative">
              <div className="text-5xl mb-4">📸</div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">Follow the Study Community</h2>
              <p className="text-pink-100 max-w-xl mx-auto mb-6">
                Join millions of students sharing study tips, desk setups, and motivation daily on Instagram.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["@studywithme", "@studyist", "@girls.whostudy", "@medschoolinsiders"].map((handle) => (
                  <a key={handle} href={`https://www.instagram.com/${handle.replace("@", "")}/`} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
                    {handle}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <SkillBot />
    </div>
  );
}
