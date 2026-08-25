import { NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/sanitize";

// ============================================================
// CURATED STUDY INFLUENCERS (Instagram Study Community)
// ============================================================

const STUDY_INFLUENCERS = [
  {
    id: "1",
    handle: "@studywithme",
    name: "Study With Me",
    followers: "1.2M",
    niche: "Study sessions, desk setup, productivity",
    profileUrl: "https://www.instagram.com/studywithme/",
    avatar: "📚",
    bio: "Study motivation, aesthetic desk setups, and real-time study sessions",
    tags: ["Study With Me", "Desk Setup", "Productivity"],
  },
  {
    id: "2",
    handle: "@theproductiveoutfit",
    name: "The Productive Outfit",
    followers: "890K",
    niche: "Productivity tips, time management, study hacks",
    profileUrl: "https://www.instagram.com/theproductiveoutfit/",
    avatar: "⏰",
    bio: "Making productivity aesthetic and accessible",
    tags: ["Productivity", "Time Management", "Study Hacks"],
  },
  {
    id: "3",
    handle: "@studyist",
    name: "Studyist",
    followers: "1.5M",
    niche: "Study notes, note-taking methods, revision techniques",
    profileUrl: "https://www.instagram.com/studyist/",
    avatar: "📝",
    bio: "Beautiful notes, effective study methods, and exam prep",
    tags: ["Notes", "Revision", "Exam Prep"],
  },
  {
    id: "4",
    handle: "@girls.whostudy",
    name: "Girls Who Study",
    followers: "2.1M",
    niche: "Study motivation, girl power, academic achievement",
    profileUrl: "https://www.instagram.com/girls.whostudy/",
    avatar: "💪",
    bio: "Empowering women in academia through study community",
    tags: ["Motivation", "Community", "Academic"],
  },
  {
    id: "5",
    handle: "@amstudyin",
    name: "Amstudyin",
    followers: "950K",
    niche: "Studyblr, aesthetic notes, exam motivation",
    profileUrl: "https://www.instagram.com/amstudyin/",
    avatar: "🎨",
    bio: "Making studying beautiful one note at a time",
    tags: ["Studyblr", "Aesthetic", "Notes"],
  },
  {
    id: "6",
    handle: "@study.quotes",
    name: "Study Quotes",
    followers: "1.8M",
    niche: "Motivational quotes, study inspiration, daily motivation",
    profileUrl: "https://www.instagram.com/study.quotes/",
    avatar: "💬",
    bio: "Daily quotes to keep you motivated through your study journey",
    tags: ["Quotes", "Inspiration", "Daily Motivation"],
  },
  {
    id: "7",
    handle: "@productivitygame",
    name: "Productivity Game",
    followers: "750K",
    niche: "Productivity systems, habit building, goal setting",
    profileUrl: "https://www.instagram.com/productivitygame/",
    avatar: "🎮",
    bio: "Level up your productivity with proven systems",
    tags: ["Habits", "Goals", "Systems"],
  },
  {
    id: "8",
    handle: "@medschoolinsiders",
    name: "Med School Insiders",
    followers: "420K",
    niche: "Study techniques, memory hacks, exam strategies",
    profileUrl: "https://www.instagram.com/medschoolinsiders/",
    avatar: "🧠",
    bio: "Evidence-based study techniques that actually work",
    tags: ["Memory", "Techniques", "Evidence-Based"],
  },
];

// ============================================================
// STUDY METHOD REELS (Curated Content Themes)
// ============================================================

const STUDY_REELS = [
  {
    id: "r1",
    title: "The Pomodoro Technique Explained in 60 Seconds",
    influencer: "@theproductiveoutfit",
    views: "2.4M",
    likes: "180K",
    description: "Work 25 min, break 5 min, repeat 4x, long break 15 min. Simple but life-changing for focus.",
    thumbnail: "🍅",
    tags: ["Productivity", "Focus", "Time Management"],
    duration: "0:58",
    category: "technique",
    url: "https://www.instagram.com/reel/study-pomodoro/",
  },
  {
    id: "r2",
    title: "How I Scored 95% in My Finals — Study Routine",
    influencer: "@girls.whostudy",
    views: "3.1M",
    likes: "250K",
    description: "My complete study routine: Active recall, spaced repetition, and strategic breaks.",
    thumbnail: "🎯",
    tags: ["Exam Prep", "Routine", "High Scores"],
    duration: "1:30",
    category: "routine",
    url: "https://www.instagram.com/reel/study-routine/",
  },
  {
    id: "r3",
    title: "5 Note-Taking Methods That Actually Work",
    influencer: "@studyist",
    views: "1.8M",
    likes: "145K",
    description: "Cornell Method, Mind Mapping, Outline, Charting, and Sentence Method compared.",
    thumbnail: "📝",
    tags: ["Notes", "Methods", "Learning"],
    duration: "1:15",
    category: "technique",
    url: "https://www.instagram.com/reel/study-notes/",
  },
  {
    id: "r4",
    title: "Active Recall: The #1 Study Technique Backed by Science",
    influencer: "@medschoolinsiders",
    views: "4.2M",
    likes: "320K",
    description: "Testing yourself is 50% more effective than re-reading. Here's how to do it properly.",
    thumbnail: "🧠",
    tags: ["Active Recall", "Science", "Memory"],
    duration: "1:45",
    category: "technique",
    url: "https://www.instagram.com/reel/study-active-recall/",
  },
  {
    id: "r5",
    title: "Study With Me — 2 Hour Deep Focus Session",
    influencer: "@studywithme",
    views: "5.6M",
    likes: "410K",
    description: "Real-time study session with lo-fi music. Join me for 2 hours of focused work.",
    thumbnail: "🎧",
    tags: ["Study With Me", "Deep Work", "Lo-fi"],
    duration: "2:00:00",
    category: "study-with-me",
    url: "https://www.instagram.com/reel/study-deep-focus/",
  },
  {
    id: "r6",
    title: "Spaced Repetition: Never Forget What You Learn",
    influencer: "@medschoolinsiders",
    views: "2.8M",
    likes: "210K",
    description: "Review at increasing intervals: 1 day, 3 days, 7 days, 14 days, 30 days.",
    thumbnail: "🔄",
    tags: ["Spaced Repetition", "Memory", "Long-term"],
    duration: "1:20",
    category: "technique",
    url: "https://www.instagram.com/reel/study-spaced/",
  },
  {
    id: "r7",
    title: "My Aesthetic Study Desk Setup Tour",
    influencer: "@amstudyin",
    views: "1.5M",
    likes: "120K",
    description: "How I organized my desk for maximum productivity and aesthetic vibes.",
    thumbnail: "🖥️",
    tags: ["Desk Setup", "Aesthetic", "Productivity"],
    duration: "0:45",
    category: "lifestyle",
    url: "https://www.instagram.com/reel/study-desk/",
  },
  {
    id: "r8",
    title: "The Feynman Technique — Learn Anything Faster",
    influencer: "@productivitygame",
    views: "3.3M",
    likes: "265K",
    description: "Explain it like you're teaching a 5-year-old. If you can't, you don't understand it yet.",
    thumbnail: "🎓",
    tags: ["Feynman", "Learning", "Understanding"],
    duration: "1:10",
    category: "technique",
    url: "https://www.instagram.com/reel/study-feynman/",
  },
  {
    id: "r9",
    title: "How to Stay Motivated During Exam Season",
    influencer: "@study.quotes",
    views: "2.1M",
    likes: "175K",
    description: "5 practical tips to maintain motivation when exams feel overwhelming.",
    thumbnail: "🔥",
    tags: ["Motivation", "Exams", "Mental Health"],
    duration: "1:00",
    category: "motivation",
    url: "https://www.instagram.com/reel/study-motivation/",
  },
  {
    id: "r10",
    title: "Pomodoro vs 52/17 — Which Works Better?",
    influencer: "@theproductiveoutfit",
    views: "1.9M",
    likes: "155K",
    description: "I tried both for 30 days. Here are the results and which one I recommend.",
    thumbnail: "⚖️",
    tags: ["Productivity", "Comparison", "Experiment"],
    duration: "1:35",
    category: "technique",
    url: "https://www.instagram.com/reel/study-pomodoro-vs/",
  },
  {
    id: "r11",
    title: "Morning Study Routine — How I Start My Day",
    influencer: "@girls.whostudy",
    views: "2.7M",
    likes: "200K",
    description: "Wake up at 6am, exercise, review flashcards, then deep study session.",
    thumbnail: "🌅",
    tags: ["Morning Routine", "Discipline", "Habits"],
    duration: "1:25",
    category: "routine",
    url: "https://www.instagram.com/reel/study-morning/",
  },
  {
    id: "r12",
    title: "Mind Mapping for Complex Topics",
    influencer: "@studyist",
    views: "1.3M",
    likes: "98K",
    description: "How I use mind maps to understand interconnected concepts in CS and engineering.",
    thumbnail: "🗺️",
    tags: ["Mind Map", "Visual Learning", "CS"],
    duration: "1:05",
    category: "technique",
    url: "https://www.instagram.com/reel/study-mindmap/",
  },
];

// ============================================================
// STUDY QUOTES
// ============================================================

const STUDY_QUOTES = [
  {
    id: "q1",
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
    icon: "🌱",
    category: "growth",
  },
  {
    id: "q2",
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    icon: "💪",
    category: "consistency",
  },
  {
    id: "q3",
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    icon: "🐢",
    category: "perseverance",
  },
  {
    id: "q4",
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    icon: "❤️",
    category: "passion",
  },
  {
    id: "q5",
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    icon: "🌍",
    category: "impact",
  },
  {
    id: "q6",
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    icon: "📖",
    category: "growth",
  },
  {
    id: "q7",
    text: "Don't let what you cannot do interfere with what you can do.",
    author: "John Wooden",
    icon: "🎯",
    category: "mindset",
  },
  {
    id: "q8",
    text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss",
    icon: "🚀",
    category: "growth",
  },
  {
    id: "q9",
    text: "I have no special talents. I am only passionately curious.",
    author: "Albert Einstein",
    icon: "🔍",
    category: "curiosity",
  },
  {
    id: "q10",
    text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.",
    author: "Richard Feynman",
    icon: "⚡",
    category: "passion",
  },
  {
    id: "q11",
    text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
    author: "Brian Herbert",
    icon: "🎓",
    category: "mindset",
  },
  {
    id: "q12",
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    icon: "🦁",
    category: "perseverance",
  },
];

// ============================================================
// STUDY TIPS (Instagram-Style Carousel Posts)
// ============================================================

const STUDY_TIPS = [
  {
    id: "t1",
    title: "The 3-2-1 Study Rule",
    slides: [
      "3 hours before bed: Stop new material",
      "2 hours before bed: Light review only",
      "1 hour before bed: No studying — relax",
      "Sleep consolidates memory better than cramming!",
    ],
    icon: "🌙",
    category: "sleep",
    source: "@medschoolinsiders",
  },
  {
    id: "t2",
    title: "The 80/20 Study Principle",
    slides: [
      "80% of exam questions come from 20% of topics",
      "Identify the core 20% first",
      "Master those before touching the rest",
      "Past papers reveal the high-yield topics",
    ],
    icon: "📊",
    category: "strategy",
    source: "@productivitygame",
  },
  {
    id: "t3",
    title: "Blurting Method for Revision",
    slides: [
      "Read a section of your notes",
      "Close the book completely",
      "Write everything you remember",
      "Compare with original — fill gaps",
      "Repeat until perfect recall",
    ],
    icon: "✍️",
    category: "technique",
    source: "@studyist",
  },
  {
    id: "t4",
    title: "Study Snacking > Study Binging",
    slides: [
      "30 min daily beats 5-hour weekend cram",
      "Consistent small sessions compound",
      "Your brain needs time to process",
      "Short sessions = better retention",
    ],
    icon: "🍿",
    category: "habit",
    source: "@theproductiveoutfit",
  },
  {
    id: "t5",
    title: "The Study Environment Checklist",
    slides: [
      "✅ Good lighting (natural preferred)",
      "✅ Phone in another room or Do Not Disturb",
      "✅ Water bottle within reach",
      "✅ Clean desk, minimal distractions",
      "✅ Timer set (Pomodoro or 52/17)",
    ],
    icon: "🏠",
    category: "environment",
    source: "@studywithme",
  },
  {
    id: "t6",
    title: "How to Take Effective Notes",
    slides: [
      "Use Cornell Method for lectures",
      "Write in your own words, not verbatim",
      "Add diagrams and visual connections",
      "Review and rewrite within 24 hours",
      "Color code by concept, not by chapter",
    ],
    icon: "📝",
    category: "notes",
    source: "@studyist",
  },
];

// ============================================================
// API ROUTE
// ============================================================

export async function GET(request: Request) {
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.read);
  if (rl.limited) return rl.response;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  switch (type) {
    case "influencers":
      return NextResponse.json({ influencers: STUDY_INFLUENCERS });

    case "reels": {
      const category = searchParams.get("category");
      const reels = category
        ? STUDY_REELS.filter((r) => r.category === category)
        : STUDY_REELS;
      return NextResponse.json({ reels });
    }

    case "quotes": {
      const category = searchParams.get("category");
      const quotes = category
        ? STUDY_QUOTES.filter((q) => q.category === category)
        : STUDY_QUOTES;
      return NextResponse.json({ quotes });
    }

    case "tips": {
      const category = searchParams.get("category");
      const tips = category
        ? STUDY_TIPS.filter((t) => t.category === category)
        : STUDY_TIPS;
      return NextResponse.json({ tips });
    }

    default:
      // Return everything
      return NextResponse.json({
        influencers: STUDY_INFLUENCERS,
        reels: STUDY_REELS,
        quotes: STUDY_QUOTES,
        tips: STUDY_TIPS,
      });
  }
}
