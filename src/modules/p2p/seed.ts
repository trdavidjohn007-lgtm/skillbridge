import { db } from "../core/db";
import { resources } from "./schema";

const RESOURCE_DATA = [
  // ============================================================
  // PYTHON
  // ============================================================
  {
    topic: "Python",
    title: "Programming in Python (IIT Madras)",
    url: "https://nptel.ac.in/courses/106102191",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Comprehensive Python course by IIT Madras covering fundamentals to advanced concepts.",
  },
  {
    topic: "Python",
    title: "Python Tutorial for Beginners - Full Course (freeCodeCamp)",
    url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Complete Python tutorial covering all fundamentals in one video.",
  },
  {
    topic: "Python",
    title: "Corey Schafer Python Tutorials",
    url: "https://www.youtube.com/c/CoreySchafer",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Clear, concise Python tutorials covering OOP, decorators, generators, and more.",
  },
  {
    topic: "Python",
    title: "Python Practice Problems",
    url: "https://www.geeksforgeeks.org/python-programming-language-tutorial/",
    platform: "GeeksforGeeks",
    type: "practice" as const,
    difficulty: "beginner" as const,
    description: "Practice Python with well-explained examples and coding problems.",
  },
  {
    topic: "Python",
    title: "Official Python Tutorial",
    url: "https://docs.python.org/3/tutorial/",
    platform: "Python.org",
    type: "docs" as const,
    difficulty: "intermediate" as const,
    description: "Official Python documentation tutorial - the authoritative reference.",
  },
  {
    topic: "Python",
    title: "Python for Everybody (Coursera/Free)",
    url: "https://www.py4e.com/",
    platform: "Coursera",
    type: "course" as const,
    difficulty: "beginner" as const,
    description: "Dr. Chuck's Python for Everybody - free lectures, books, and exercises.",
  },
  {
    topic: "Python",
    title: "Khan Academy Computing - Python",
    url: "https://www.khanacademy.org/computing/computer-programming",
    platform: "Khan Academy",
    type: "interactive" as const,
    difficulty: "beginner" as const,
    description: "Interactive Python lessons with in-browser coding challenges.",
  },

  // ============================================================
  // DATA STRUCTURES & ALGORITHMS
  // ============================================================
  {
    topic: "DSA",
    title: "Data Structures and Algorithms (IIT Bombay)",
    url: "https://nptel.ac.in/courses/106105166",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "intermediate" as const,
    description: "In-depth DSA course from IIT Bombay with rigorous algorithmic foundations.",
  },
  {
    topic: "DSA",
    title: "DSA Full Course - freeCodeCamp",
    url: "https://www.youtube.com/watch?v=8hly31xKli0",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Complete Data Structures and Algorithms course with visual explanations.",
  },
  {
    topic: "DSA",
    title: "Abdul Bari DSA Playlist",
    url: "https://www.youtube.com/playlist?list=PLaxjEIBEn4KMYVGmVKaq3L_z2duo6QDG",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "intermediate" as const,
    description: "Highly rated DSA playlist covering sorting, trees, graphs, DP, and more.",
  },
  {
    topic: "DSA",
    title: "LeetCode Problem Solving",
    url: "https://leetcode.com/problemset/",
    platform: "LeetCode",
    type: "practice" as const,
    difficulty: "intermediate" as const,
    description: "Industry-standard DSA practice problems with editorial solutions.",
  },
  {
    topic: "DSA",
    title: "GFG DSA Practice",
    url: "https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/",
    platform: "GeeksforGeeks",
    type: "practice" as const,
    difficulty: "beginner" as const,
    description: "Comprehensive DSA tutorials with practice problems organized by topic.",
  },
  {
    topic: "DSA",
    title: "MIT 6.006 Intro to Algorithms (YouTube)",
    url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63EdVPNLG3ToM6LaEUuStEY",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "advanced" as const,
    description: "MIT's legendary algorithms course - free on OpenCourseWare.",
  },
  {
    topic: "DSA",
    title: "HackerRank DSA Challenges",
    url: "https://www.hackerrank.com/domains/data-structures",
    platform: "HackerRank",
    type: "practice" as const,
    difficulty: "beginner" as const,
    description: "Structured DSA challenges from easy to hard with test cases.",
  },
  {
    topic: "DSA",
    title: "Visualgo - Visualizing Algorithms",
    url: "https://visualgo.net/",
    platform: "Visualgo",
    type: "interactive" as const,
    difficulty: "beginner" as const,
    description: "Interactive visualizations of data structures and algorithms.",
  },

  // ============================================================
  // WEB DEVELOPMENT (React/JS/HTML/CSS)
  // ============================================================
  {
    topic: "Web Development",
    title: "freeCodeCamp Full Web Dev Course",
    url: "https://www.youtube.com/c/Freecodecamp",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Hours of free web dev tutorials covering HTML, CSS, JavaScript, React.",
  },
  {
    topic: "Web Development",
    title: "Traversy Media Web Dev Tutorials",
    url: "https://www.youtube.com/c/TraversyMedia",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Practical web development tutorials with real-world projects.",
  },
  {
    topic: "Web Development",
    title: "Fireship - Web Dev in 100 Seconds",
    url: "https://www.youtube.com/c/Fireship",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Quick, entertaining tech tutorials and framework comparisons.",
  },
  {
    topic: "Web Development",
    title: "freeCodeCamp.org Interactive Platform",
    url: "https://www.freecodecamp.org/",
    platform: "freeCodeCamp",
    type: "interactive" as const,
    difficulty: "beginner" as const,
    description: "Learn to code for free with interactive projects and certifications.",
  },
  {
    topic: "Web Development",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
    platform: "MDN",
    type: "docs" as const,
    difficulty: "intermediate" as const,
    description: "The definitive web development reference maintained by Mozilla.",
  },
  {
    topic: "Web Development",
    title: "W3Schools Web Development",
    url: "https://www.w3schools.com/",
    platform: "W3Schools",
    type: "interactive" as const,
    difficulty: "beginner" as const,
    description: "Learn HTML, CSS, JavaScript with interactive examples and try-it-yourself editors.",
  },
  {
    topic: "Web Development",
    title: "The Odin Project",
    url: "https://www.theodinproject.com/",
    platform: "The Odin Project",
    type: "course" as const,
    difficulty: "intermediate" as const,
    description: "Full-stack web development curriculum - completely free and open source.",
  },
  {
    topic: "Web Development",
    title: "React Official Tutorial",
    url: "https://react.dev/learn",
    platform: "React",
    type: "docs" as const,
    difficulty: "intermediate" as const,
    description: "Official React documentation with interactive examples and exercises.",
  },

  // ============================================================
  // DBMS / SQL
  // ============================================================
  {
    topic: "DBMS",
    title: "Database Management Systems (IIT Bombay)",
    url: "https://nptel.ac.in/courses/106102145",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "intermediate" as const,
    description: "Comprehensive DBMS course covering relational algebra, normalization, transactions.",
  },
  {
    topic: "DBMS",
    title: "Jenny's Lectures - DBMS",
    url: "https://www.youtube.com/playlist?list=PLdoIWUbl5Am9G36dm2AZUq0WGcZgK8DFC",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Clear DBMS lectures covering ER diagrams, normalization, SQL, and transactions.",
  },
  {
    topic: "DBMS",
    title: "HackerRank SQL Practice",
    url: "https://www.hackerrank.com/domains/sql",
    platform: "HackerRank",
    type: "practice" as const,
    difficulty: "beginner" as const,
    description: "SQL challenges from basic SELECT to complex JOINs and subqueries.",
  },
  {
    topic: "DBMS",
    title: "SQLBolt Interactive SQL",
    url: "https://sqlbolt.com/",
    platform: "SQLBolt",
    type: "interactive" as const,
    difficulty: "beginner" as const,
    description: "Learn SQL with simple, interactive exercises and instant feedback.",
  },
  {
    topic: "DBMS",
    title: "Mode SQL Tutorial",
    url: "https://mode.com/sql-tutorial/",
    platform: "Mode",
    type: "interactive" as const,
    difficulty: "intermediate" as const,
    description: "SQL tutorial covering everything from basics to advanced window functions.",
  },
  {
    topic: "DBMS",
    title: "PostgreSQL Official Docs",
    url: "https://www.postgresql.org/docs/current/tutorial.html",
    platform: "PostgreSQL",
    type: "docs" as const,
    difficulty: "intermediate" as const,
    description: "Official PostgreSQL tutorial - the world's most advanced open source database.",
  },

  // ============================================================
  // MACHINE LEARNING / AI
  // ============================================================
  {
    topic: "Machine Learning",
    title: "Machine Learning (IIT Madras)",
    url: "https://nptel.ac.in/courses/106102153",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "intermediate" as const,
    description: "IIT Madras ML course covering regression, classification, clustering, neural networks.",
  },
  {
    topic: "Machine Learning",
    title: "ML Full Course - freeCodeCamp",
    url: "https://www.youtube.com/watch?v=i_LwzRVP7bg",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Machine Learning course for beginners with Python and scikit-learn.",
  },
  {
    topic: "Machine Learning",
    title: "StatQuest with Josh Starmer",
    url: "https://www.youtube.com/c/joshstarmer",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Amazing visual explanations of statistics and machine learning concepts.",
  },
  {
    topic: "Machine Learning",
    title: "Kaggle Learn - Intro to ML",
    url: "https://www.kaggle.com/learn/intro-to-machine-learning",
    platform: "Kaggle",
    type: "interactive" as const,
    difficulty: "beginner" as const,
    description: "Hands-on ML with real datasets and guided coding exercises on Kaggle.",
  },
  {
    topic: "Machine Learning",
    title: "Fast.ai Practical Deep Learning",
    url: "https://course.fast.ai/",
    platform: "fast.ai",
    type: "course" as const,
    difficulty: "intermediate" as const,
    description: "Top-down practical approach to deep learning - completely free.",
  },
  {
    topic: "Machine Learning",
    title: "Andrew Ng's ML Specialization (Coursera Free Audit)",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    platform: "Coursera",
    type: "course" as const,
    difficulty: "beginner" as const,
    description: "Andrew Ng's legendary ML course - free to audit on Coursera.",
  },

  // ============================================================
  // OPERATING SYSTEMS
  // ============================================================
  {
    topic: "Operating Systems",
    title: "Operating Systems (IIT Kharagpur)",
    url: "https://nptel.ac.in/courses/106102089",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "intermediate" as const,
    description: "IIT Kharagpur OS course covering processes, memory, storage, and protection.",
  },
  {
    topic: "Operating Systems",
    title: "Jenny's Lectures - OS",
    url: "https://www.youtube.com/playlist?list=PLdoIWUbl5Am9G36dm2AZUq0WGcZgK8DFC",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Complete OS lectures covering process management, memory, and file systems.",
  },
  {
    topic: "Operating Systems",
    title: "Gate Smashers - OS",
    url: "https://www.youtube.com/c/GateSmashers",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Concise OS concepts with GATE exam preparation focus.",
  },
  {
    topic: "Operating Systems",
    title: "OSTEP - Operating Systems: Three Easy Pieces",
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
    platform: "OSTEP",
    type: "docs" as const,
    difficulty: "intermediate" as const,
    description: "Free online textbook - the best OS book available for free.",
  },

  // ============================================================
  // COMPUTER NETWORKS
  // ============================================================
  {
    topic: "Computer Networks",
    title: "Computer Networks (IIT Kharagpur)",
    url: "https://nptel.ac.in/courses/106102066",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "intermediate" as const,
    description: "Comprehensive CN course covering TCP/IP, routing, application layer protocols.",
  },
  {
    topic: "Computer Networks",
    title: "Gate Smashers - Computer Networks",
    url: "https://www.youtube.com/c/GateSmashers",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Clear CN concepts with networking fundamentals explained visually.",
  },
  {
    topic: "Computer Networks",
    title: "Neso Academy - Computer Networks",
    url: "https://www.youtube.com/c/NesoAcademy",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Excellent networking tutorials with ASCII-art diagrams and clear explanations.",
  },

  // ============================================================
  // C / C++ / JAVA
  // ============================================================
  {
    topic: "C Programming",
    title: "C Programming (IIT Kharagpur)",
    url: "https://nptel.ac.in/courses/106102137",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Comprehensive C programming course from IIT Kharagpur.",
  },
  {
    topic: "C Programming",
    title: "C Tutorial - freeCodeCamp",
    url: "https://www.youtube.com/watch?v=KJgsSFOSQv0",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Learn C programming in one video - pointers, memory, and data structures.",
  },

  {
    topic: "Java",
    title: "Java Programming (IIT Kharagpur)",
    url: "https://nptel.ac.in/courses/106102135",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Object-oriented programming in Java from IIT Kharagpur.",
  },
  {
    topic: "Java",
    title: "Java Full Course - freeCodeCamp",
    url: "https://www.youtube.com/watch?v=eIrMbAQSU34",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Complete Java tutorial covering OOP, collections, and modern Java features.",
  },

  {
    topic: "C++",
    title: "C++ Full Course - freeCodeCamp",
    url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Learn C++ from scratch - STL, OOP, and modern C++ features.",
  },

  // ============================================================
  // CYBERSECURITY
  // ============================================================
  {
    topic: "Cybersecurity",
    title: "Cybersecurity Fundamentals (NPTEL)",
    url: "https://nptel.ac.in/courses/106102246",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Introduction to cybersecurity covering threats, defenses, and ethical hacking.",
  },
  {
    topic: "Cybersecurity",
    title: "Cybrary - Free Cybersecurity Courses",
    url: "https://www.cybrary.it/",
    platform: "Cybrary",
    type: "course" as const,
    difficulty: "beginner" as const,
    description: "Free cybersecurity courses from industry professionals.",
  },

  // ============================================================
  // CLOUD / DEVOPS
  // ============================================================
  {
    topic: "DevOps",
    title: "DevOps Roadmap",
    url: "https://roadmap.sh/devops",
    platform: "roadmap.sh",
    type: "docs" as const,
    difficulty: "intermediate" as const,
    description: "Interactive DevOps learning path with resources for each tool.",
  },
  {
    topic: "DevOps",
    title: "Docker Tutorial - freeCodeCamp",
    url: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
    platform: "YouTube",
    type: "video" as const,
    difficulty: "beginner" as const,
    description: "Docker crash course - containers, images, and orchestration.",
  },

  // ============================================================
  // DATA SCIENCE
  // ============================================================
  {
    topic: "Data Science",
    title: "Data Science (IIT Madras)",
    url: "https://nptel.ac.in/courses/106105182",
    platform: "NPTEL",
    type: "video" as const,
    difficulty: "intermediate" as const,
    description: "Data science foundations covering statistics, ML, and data visualization.",
  },
  {
    topic: "Data Science",
    title: "IBM Data Science Professional Certificate (Audit Free)",
    url: "https://www.coursera.org/professional-certificates/ibm-data-science",
    platform: "Coursera",
    type: "course" as const,
    difficulty: "beginner" as const,
    description: "IBM's data science pathway - free to audit all courses.",
  },
];

export async function seedP2PResources() {
  console.log("📚 Seeding P2P resources...");

  // Clear existing resources
  await db.delete(resources);

  // Insert all resources
  const inserted = await db
    .insert(resources)
    .values(RESOURCE_DATA)
    .returning();

  console.log(`✅ Inserted ${inserted.length} resources`);

  // Group by topic for display
  const topics = [...new Set(RESOURCE_DATA.map((r) => r.topic))];
  console.log(`📋 Topics: ${topics.join(", ")}`);

  return inserted;
}

// Run if called directly
if (require.main === module) {
  seedP2PResources()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
