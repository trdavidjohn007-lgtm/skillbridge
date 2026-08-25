import { db, initializeDatabase } from "@/modules/core/db/sqlite";
import { users, tutorProfiles, p2pLearnerProfiles, helpRequests, sessions, sessionMessages, creditLedger, resources } from "@/modules/core/db/sqlite-schema";

// ============================================================
// SEED DATA
// ============================================================

const DEMO_USERS = [
  { id: "user-001", email: "alice@university.edu", name: "Alice", role: "both" },
  { id: "user-002", email: "bob@university.edu", name: "Bob", role: "learner" },
  { id: "user-003", email: "charlie@university.edu", name: "Charlie", role: "tutor" },
  { id: "user-004", email: "diana@university.edu", name: "Diana", role: "both" },
  { id: "user-005", email: "eve@university.edu", name: "Eve", role: "learner" },
];

const DEMO_TUTORS = [
  {
    id: "tutor-001",
    userId: "user-001",
    subjects: JSON.stringify(["Python", "DSA", "Machine Learning"]),
    totalHours: 45.5,
    totalSessions: 23,
    avgRating: 4.8,
    trustScore: 4.9,
    verifiedBadge: true,
    anonymousName: "Tutor_Nova",
    avatarUrl: "https://ui-avatars.com/api/?name=TN&background=F97316&color=fff&bold=true",
  },
  {
    id: "tutor-002",
    userId: "user-003",
    subjects: JSON.stringify(["Web Development", "React", "Node.js"]),
    totalHours: 32.0,
    totalSessions: 18,
    avgRating: 4.6,
    trustScore: 4.7,
    verifiedBadge: true,
    anonymousName: "Tutor_Sigma",
    avatarUrl: "https://ui-avatars.com/api/?name=TS&background=8B5CF6&color=fff&bold=true",
  },
  {
    id: "tutor-003",
    userId: "user-004",
    subjects: JSON.stringify(["DBMS", "SQL", "Operating Systems"]),
    totalHours: 28.0,
    totalSessions: 15,
    avgRating: 4.5,
    trustScore: 4.6,
    verifiedBadge: true,
    anonymousName: "Tutor_Delta",
    avatarUrl: "https://ui-avatars.com/api/?name=TD&background=10B981&color=fff&bold=true",
  },
];

const DEMO_LEARNERS = [
  {
    id: "learner-001",
    userId: "user-002",
    interests: JSON.stringify(["Python", "DSA", "Web Development"]),
    totalHours: 12.0,
    totalSessions: 6,
    anonymousName: "Learner_Alpha",
    avatarUrl: "https://ui-avatars.com/api/?name=LA&background=3B82F6&color=fff&bold=true",
  },
  {
    id: "learner-002",
    userId: "user-005",
    interests: JSON.stringify(["Machine Learning", "Data Science", "Python"]),
    totalHours: 8.5,
    totalSessions: 4,
    anonymousName: "Learner_Beta",
    avatarUrl: "https://ui-avatars.com/api/?name=LB&background=EF4444&color=fff&bold=true",
  },
];

const DEMO_REQUESTS = [
  {
    id: "req-001",
    learnerId: "user-002",
    topic: "Binary Trees in DSA",
    description: "I need help understanding binary tree traversal algorithms and their time complexity.",
    tags: JSON.stringify(["DSA", "Trees"]),
    durationMins: 30,
    creditCost: 30,
    status: "pending",
  },
  {
    id: "req-002",
    learnerId: "user-005",
    topic: "React useEffect cleanup",
    description: "Confused about when and how to use cleanup functions in useEffect hooks.",
    tags: JSON.stringify(["Web Development", "React"]),
    durationMins: 15,
    creditCost: 15,
    status: "pending",
  },
  {
    id: "req-003",
    learnerId: "user-002",
    topic: "SQL JOIN types",
    description: "Need help understanding the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN.",
    tags: JSON.stringify(["DBMS", "SQL"]),
    durationMins: 30,
    creditCost: 30,
    status: "pending",
  },
];

const DEMO_RESOURCES = [
  { id: "res-001", topic: "Python", title: "Python for Everybody", url: "https://www.py4e.com/", platform: "Coursera", type: "course", difficulty: "beginner", description: "Comprehensive Python course by Dr. Chuck." },
  { id: "res-002", topic: "DSA", title: "Striver's A2Z DSA Sheet", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/", platform: "takeUforward", type: "practice", difficulty: "beginner", description: "Complete DSA roadmap with 450+ problems." },
  { id: "res-003", topic: "Web Development", title: "The Odin Project", url: "https://www.theodinproject.com/", platform: "Free Course", type: "course", difficulty: "beginner", description: "Full stack web development curriculum." },
  { id: "res-004", topic: "DBMS", title: "SQLBolt Interactive SQL", url: "https://sqlbolt.com/", platform: "SQLBolt", type: "interactive", difficulty: "beginner", description: "Learn SQL with interactive exercises." },
  { id: "res-005", topic: "Machine Learning", title: "Andrew Ng's ML Specialization", url: "https://www.coursera.org/specializations/machine-learning-introduction", platform: "Coursera", type: "course", difficulty: "beginner", description: "Andrew Ng's legendary ML course." },
  { id: "res-006", topic: "Operating Systems", title: "OSTEP - Three Easy Pieces", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", platform: "OSTEP", type: "docs", difficulty: "intermediate", description: "Free OS textbook." },
];

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Initialize tables
  initializeDatabase();

  // Check if already seeded
  const existingUsers = db.select().from(users).all();
  if (existingUsers.length > 0) {
    console.log("✅ Database already seeded");
    return;
  }

  // Insert users
  for (const user of DEMO_USERS) {
    db.insert(users).values({
      ...user,
      createdAt: new Date().toISOString(),
    }).run();
  }
  console.log(`✅ Inserted ${DEMO_USERS.length} users`);

  // Insert tutor profiles
  for (const tutor of DEMO_TUTORS) {
    db.insert(tutorProfiles).values({
      ...tutor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).run();
  }
  console.log(`✅ Inserted ${DEMO_TUTORS.length} tutor profiles`);

  // Insert learner profiles
  for (const learner of DEMO_LEARNERS) {
    db.insert(p2pLearnerProfiles).values({
      ...learner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).run();
  }
  console.log(`✅ Inserted ${DEMO_LEARNERS.length} learner profiles`);

  // Insert help requests
  for (const request of DEMO_REQUESTS) {
    db.insert(helpRequests).values({
      ...request,
      createdAt: new Date().toISOString(),
    }).run();
  }
  console.log(`✅ Inserted ${DEMO_REQUESTS.length} help requests`);

  // Insert resources
  for (const resource of DEMO_RESOURCES) {
    db.insert(resources).values({
      ...resource,
      createdAt: new Date().toISOString(),
    }).run();
  }
  console.log(`✅ Inserted ${DEMO_RESOURCES.length} resources`);

  // Insert credit ledger entries (signup bonuses)
  for (const user of DEMO_USERS) {
    db.insert(creditLedger).values({
      id: `credit-${user.id}`,
      userId: user.id,
      amount: 100,
      type: "signup_bonus",
      description: "Welcome bonus! You received 100 credits to start learning.",
      balance: 100,
      createdAt: new Date().toISOString(),
    }).run();
  }
  console.log(`✅ Inserted ${DEMO_USERS.length} credit ledger entries`);

  console.log("🎉 Database seeded successfully!");
}

// Run if called directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}
