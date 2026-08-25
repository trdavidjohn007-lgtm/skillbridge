# Tunnel — AI Skill Intelligence Platform

AI-enabled competency assessment and personalized learning for India's Official Statistical System.

## Overview

Tunnel is a skill intelligence platform that provides:

- **AI-based competency assessment** using a graph-based competency framework
- **Automated skill-gap analysis** comparing current competencies against role requirements
- **Personalized learning recommendations** from iGOT Karmayogi and TPAC courses
- **AI-powered quiz generation** from uploaded learning materials
- **Interactive dashboards** for employees and administrators
- **Gamification** with streaks, credits, badges, and department leaderboards
- **SPARROW/APAR integration** for annual performance reviews
- **Company Bridge** connecting qualified officials with NSO, NASSCOM, World Bank, and IIM/IIT

## Quick Deploy

The app is a **single `index.html` file** — no build step, no dependencies.

### Netlify (Recommended)
```bash
# Drag-and-drop skill-platform/ folder onto app.netlify.com/drop
```

### Vercel
```bash
cd skill-platform
git init && git add index.html 404.html netlify.toml && git commit -m "Deploy"
gh repo create tunnel --public --push
# Import on vercel.com
```

### Open Locally
```
open skill-platform/index.html
```

## Pages

| Page | Features |
|------|----------|
| **Home** | Progress rings, domain progress, activity feed, goals, skill gaps |
| **Dashboard** | AI Summary, radar chart, skill gaps, learning path |
| **Competencies** | 18 competencies, 4 domains, interactive prerequisite graph |
| **Learning** | Interest onboarding → personalized iGOT recommendations |
| **Assessments** | Interactive quiz, AI quiz upload, history |
| **Badges & Ranks** | 15 achievement badges, XP levels, department leaderboard |
| **Credits** | Streak calendar, credit balance, earning rules, company bridge |
| **Analytics** | Admin dashboard, predictive insights |
| **SPARROW/APAR** | Exportable competency report for performance reviews |

## Features

### Back Button Navigation
Browser-style back button tracking last 20 pages with auto-scroll-to-top.

### Interactive Competency Graph
SVG node-edge diagram showing prerequisites and skill dependencies with clickable nodes and detail panels.

### iGOT Karmayogi Integration
All courses link to real iGOT Karmayogi courses with direct enrollment links.

### AI Chatbot
Context-aware assistant providing course recommendations, skill gap analysis, and learning tips.

### Gamification
- **Streaks**: Daily learning streaks with milestone tracking
- **Credits**: Earn XP for courses, assessments, and consistency
- **Badges**: 15 achievement badges across 4 categories
- **Leaderboards**: Department and personal rankings

---

Built for India's Official Statistical System 🇮🇳
