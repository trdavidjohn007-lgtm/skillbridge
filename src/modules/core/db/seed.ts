import { db } from "./index";
import {
  competencies,
  competencyEdges,
  roleRequirements,
  igotCourses,
  tpacProgrammes,
} from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // COMPETENCY FRAMEWORK
  // ============================================================

  // Statistical Competencies
  const surveyDesign = await db
    .insert(competencies)
    .values({
      name: "Survey Design",
      description:
        "Designing statistical surveys including sampling frames, questionnaire design, and data collection methodologies",
      domain: "statistical",
      level: "advanced",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const sampling = await db
    .insert(competencies)
    .values({
      name: "Sampling Methods",
      description:
        "Probability and non-probability sampling techniques, sample size determination, stratification, and clustering",
      domain: "statistical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const nationalAccounts = await db
    .insert(competencies)
    .values({
      name: "National Accounts",
      description:
        "GDP estimation, input-output tables, national income accounting, and SNA methodology",
      domain: "statistical",
      level: "advanced",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const priceStatistics = await db
    .insert(competencies)
    .values({
      name: "Price Statistics",
      description:
        "Consumer Price Index, Wholesale Price Index, price deflators, and basket revision methodologies",
      domain: "statistical",
      level: "advanced",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const labourStatistics = await db
    .insert(competencies)
    .values({
      name: "Labour Statistics",
      description:
        "Employment-unemployment surveys, labour force participation, wage statistics, and working conditions data",
      domain: "statistical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const agriculturalStatistics = await db
    .insert(competencies)
    .values({
      name: "Agricultural Statistics",
      description:
        "Crop estimation surveys, agricultural cost studies, land use statistics, and food security indicators",
      domain: "statistical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const industrialStatistics = await db
    .insert(competencies)
    .values({
      name: "Industrial Statistics",
      description:
        "ASI methodology, industrial production indices, MSME statistics, and capacity utilization",
      domain: "statistical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const sdgIndicators = await db
    .insert(competencies)
    .values({
      name: "SDG Indicators",
      description:
        "UN Sustainable Development Goals indicator framework, data sources, and reporting requirements",
      domain: "statistical",
      level: "advanced",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const metadataStandards = await db
    .insert(competencies)
    .values({
      name: "Metadata Standards",
      description:
        "GSIM, GSBPM, SDMX metadata standards, data documentation, and quality assurance frameworks",
      domain: "statistical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const dataQuality = await db
    .insert(competencies)
    .values({
      name: "Data Quality Frameworks",
      description:
        "Statistical quality dimensions, quality indicators, ESS quality assurance framework, and metadata quality",
      domain: "statistical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  // Technical Competencies
  const python = await db
    .insert(competencies)
    .values({
      name: "Python",
      description:
        "Python programming for data analysis, pandas, numpy, scipy, and statistical computing",
      domain: "technical",
      level: "beginner",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const rLanguage = await db
    .insert(competencies)
    .values({
      name: "R Programming",
      description:
        "R statistical computing, tidyverse, ggplot2, and statistical modeling in R",
      domain: "technical",
      level: "beginner",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const sql = await db
    .insert(competencies)
    .values({
      name: "SQL",
      description:
        "Database querying, data manipulation, joins, aggregations, and query optimization",
      domain: "technical",
      level: "beginner",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const stata = await db
    .insert(competencies)
    .values({
      name: "Stata",
      description:
        "Statistical analysis in Stata, do-file programming, and survey data analysis",
      domain: "technical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const dataVisualization = await db
    .insert(competencies)
    .values({
      name: "Data Visualization",
      description:
        "Creating effective statistical graphics, dashboards, interactive visualizations, and data storytelling",
      domain: "technical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const aiml = await db
    .insert(competencies)
    .values({
      name: "AI/ML for Statistics",
      description:
        "Machine learning applications in official statistics, automated data processing, anomaly detection, and predictive analytics",
      domain: "technical",
      level: "advanced",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const cloudComputing = await db
    .insert(competencies)
    .values({
      name: "Cloud Computing",
      description:
        "Government cloud infrastructure, cloud-native development, containerization, and scalable data processing",
      domain: "technical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const gis = await db
    .insert(competencies)
    .values({
      name: "GIS & Spatial Analysis",
      description:
        "Geographic Information Systems, spatial data analysis, mapping, and geo-statistical methods",
      domain: "technical",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  // Digital Governance
  const cybersecurity = await db
    .insert(competencies)
    .values({
      name: "Cybersecurity",
      description:
        "Information security management, data protection, threat assessment, and security best practices for government systems",
      domain: "digital_governance",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const dataPrivacy = await db
    .insert(competencies)
    .values({
      name: "Data Privacy",
      description:
        "Personal data protection, DPDP Act compliance, anonymization techniques, and privacy-preserving data analysis",
      domain: "digital_governance",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const digitalPublicInfra = await db
    .insert(competencies)
    .values({
      name: "Digital Public Infrastructure",
      description:
        "India Stack, UPI, Aadhaar integration, DigiLocker, and digital governance frameworks",
      domain: "digital_governance",
      level: "beginner",
      frameworkVersion: "1.0.0",
    })
    .returning();

  // Behavioural & Managerial
  const leadership = await db
    .insert(competencies)
    .values({
      name: "Leadership",
      description:
        "Organizational leadership, team management, strategic planning, and change leadership in statistical organizations",
      domain: "behavioural",
      level: "advanced",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const communication = await db
    .insert(competencies)
    .values({
      name: "Communication",
      description:
        "Technical writing, data presentation, stakeholder communication, and public dissemination of statistics",
      domain: "behavioural",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const projectManagement = await db
    .insert(competencies)
    .values({
      name: "Project Management",
      description:
        "Statistical project planning, resource allocation, timeline management, and quality control",
      domain: "behavioural",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  const ethics = await db
    .insert(competencies)
    .values({
      name: "Statistics Ethics",
      description:
        "Professional ethics, data confidentiality, integrity in statistical practices, and responsible data use",
      domain: "behavioural",
      level: "intermediate",
      frameworkVersion: "1.0.0",
    })
    .returning();

  console.log("✅ Competencies created");

  // ============================================================
  // COMPETENCY EDGES (DAG)
  // ============================================================

  const edgeData = [
    // Prerequisites: Sampling → Survey Design
    { source: sampling[0].id, target: surveyDesign[0].id, relationship: "prerequisite" as const },
    // Prerequisites: SQL → Python
    { source: sql[0].id, target: python[0].id, relationship: "prerequisite" as const },
    // Prerequisites: Python → Data Visualization
    { source: python[0].id, target: dataVisualization[0].id, relationship: "prerequisite" as const },
    // Prerequisites: Python → AI/ML
    { source: python[0].id, target: aiml[0].id, relationship: "prerequisite" as const },
    // Prerequisites: Data Quality → SDG Indicators
    { source: dataQuality[0].id, target: sdgIndicators[0].id, relationship: "prerequisite" as const },
    // Prerequisites: Metadata Standards → Data Quality
    { source: metadataStandards[0].id, target: dataQuality[0].id, relationship: "prerequisite" as const },
    // Progressions: Beginner → Intermediate in Python
    { source: python[0].id, target: dataVisualization[0].id, relationship: "progression" as const },
    // Related: Price Statistics ↔ National Accounts
    { source: priceStatistics[0].id, target: nationalAccounts[0].id, relationship: "related" as const },
    // Related: Labour Statistics ↔ Survey Design
    { source: labourStatistics[0].id, target: surveyDesign[0].id, relationship: "related" as const },
    // Prerequisites: Data Privacy → Cybersecurity
    { source: dataPrivacy[0].id, target: cybersecurity[0].id, relationship: "prerequisite" as const },
    // Prerequisites: SQL → R
    { source: sql[0].id, target: rLanguage[0].id, relationship: "prerequisite" as const },
    // Related: GIS ↔ Data Visualization
    { source: gis[0].id, target: dataVisualization[0].id, relationship: "related" as const },
  ];

  for (const edge of edgeData) {
    await db.insert(competencyEdges).values(edge);
  }

  console.log("✅ Competency edges created");

  // ============================================================
  // ROLE REQUIREMENTS
  // ============================================================

  const roles = [
    {
      roleName: "Senior Statistician",
      department: "National Statistical Office",
      requirements: [
        { competencyId: surveyDesign[0].id, requiredLevel: "advanced" as const, priority: "critical" as const },
        { competencyId: sampling[0].id, requiredLevel: "advanced" as const, priority: "critical" as const },
        { competencyId: dataQuality[0].id, requiredLevel: "intermediate" as const, priority: "high" as const },
        { competencyId: python[0].id, requiredLevel: "intermediate" as const, priority: "high" as const },
        { competencyId: dataVisualization[0].id, requiredLevel: "intermediate" as const, priority: "medium" as const },
      ],
    },
    {
      roleName: "Data Analyst",
      department: "National Statistical Office",
      requirements: [
        { competencyId: python[0].id, requiredLevel: "intermediate" as const, priority: "critical" as const },
        { competencyId: sql[0].id, requiredLevel: "intermediate" as const, priority: "critical" as const },
        { competencyId: dataVisualization[0].id, requiredLevel: "intermediate" as const, priority: "high" as const },
        { competencyId: statistics[0]?.id || sampling[0].id, requiredLevel: "beginner" as const, priority: "medium" as const },
      ],
    },
    {
      roleName: "Statistical Officer",
      department: "Various Ministries",
      requirements: [
        { competencyId: nationalAccounts[0].id, requiredLevel: "intermediate" as const, priority: "critical" as const },
        { competencyId: priceStatistics[0].id, requiredLevel: "intermediate" as const, priority: "high" as const },
        { competencyId: python[0].id, requiredLevel: "beginner" as const, priority: "high" as const },
        { competencyId: communication[0].id, requiredLevel: "intermediate" as const, priority: "medium" as const },
      ],
    },
  ];

  for (const role of roles) {
    for (const req of role.requirements) {
      await db.insert(roleRequirements).values({
        roleName: role.roleName,
        department: role.department,
        competencyId: req.competencyId,
        requiredLevel: req.requiredLevel,
        priority: req.priority,
      });
    }
  }

  console.log("✅ Role requirements created");

  // ============================================================
  // SAMPLE iGOT COURSES
  // ============================================================

  const sampleCourses = [
    {
      igotCourseId: "IGOT-STAT-001",
      title: "Fundamentals of Survey Design",
      description:
        "Introduction to survey methodology, questionnaire design, and data collection frameworks for official statistics",
      domain: "Statistical Methods",
      competencies: ["survey_design", "sampling"],
      durationHours: 8.0,
      difficulty: "Intermediate",
      language: "English",
    },
    {
      igotCourseId: "IGOT-TECH-001",
      title: "Python for Statistical Analysis",
      description:
        "Learn Python programming with focus on pandas, numpy, and scipy for statistical data analysis",
      domain: "Technology",
      competencies: ["python", "data_analysis"],
      durationHours: 12.0,
      difficulty: "Beginner",
      language: "English",
    },
    {
      igotCourseId: "IGOT-TECH-002",
      title: "Data Visualization with Python",
      description:
        "Create effective statistical visualizations using matplotlib, seaborn, and plotly",
      domain: "Technology",
      competencies: ["data_visualization", "python"],
      durationHours: 6.0,
      difficulty: "Intermediate",
      language: "English",
    },
    {
      igotCourseId: "IGOT-STAT-002",
      title: "National Accounts and GDP Estimation",
      description:
        "Comprehensive course on SNA methodology, GDP calculation, and national income accounting",
      domain: "Statistical Methods",
      competencies: ["national_accounts", "price_statistics"],
      durationHours: 10.0,
      difficulty: "Advanced",
      language: "English",
    },
    {
      igotCourseId: "IGOT-TECH-003",
      title: "SQL for Data Management",
      description:
        "Database querying and data management skills for statistical databases",
      domain: "Technology",
      competencies: ["sql", "data_management"],
      durationHours: 6.0,
      difficulty: "Beginner",
      language: "English",
    },
    {
      igotCourseId: "IGOT-STAT-003",
      title: "SDG Indicators and Reporting",
      description:
        "Understanding UN SDG indicator framework, data collection for SDG reporting, and India's progress",
      domain: "Statistical Methods",
      competencies: ["sdg_indicators", "metadata_standards"],
      durationHours: 8.0,
      difficulty: "Intermediate",
      language: "English",
    },
    {
      igotCourseId: "IGOT-DG-001",
      title: "Cybersecurity for Government Officials",
      description:
        "Essential cybersecurity practices, data protection, and security awareness for government systems",
      domain: "Digital Governance",
      competencies: ["cybersecurity", "data_privacy"],
      durationHours: 4.0,
      difficulty: "Beginner",
      language: "English",
    },
    {
      igotCourseId: "IGOT-BEH-001",
      title: "Leadership in Statistical Organizations",
      description:
        "Leadership skills, team management, and strategic planning for statistical office heads",
      domain: "Behavioural",
      competencies: ["leadership", "project_management"],
      durationHours: 6.0,
      difficulty: "Advanced",
      language: "English",
    },
  ];

  for (const course of sampleCourses) {
    await db.insert(igotCourses).values({
      ...course,
      lastSyncedAt: new Date(),
      rawData: course,
    });
  }

  console.log("✅ Sample iGOT courses created");

  // ============================================================
  // SAMPLE TPAC PROGRAMMES
  // ============================================================

  const sampleTpac = [
    {
      programmeId: "TPAC-2025-001",
      title: "Advanced Survey Methods Workshop",
      description:
        "Intensive workshop on advanced sampling techniques, non-response adjustment, and data quality for NSO",
      competencies: ["survey_design", "sampling", "data_quality"],
      durationDays: 5,
      venue: "NSSTA Training Centre, Delhi",
    },
    {
      programmeId: "TPAC-2025-002",
      title: "AI/ML Applications in Official Statistics",
      description:
        "Hands-on training on applying machine learning techniques to statistical data processing and analysis",
      competencies: ["aiml", "python", "data_visualization"],
      durationDays: 3,
      venue: "National Statistical Commission, Delhi",
    },
  ];

  for (const prog of sampleTpac) {
    await db.insert(tpacProgrammes).values({
      ...prog,
      lastSyncedAt: new Date(),
      rawData: prog,
    });
  }

  console.log("✅ Sample TPAC programmes created");
  console.log("🎉 Database seeding complete!");
}

// Run seed
seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
