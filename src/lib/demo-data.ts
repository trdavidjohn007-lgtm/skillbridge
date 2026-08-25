/**
 * Demo data for when the database is unavailable.
 * Makes every page feel alive during hackathon demos.
 */

export const DEMO_PROFILE = {
  user: {
    id: "demo-user-001",
    email: "demo@student.edu",
    name: "demo",
    role: "learner",
  },
  tutorProfile: {
    anonymousName: "Tutor_Alpha",
    avatarUrl: "https://ui-avatars.com/api/?name=TA&background=FF6B00&color=fff&bold=true&size=128",
    subjects: ["Python", "DSA", "Web Development"],
    isOnline: true,
    totalHours: "12.5",
    totalSessions: 8,
    avgRating: "4.75",
    trustScore: "4.80",
    verifiedBadge: true,
  },
  learnerProfile: {
    anonymousName: "Scholar_Omega",
    avatarUrl: "https://ui-avatars.com/api/?name=SO&background=3B82F6&color=fff&bold=true&size=128",
    interests: ["Python", "DSA", "Machine Learning"],
    totalHours: "8.3",
    totalSessions: 5,
  },
  credits: 100,
};

export const DEMO_SESSIONS = [
  {
    id: "demo-sess-001",
    status: "completed",
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    durationSeconds: 1800,
    creditsTransferred: 30,
    topic: "Binary Trees traversal in DSA",
    tags: ["DSA", "Trees"],
    tutorName: "Tutor_Beta",
    tutorAvatar: "https://ui-avatars.com/api/?name=TB&background=10B981&color=fff&bold=true&size=64",
    learnerName: "Scholar_Omega",
    learnerAvatar: "https://ui-avatars.com/api/?name=SO&background=3B82F6&color=fff&bold=true&size=64",
    isTutor: false,
  },
  {
    id: "demo-sess-002",
    status: "completed",
    startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 25.5 * 60 * 60 * 1000).toISOString(),
    durationSeconds: 2400,
    creditsTransferred: 40,
    topic: "React useEffect cleanup patterns",
    tags: ["Web Development", "React"],
    tutorName: "Tutor_Gamma",
    tutorAvatar: "https://ui-avatars.com/api/?name=TG&background=8B5CF6&color=fff&bold=true&size=64",
    learnerName: "Scholar_Omega",
    learnerAvatar: "https://ui-avatars.com/api/?name=SO&background=3B82F6&color=fff&bold=true&size=64",
    isTutor: false,
  },
  {
    id: "demo-sess-003",
    status: "active",
    startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    endedAt: null,
    durationSeconds: null,
    creditsTransferred: null,
    topic: "SQL JOIN types explained",
    tags: ["DBMS", "SQL"],
    tutorName: "Tutor_Alpha",
    tutorAvatar: "https://ui-avatars.com/api/?name=TA&background=FF6B00&color=fff&bold=true&size=64",
    learnerName: "Scholar_Delta",
    learnerAvatar: "https://ui-avatars.com/api/?name=SD&background=EF4444&color=fff&bold=true&size=64",
    isTutor: true,
  },
  {
    id: "demo-sess-004",
    status: "completed",
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2700 * 1000).toISOString(),
    durationSeconds: 2700,
    creditsTransferred: 45,
    topic: "Big-O notation and complexity analysis",
    tags: ["DSA", "Algorithms"],
    tutorName: "Tutor_Beta",
    tutorAvatar: "https://ui-avatars.com/api/?name=TB&background=10B981&color=fff&bold=true&size=64",
    learnerName: "Scholar_Omega",
    learnerAvatar: "https://ui-avatars.com/api/?name=SO&background=3B82F6&color=fff&bold=true&size=64",
    isTutor: false,
  },
  {
    id: "demo-sess-005",
    status: "completed",
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1500 * 1000).toISOString(),
    durationSeconds: 1500,
    creditsTransferred: 25,
    topic: "Python list comprehensions and generators",
    tags: ["Python"],
    tutorName: "Tutor_Epsilon",
    tutorAvatar: "https://ui-avatars.com/api/?name=TE&background=F59E0B&color=fff&bold=true&size=64",
    learnerName: "Scholar_Omega",
    learnerAvatar: "https://ui-avatars.com/api/?name=SO&background=3B82F6&color=fff&bold=true&size=64",
    isTutor: false,
  },
];

export const DEMO_REQUESTS = [
  {
    id: "demo-req-001",
    learnerId: "demo-user-002",
    topic: "Help with dynamic programming knapsack problem",
    description: "I understand the basic concept but can't figure out the state transition. Need someone to walk me through it step by step.",
    tags: ["DSA", "Dynamic Programming"],
    durationMins: 30,
    creditCost: 30,
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    learnerName: "Scholar_Delta",
    learnerAvatar: "https://ui-avatars.com/api/?name=SD&background=EF4444&color=fff&bold=true&size=64",
  },
  {
    id: "demo-req-002",
    learnerId: "demo-user-003",
    topic: "React hooks useEffect vs useMemo",
    description: "Confused about when to use which hook. Need practical examples.",
    tags: ["Web Development", "React"],
    durationMins: 15,
    creditCost: 15,
    status: "pending",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    learnerName: "Scholar_Zeta",
    learnerAvatar: "https://ui-avatars.com/api/?name=SZ&background=06B6D4&color=fff&bold=true&size=64",
  },
  {
    id: "demo-req-003",
    learnerId: "demo-user-004",
    topic: "SQL LEFT JOIN vs INNER JOIN with real examples",
    description: "I keep mixing up join types. Need someone to show me with actual tables.",
    tags: ["DBMS", "SQL"],
    durationMins: 30,
    creditCost: 30,
    status: "pending",
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    learnerName: "Scholar_Eta",
    learnerAvatar: "https://ui-avatars.com/api/?name=SE&background=EC4899&color=fff&bold=true&size=64",
  },
  {
    id: "demo-req-004",
    learnerId: "demo-user-005",
    topic: "Machine learning linear regression from scratch",
    description: "Want to implement linear regression without sklearn. Need help with gradient descent.",
    tags: ["Machine Learning", "Python"],
    durationMins: 60,
    creditCost: 60,
    status: "pending",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    learnerName: "Scholar_Theta",
    learnerAvatar: "https://ui-avatars.com/api/?name=STH&background=7C3AED&color=fff&bold=true&size=64",
  },
  {
    id: "demo-req-005",
    learnerId: "demo-user-006",
    topic: "Operating system process scheduling algorithms",
    description: "Need to compare FCFS, SJF, Round Robin for my exam tomorrow.",
    tags: ["Operating Systems"],
    durationMins: 30,
    creditCost: 30,
    status: "pending",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    learnerName: "Scholar_Iota",
    learnerAvatar: "https://ui-avatars.com/api/?name=SI&background=059669&color=fff&bold=true&size=64",
  },
];

export const DEMO_LEADERBOARD_TUTORS = [
  { userId: "1", anonymousName: "Tutor_Beta", avatarUrl: "https://ui-avatars.com/api/?name=TB&background=10B981&color=fff&bold=true&size=128", subjects: ["DSA", "Algorithms", "Python"], totalHours: "45.2", totalSessions: 32, avgRating: "4.92", trustScore: "4.95", verifiedBadge: true, score: 113.2 },
  { userId: "2", anonymousName: "Tutor_Alpha", avatarUrl: "https://ui-avatars.com/api/?name=TA&background=FF6B00&color=fff&bold=true&size=128", subjects: ["Python", "DSA", "Web Development"], totalHours: "38.5", totalSessions: 28, avgRating: "4.75", trustScore: "4.80", verifiedBadge: true, score: 94.5 },
  { userId: "3", anonymousName: "Tutor_Gamma", avatarUrl: "https://ui-avatars.com/api/?name=TG&background=8B5CF6&color=fff&bold=true&size=128", subjects: ["Web Development", "React", "Node.js"], totalHours: "28.0", totalSessions: 20, avgRating: "4.85", trustScore: "4.70", verifiedBadge: true, score: 76.0 },
  { userId: "4", anonymousName: "Tutor_Delta", avatarUrl: "https://ui-avatars.com/api/?name=TD&background=EF4444&color=fff&bold=true&size=128", subjects: ["DBMS", "SQL", "Operating Systems"], totalHours: "22.5", totalSessions: 15, avgRating: "4.60", trustScore: "4.50", verifiedBadge: false, score: 56.5 },
  { userId: "5", anonymousName: "Tutor_Epsilon", avatarUrl: "https://ui-avatars.com/api/?name=TE&background=F59E0B&color=fff&bold=true&size=128", subjects: ["Machine Learning", "Data Science", "Python"], totalHours: "18.0", totalSessions: 12, avgRating: "4.70", trustScore: "4.60", verifiedBadge: true, score: 47.0 },
];

export const DEMO_LEADERBOARD_LEARNERS = [
  { userId: "10", anonymousName: "Scholar_Omega", avatarUrl: "https://ui-avatars.com/api/?name=SO&background=3B82F6&color=fff&bold=true&size=128", interests: ["Python", "DSA"], totalHours: "25.3", totalSessions: 18, score: 116.5 },
  { userId: "11", anonymousName: "Scholar_Delta", avatarUrl: "https://ui-avatars.com/api/?name=SD&background=EF4444&color=fff&bold=true&size=128", interests: ["DSA", "Operating Systems"], totalHours: "18.7", totalSessions: 12, score: 73.5 },
  { userId: "12", anonymousName: "Scholar_Zeta", avatarUrl: "https://ui-avatars.com/api/?name=SZ&background=06B6D4&color=fff&bold=true&size=128", interests: ["Web Development", "React"], totalHours: "15.2", totalSessions: 10, score: 60.2 },
  { userId: "13", anonymousName: "Scholar_Eta", avatarUrl: "https://ui-avatars.com/api/?name=SE&background=EC4899&color=fff&bold=true&size=128", interests: ["DBMS", "SQL"], totalHours: "12.0", totalSessions: 8, score: 46.0 },
  { userId: "14", anonymousName: "Scholar_Theta", avatarUrl: "https://ui-avatars.com/api/?name=STH&background=7C3AED&color=fff&bold=true&size=128", interests: ["Machine Learning", "Python"], totalHours: "10.5", totalSessions: 6, score: 36.5 },
];

export const DEMO_CREDIT_TRANSACTIONS = [
  { id: "tx-1", amount: 100, type: "signup_bonus", description: "Welcome bonus! You received 100 credits to start learning.", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), balance: 100 },
  { id: "tx-2", amount: -30, type: "session_spend", description: "Posted help request: Binary Trees traversal", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), balance: 70 },
  { id: "tx-3", amount: 30, type: "session_earn", description: "Earned 30 credits for tutoring SQL JOINs", createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), balance: 100 },
  { id: "tx-4", amount: -15, type: "session_spend", description: "Posted help request: React hooks", createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), balance: 85 },
  { id: "tx-5", amount: 40, type: "session_earn", description: "Earned 40 credits for tutoring React patterns", createdAt: new Date(Date.now() - 25.5 * 60 * 60 * 1000).toISOString(), balance: 125 },
];

/**
 * Check if database is available. Returns demo data if not.
 */
export async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // If API returns empty array or error, use fallback
    if (Array.isArray(data) && data.length === 0) return fallback;
    if (data.error) return fallback;
    return data;
  } catch {
    return fallback;
  }
}
