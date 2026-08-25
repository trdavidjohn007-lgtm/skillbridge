import { NextResponse } from "next/server";
import { db } from "@/modules/core/db/sqlite";
import { resources, tutorProfiles } from "@/modules/core/db/sqlite-schema";
import { eq, and, sql } from "drizzle-orm";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp, sanitizeText, MAX_SIZES } from "@/lib/sanitize";

// Topic knowledge base for SkillBot
const TOPIC_KNOWLEDGE: Record<
  string,
  {
    description: string;
    prerequisites: string[];
    nextTopics: string[];
    tips: string[];
  }
> = {
  Python: {
    description:
      "Python is a versatile, beginner-friendly language used in web dev, data science, AI, and automation.",
    prerequisites: [],
    nextTopics: ["DSA", "Machine Learning", "Web Development"],
    tips: [
      "Start with basic syntax, then move to OOP",
      "Practice on LeetCode/HackerRank",
      "Build a small project like a calculator or to-do app",
    ],
  },
  DSA: {
    description:
      "Data Structures & Algorithms are the foundation of efficient programming and interview preparation.",
    prerequisites: ["Python", "C++", "Java"],
    nextTopics: ["Web Development", "Machine Learning"],
    tips: [
      "Start with arrays and strings",
      "Master recursion before trees and graphs",
      "Practice 2-3 problems daily on LeetCode",
    ],
  },
  "Web Development": {
    description:
      "Web development covers HTML, CSS, JavaScript, and frameworks like React for building websites.",
    prerequisites: ["Python"],
    nextTopics: ["DBMS", "DevOps"],
    tips: [
      "Learn HTML/CSS/JS basics first",
      "Build projects, not just tutorials",
      "Learn Git for version control",
    ],
  },
  DBMS: {
    description:
      "Database Management Systems teach you to store, query, and manage data efficiently.",
    prerequisites: [],
    nextTopics: ["Web Development", "Data Science"],
    tips: [
      "Start with SQL fundamentals",
      "Practice JOINs extensively",
      "Learn about normalization and indexing",
    ],
  },
  "Machine Learning": {
    description:
      "ML enables computers to learn from data - used in recommendation systems, image recognition, and more.",
    prerequisites: ["Python", "DSA"],
    nextTopics: ["Data Science", "Cybersecurity"],
    tips: [
      "Master Python + NumPy/Pandas first",
      "Start with linear regression",
      "Practice on Kaggle datasets",
    ],
  },
  "Operating Systems": {
    description:
      "OS concepts cover process management, memory, file systems, and system calls.",
    prerequisites: ["C Programming"],
    nextTopics: ["Computer Networks", "Cybersecurity"],
    tips: [
      "Focus on process scheduling and memory management",
      "Understand virtual memory and paging",
      "Practice GATE-level problems",
    ],
  },
  "Computer Networks": {
    description:
      "CN covers how computers communicate - TCP/IP, HTTP, routing, and network security.",
    prerequisites: ["Operating Systems"],
    nextTopics: ["Cybersecurity", "DevOps"],
    tips: [
      "Learn the OSI model thoroughly",
      "Practice subnetting and IP addressing",
      "Understand HTTP/HTTPS protocols",
    ],
  },
  "C Programming": {
    description:
      "C is the foundation of systems programming - pointers, memory management, and low-level operations.",
    prerequisites: [],
    nextTopics: ["Operating Systems", "DSA", "C++"],
    tips: [
      "Master pointers and memory allocation",
      "Practice with struct and linked lists",
      "Build small system utilities",
    ],
  },
  Java: {
    description:
      "Java is a widely-used OOP language for enterprise apps, Android development, and backend systems.",
    prerequisites: ["C Programming"],
    nextTopics: ["DSA", "Web Development"],
    tips: [
      "Master OOP concepts thoroughly",
      "Learn collections framework",
      "Practice with multithreading",
    ],
  },
  Cpp: {
    description:
      "C++ combines C's power with OOP - used in competitive programming, game dev, and systems.",
    prerequisites: ["C Programming"],
    nextTopics: ["DSA", "Operating Systems"],
    tips: [
      "Learn STL containers and algorithms",
      "Practice competitive programming",
      "Understand templates and RAII",
    ],
  },
  Cybersecurity: {
    description:
      "Cybersecurity covers protecting systems, networks, and data from digital attacks.",
    prerequisites: ["Operating Systems", "Computer Networks"],
    nextTopics: ["DevOps"],
    tips: [
      "Start with networking fundamentals",
      "Learn about common vulnerabilities",
      "Practice on CTF (Capture The Flag) platforms",
    ],
  },
  "Data Science": {
    description:
      "Data Science combines statistics, ML, and programming to extract insights from data.",
    prerequisites: ["Python", "Machine Learning"],
    nextTopics: [],
    tips: [
      "Master Pandas and data visualization",
      "Learn statistical analysis basics",
      "Build end-to-end data projects",
    ],
  },
  DevOps: {
    description:
      "DevOps practices combine development and operations for faster, more reliable software delivery.",
    prerequisites: ["Web Development"],
    nextTopics: [],
    tips: [
      "Learn Docker and containerization",
      "Master Git and CI/CD pipelines",
      "Understand cloud platforms (AWS/GCP)",
    ],
  },
};

// Intent detection
function detectIntent(
  message: string
): {
  type: string;
  topic: string | null;
} {
  const lower = message.toLowerCase();

  // Resource recommendation intent
  for (const topic of Object.keys(TOPIC_KNOWLEDGE)) {
    const topicLower = topic.toLowerCase();
    if (
      lower.includes(topicLower) ||
      lower.includes(topicLower.replace(/\s+/g, ""))
    ) {
      if (
        lower.includes("learn") ||
        lower.includes("teach") ||
        lower.includes("help") ||
        lower.includes("resource") ||
        lower.includes("course") ||
        lower.includes("tutorial")
      ) {
        return { type: "resource", topic };
      }
    }
  }

  // Study plan intent
  if (
    lower.includes("what should i") ||
    lower.includes("next topic") ||
    lower.includes("after") ||
    lower.includes("prerequisite") ||
    lower.includes("roadmap")
  ) {
    for (const topic of Object.keys(TOPIC_KNOWLEDGE)) {
      if (lower.includes(topic.toLowerCase())) {
        return { type: "study_plan", topic };
      }
    }
    return { type: "study_plan", topic: null };
  }

  // Progress check intent
  if (
    lower.includes("progress") ||
    lower.includes("how am i") ||
    lower.includes("stats") ||
    lower.includes("doing")
  ) {
    return { type: "progress", topic: null };
  }

  // Quick answer intent
  if (
    lower.includes("what is") ||
    lower.includes("explain") ||
    lower.includes("define") ||
    lower.includes("difference between")
  ) {
    return { type: "quick_answer", topic: null };
  }

  // Default: resource recommendation
  return { type: "resource", topic: null };
}

function generateQuickAnswer(message: string): string {
  const lower = message.toLowerCase();

  const answers: Record<string, string> = {
    "big o": "**Big-O Notation** describes the worst-case time complexity of an algorithm.\n\n• **O(1)** — Constant: Hash table lookup\n• **O(log n)** — Logarithmic: Binary search\n• **O(n)** — Linear: Array traversal\n• **O(n log n)** — Linearithmic: Merge sort\n• **O(n²)** — Quadratic: Bubble sort\n• **O(2ⁿ)** — Exponential: Recursive Fibonacci\n\n💡 **Tip:** Focus on identifying the dominant term and dropping constants.",
    "recursion": "**Recursion** is when a function calls itself to solve smaller instances of the same problem.\n\n**Key components:**\n1. **Base case** — stops the recursion\n2. **Recursive case** — breaks problem into smaller parts\n\n**Example (factorial):**\n```\nf(n) = n * f(n-1)\nf(0) = 1  // base case\n```\n\n💡 **Tip:** Always define the base case first to prevent infinite recursion.",
    "linked list": "**Linked List** is a linear data structure where elements (nodes) are connected via pointers.\n\n**Types:**\n• **Singly Linked** — Each node points to next\n• **Doubly Linked** — Points to both next and prev\n• **Circular** — Last node points to first\n\n**Advantages:** O(1) insertion/deletion\n**Disadvantages:** O(n) search, no random access\n\n💡 **Tip:** Practice implementing from scratch to understand memory management.",
    sorting: "**Common Sorting Algorithms:**\n\n• **Bubble Sort** — O(n²) — Simple but slow\n• **Merge Sort** — O(n log n) — Stable, divide & conquer\n• **Quick Sort** — O(n log n) avg — In-place, fast in practice\n• **Insertion Sort** — O(n²) — Good for small/nearly sorted\n• **Heap Sort** — O(n log n) — Uses heap data structure\n\n💡 **Tip:** Merge sort is the safest choice; Quick sort is fastest in practice.",
    "array vs linked list": "**Array vs Linked List:**\n\n**Array:**\n• ✅ O(1) random access\n• ✅ Cache-friendly\n• ❌ Fixed size (or costly resize)\n• ❌ O(n) insertion/deletion\n\n**Linked List:**\n• ✅ Dynamic size\n• ✅ O(1) insertion/deletion (at known position)\n• ❌ O(n) search/access\n• ❌ Extra memory for pointers",
  };

  const normalizedLower = lower.replace(/-/g, " ");
  for (const [key, answer] of Object.entries(answers)) {
    if (normalizedLower.includes(key) || lower.includes(key)) {
      return answer;
    }
  }

  return "I can help explain CS concepts! Try asking about:\n• **Big-O notation**\n• **Recursion**\n• **Linked Lists**\n• **Sorting algorithms**\n• **Arrays vs Linked Lists**\n\nOr ask me to recommend resources for any topic!";
}

// POST /api/p2p/chatbot - Process chatbot messages
export async function POST(request: Request) {
  // Rate limit chatbot
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.chatbot);
  if (rl.limited) return rl.response;

  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    // Sanitize and limit message size
    const cleanMessage = sanitizeText(message).slice(0, MAX_SIZES.message);
    if (cleanMessage.length === 0) {
      return NextResponse.json(
        { error: "Empty message" },
        { status: 400 }
      );
    }

    const intent = detectIntent(cleanMessage);

    let response: {
      text: string;
      resources?: any[];
      suggestions?: string[];
    } = { text: "", resources: [], suggestions: [] };

    switch (intent.type) {
      case "resource": {
        if (intent.topic) {
          const knowledge = TOPIC_KNOWLEDGE[intent.topic];
          // Fetch resources from DB, fall back to curated list if DB unavailable
          let dbResources: any[] = [];
          try {
            dbResources = await db
              .select()
              .from(resources)
              .where(eq(resources.topic, intent.topic))
              .limit(6);
          } catch {
            // DB unavailable — use curated fallback resources
            const CURATED_RESOURCES: Record<string, any[]> = {
              Python: [
                { id: "cr-py1", title: "Python for Everybody", platform: "Coursera", url: "https://www.py4e.com/", difficulty: "beginner" },
                { id: "cr-py2", title: "Python Tutorial - W3Schools", platform: "W3Schools", url: "https://www.w3schools.com/python/", difficulty: "beginner" },
                { id: "cr-py3", title: "Corey Schafer Python YouTube", platform: "YouTube", url: "https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbzXhwoFUiLCjGgY7", difficulty: "beginner" },
                { id: "cr-py4", title: "Automate the Boring Stuff with Python", platform: "Course", url: "https://automatetheboringstuff.com/", difficulty: "beginner" },
                { id: "cr-py5", title: "Real Python Tutorials", platform: "Docs", url: "https://realpython.com/", difficulty: "intermediate" },
                { id: "cr-py6", title: "LeetCode Python Problems", platform: "LeetCode", url: "https://leetcode.com/problemset/all/?languageTags=python", difficulty: "intermediate" },
              ],
              DSA: [
                { id: "cr-dsa1", title: "Striver's A2Z DSA Sheet", platform: "takeUforward", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/", difficulty: "beginner" },
                { id: "cr-dsa2", title: "NeetCode DSA Roadmap", platform: "YouTube", url: "https://neetcode.io/roadmap", difficulty: "intermediate" },
                { id: "cr-dsa3", title: "LeetCode Top 150 Problems", platform: "LeetCode", url: "https://leetcode.com/studyplan/top-150-liked/", difficulty: "intermediate" },
                { id: "cr-dsa4", title: "GeeksforGeeks DSA Self Paced", platform: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/dsa-self-paced/", difficulty: "beginner" },
                { id: "cr-dsa5", title: "Visualgo - Algorithm Visualization", platform: "Visualgo", url: "https://visualgo.net/", difficulty: "beginner" },
                { id: "cr-dsa6", title: "MIT 6.006 Algorithms", platform: "YouTube", url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63EdVPNLG3ToM6LaEUuStEY", difficulty: "advanced" },
              ],
              "Web Development": [
                { id: "cr-wd1", title: "The Odin Project", platform: "Free Course", url: "https://www.theodinproject.com/", difficulty: "beginner" },
                { id: "cr-wd2", title: "freeCodeCamp Web Dev", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/front-end-development-libraries/", difficulty: "beginner" },
                { id: "cr-wd3", title: "React Official Tutorial", platform: "React", url: "https://react.dev/learn", difficulty: "intermediate" },
                { id: "cr-wd4", title: "JavaScript.info", platform: "Docs", url: "https://javascript.info/", difficulty: "beginner" },
                { id: "cr-wd5", title: "CS50 Web Programming", platform: "Harvard/YouTube", url: "https://www.youtube.com/watch?v=2j-TM8KxMRk", difficulty: "intermediate" },
                { id: "cr-wd6", title: "roadmap.sh/frontend", platform: "roadmap.sh", url: "https://roadmap.sh/frontend", difficulty: "beginner" },
              ],
              DBMS: [
                { id: "cr-db1", title: "SQLBolt Interactive SQL Tutorial", platform: "SQLBolt", url: "https://sqlbolt.com/", difficulty: "beginner" },
                { id: "cr-db2", title: "Stanford DBMS Course", platform: "YouTube", url: "https://www.youtube.com/playlist?list=PLFa0lDcab6eZm37DXMvKmGxBh9N9tYxM4", difficulty: "intermediate" },
                { id: "cr-db3", title: "GeeksforGeeks DBMS Tutorial", platform: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/dbms/", difficulty: "beginner" },
                { id: "cr-db4", title: "Mode Analytics SQL Tutorial", platform: "Course", url: "https://mode.com/sql-tutorial/", difficulty: "beginner" },
                { id: "cr-db5", title: "HackerRank SQL Practice", platform: "HackerRank", url: "https://www.hackerrank.com/domains/sql", difficulty: "intermediate" },
                { id: "cr-db6", title: "PostgreSQL Official Docs", platform: "Docs", url: "https://www.postgresql.org/docs/current/tutorial.html", difficulty: "intermediate" },
              ],
              "Machine Learning": [
                { id: "cr-ml1", title: "Machine Learning Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-introduction", difficulty: "beginner" },
                { id: "cr-ml2", title: "3Blue1Brown Neural Networks", platform: "YouTube", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", difficulty: "beginner" },
                { id: "cr-ml3", title: "Kaggle ML Courses", platform: "Kaggle", url: "https://www.kaggle.com/learn", difficulty: "beginner" },
                { id: "cr-ml4", title: "fast.ai Practical Deep Learning", platform: "Course", url: "https://course.fast.ai/", difficulty: "intermediate" },
                { id: "cr-ml5", title: "Scikit-learn Tutorials", platform: "Docs", url: "https://scikit-learn.org/stable/tutorial/index.html", difficulty: "intermediate" },
                { id: "cr-ml6", title: "Andrew Ng ML Course Notes", platform: "Course", url: "https://www.coursera.org/learn/machine-learning", difficulty: "beginner" },
              ],
            };
            dbResources = CURATED_RESOURCES[intent.topic] || [];
          }

          response = {
            text: `📚 **Here are the best free resources for ${intent.topic}:**\n\n${knowledge?.description || ""}\n\n${knowledge ? `\n🎯 **Tips:**\n${knowledge.tips.map((t) => `• ${t}`).join("\n")}` : ""}`,
            resources: dbResources,
            suggestions: knowledge
              ? [
                  `What should I learn after ${intent.topic}?`,
                  `Explain ${intent.topic} basics`,
                  `Show me practice problems for ${intent.topic}`,
                ]
              : [],
          };
        } else {
          // General resource recommendation
          const allTopics = Object.keys(TOPIC_KNOWLEDGE);
          response = {
            text: "🎓 **I can help you find free learning resources!**\n\nWhich topic interests you?\n\n" +
              allTopics.map((t) => `• **${t}**`).join("\n") +
              "\n\nJust type the topic name and I'll find the best free courses, videos, and practice links!",
            resources: [],
            suggestions: allTopics.slice(0, 4).map((t) => `Learn ${t}`),
          };
        }
        break;
      }

      case "study_plan": {
        if (intent.topic && TOPIC_KNOWLEDGE[intent.topic]) {
          const knowledge = TOPIC_KNOWLEDGE[intent.topic];
          response = {
            text: `🗺️ **Study Plan for ${intent.topic}:**\n\n${knowledge.description}\n\n📋 **Prerequisites:**\n${knowledge.prerequisites.length > 0 ? knowledge.prerequisites.map((p) => `• ${p}`).join("\n") : "• None — you can start right away!"}\n\n➡️ **What to learn next:**\n${knowledge.nextTopics.map((n) => `• ${n}`).join("\n")}\n\n🎯 **Study Tips:**\n${knowledge.tips.map((t) => `• ${t}`).join("\n")}`,
            suggestions: [
              `Find resources for ${intent.topic}`,
              ...knowledge.nextTopics.slice(0, 2).map((t) => `Learn ${t}`),
            ],
          };
        } else {
          response = {
            text: "🗺️ **Here's a suggested learning roadmap for CS students:**\n\n**Phase 1: Foundations**\n• C Programming → Operating Systems\n• Python → DSA\n\n**Phase 2: Intermediate**\n• Web Development (HTML/CSS/JS/React)\n• DBMS (SQL, normalization)\n\n**Phase 3: Advanced**\n• Machine Learning → Data Science\n• Computer Networks → Cybersecurity\n\n**Phase 4: Specialization**\n• DevOps & Cloud\n• Advanced ML/AI\n\nWhich phase would you like to start with?",
            suggestions: [
              "Learn Python",
              "Learn DSA",
              "Learn Web Development",
            ],
          };
        }
        break;
      }

      case "progress": {
        response = {
          text: "📊 **To check your progress,** visit the **Progress Dashboard** in the app!\n\nThere you can see:\n• Your learning streak\n• Sessions completed\n• Credits earned\n• Skills map with progress bars\n• Achievement badges\n\nOr tell me which topic you're working on and I'll suggest what to focus on next!",
          suggestions: ["Show learning roadmap", "Find resources"],
        };
        break;
      }

      case "quick_answer": {
        const answer = generateQuickAnswer(message);
        response = {
          text: answer,
          suggestions: [
            "Find resources for DSA",
            "Show study roadmap",
          ],
        };
        break;
      }

      default: {
        response = {
          text: "👋 **Hi! I'm SkillBot, your learning assistant!**\n\nI can help you with:\n• 📚 **Finding free resources** — NPTEL, YouTube, GFG, LeetCode\n• 🗺️ **Study plans** — What to learn next\n• 💡 **CS concepts** — Big-O, recursion, data structures\n• 📊 **Progress tracking** — Your learning stats\n\nJust ask me anything about your studies!",
          suggestions: [
            "Learn Python",
            "Learn DSA",
            "Show learning roadmap",
          ],
        };
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      {
        text: "Sorry, I encountered an error. Please try again!",
        resources: [],
        suggestions: [],
      },
      { status: 500 }
    );
  }
}
