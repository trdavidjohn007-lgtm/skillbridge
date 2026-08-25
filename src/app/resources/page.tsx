"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SkillBot from "@/components/SkillBot";
import Navbar from "@/components/Navbar";
import { fetchWithFallback } from "@/lib/demo-data";

const DEMO_RESOURCES = [
  { id: "1", topic: "Python", title: "Programming in Python (IIT Madras)", url: "https://nptel.ac.in/courses/106102191", platform: "NPTEL", type: "video" as const, difficulty: "beginner" as const, description: "Comprehensive Python course by IIT Madras." },
  { id: "2", topic: "Python", title: "Python Tutorial for Beginners (freeCodeCamp)", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", platform: "YouTube", type: "video" as const, difficulty: "beginner" as const, description: "Complete Python tutorial in one video." },
  { id: "3", topic: "Python", title: "Corey Schafer Python Tutorials", url: "https://www.youtube.com/c/CoreySchafer", platform: "YouTube", type: "video" as const, difficulty: "beginner" as const, description: "Clear Python tutorials covering OOP and more." },
  { id: "4", topic: "DSA", title: "DSA Full Course (freeCodeCamp)", url: "https://www.youtube.com/watch?v=8hly31xKli0", platform: "YouTube", type: "video" as const, difficulty: "beginner" as const, description: "Complete DSA course with visual explanations." },
  { id: "5", topic: "DSA", title: "LeetCode Problem Solving", url: "https://leetcode.com/problemset/", platform: "LeetCode", type: "practice" as const, difficulty: "intermediate" as const, description: "Industry-standard DSA practice problems." },
  { id: "6", topic: "DSA", title: "MIT 6.006 Intro to Algorithms", url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63EdVPNLG3ToM6LaEUuStEY", platform: "YouTube", type: "video" as const, difficulty: "advanced" as const, description: "MIT's legendary algorithms course." },
  { id: "7", topic: "Web Development", title: "freeCodeCamp Full Web Dev Course", url: "https://www.freecodecamp.org/", platform: "freeCodeCamp", type: "interactive" as const, difficulty: "beginner" as const, description: "Learn to code for free with interactive projects." },
  { id: "8", topic: "Web Development", title: "MDN Web Docs", url: "https://developer.mozilla.org/", platform: "MDN", type: "docs" as const, difficulty: "intermediate" as const, description: "The definitive web development reference." },
  { id: "9", topic: "Web Development", title: "React Official Tutorial", url: "https://react.dev/learn", platform: "React", type: "docs" as const, difficulty: "intermediate" as const, description: "Official React docs with interactive examples." },
  { id: "10", topic: "DBMS", title: "HackerRank SQL Practice", url: "https://www.hackerrank.com/domains/sql", platform: "HackerRank", type: "practice" as const, difficulty: "beginner" as const, description: "SQL challenges from basic to advanced." },
  { id: "11", topic: "DBMS", title: "SQLBolt Interactive SQL", url: "https://sqlbolt.com/", platform: "SQLBolt", type: "interactive" as const, difficulty: "beginner" as const, description: "Learn SQL with interactive exercises." },
  { id: "12", topic: "Machine Learning", title: "Andrew Ng's ML Specialization", url: "https://www.coursera.org/specializations/machine-learning-introduction", platform: "Coursera", type: "course" as const, difficulty: "beginner" as const, description: "Andrew Ng's legendary ML course - free to audit." },
  { id: "13", topic: "Machine Learning", title: "Kaggle Learn - Intro to ML", url: "https://www.kaggle.com/learn/intro-to-machine-learning", platform: "Kaggle", type: "interactive" as const, difficulty: "beginner" as const, description: "Hands-on ML with real datasets." },
  { id: "14", topic: "Machine Learning", title: "StatQuest with Josh Starmer", url: "https://www.youtube.com/c/joshstarmer", platform: "YouTube", type: "video" as const, difficulty: "beginner" as const, description: "Amazing visual explanations of ML concepts." },
  { id: "15", topic: "Operating Systems", title: "OSTEP - Three Easy Pieces", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", platform: "OSTEP", type: "docs" as const, difficulty: "intermediate" as const, description: "Free OS textbook - the best available." },
  { id: "16", topic: "Computer Networks", title: "Neso Academy - Computer Networks", url: "https://www.youtube.com/c/NesoAcademy", platform: "YouTube", type: "video" as const, difficulty: "beginner" as const, description: "Excellent networking tutorials." },
];

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

const TOPIC_ICONS: Record<string, string> = {
  Python: "🐍", DSA: "🔗", "Web Development": "🌐", DBMS: "🗄️",
  "Machine Learning": "🤖", "Operating Systems": "💻", "Computer Networks": "🌍",
  "C Programming": "⚙️", Java: "☕", "C++": "⚡", Cybersecurity: "🔒",
  "Data Science": "📊", DevOps: "🚀",
};

const PLATFORM_ICONS: Record<string, string> = {
  YouTube: "🎥",
  NPTEL: "🎓",
  GeeksforGeeks: "📖",
  LeetCode: "💻",
  HackerRank: "🏆",
  "Khan Academy": "🎓",
  freeCodeCamp: "💻",
  MDN: "📖",
  W3Schools: "📖",
  React: "⚛️",
  "The Odin Project": "📖",
  SQLBolt: "⚡",
  Visualgo: "👁️",
  Kaggle: "📊",
  "fast.ai": "🚀",
  Coursera: "🎓",
  "Python.org": "📖",
  OSTEP: "📖",
  Cybrary: "🔒",
  "roadmap.sh": "🗺️",
};

export default function ResourcesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resources, setResources] = useState<any[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    fetchWithFallback("/api/p2p/resources", { resources: DEMO_RESOURCES, topics: [...new Set(DEMO_RESOURCES.map((r) => r.topic))] })
      .then((data: any) => {
        setResources(data.resources || DEMO_RESOURCES);
        setTopics(data.topics || [...new Set(DEMO_RESOURCES.map((r: any) => r.topic))]);
        setLoading(false);
      })
      .catch(() => {
        setResources(DEMO_RESOURCES);
        setTopics([...new Set(DEMO_RESOURCES.map((r) => r.topic))]);
        setLoading(false);
      });
  }, [status, router]);

  const filtered = resources.filter((r) => {
    if (selectedTopic && r.topic !== selectedTopic) return false;
    if (selectedType && r.type !== selectedType) return false;
    if (selectedDifficulty && r.difficulty !== selectedDifficulty) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase()) && !r.topic.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const groupedByTopic = selectedTopic
    ? { [selectedTopic]: filtered }
    : filtered.reduce((acc: Record<string, any[]>, r) => {
        if (!acc[r.topic]) acc[r.topic] = [];
        acc[r.topic].push(r);
        return acc;
      }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activePage="Resources" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">📚 Free Learning Resources</h1>
            <p className="text-slate-500">Curated courses, tutorials, and practice platforms — all 100% free</p>
          </div>
        </FadeIn>

        {/* Search & Filters */}
        <FadeIn delay={100}>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="🔍 Search resources..."
                />
              </div>

              {/* Topic Filter */}
              <div className="flex flex-wrap gap-1.5">
                {topics.slice(0, 8).map((t) => (
                  <button key={t} onClick={() => setSelectedTopic(selectedTopic === t ? null : t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTopic === t ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {TOPIC_ICONS[t] || "📖"} {t}
                  </button>
                ))}
              </div>

              {/* Difficulty Filter */}
              <div className="flex gap-1.5">
                {["beginner", "intermediate", "advanced"].map((d) => (
                  <button key={d} onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      selectedDifficulty === d ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Results count */}
        <div className="text-sm text-slate-400 mb-4">
          Showing {filtered.length} resources {selectedTopic ? `in ${selectedTopic}` : ""}
        </div>

        {/* Resources by Topic */}
        {Object.entries(groupedByTopic).map(([topic, topicResources], ti) => (
          <FadeIn key={topic} delay={ti * 100 + 200}>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{TOPIC_ICONS[topic] || "📖"}</span>
                <h2 className="text-xl font-bold text-slate-900">{topic}</h2>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                  {(topicResources as any[]).length} resources
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(topicResources as any[]).map((r: any) => (
                  <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-orange-200 transition-all duration-300 group block">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        {PLATFORM_ICONS[r.platform] || "📖"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                          {r.title}
                        </h3>
                        <div className="text-xs text-slate-400 mt-1">{r.platform}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{r.description}</p>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        r.difficulty === "beginner" ? "bg-green-50 text-green-600" :
                        r.difficulty === "intermediate" ? "bg-blue-50 text-blue-600" :
                        "bg-purple-50 text-purple-600"
                      }`}>
                        {r.difficulty}
                      </span>
                      <span className="text-xs text-orange-500 font-medium group-hover:text-orange-600">
                        Open →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
      <SkillBot />
    </div>
  );
}
