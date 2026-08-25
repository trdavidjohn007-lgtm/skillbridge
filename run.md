# Tunnel — AI Skill Intelligence Platform

## Quick Deploy (Hackathon-Ready)

The app is a **single `index.html` file** — no build step, no server, no dependencies.

### Deploy to Vercel (Recommended)
```bash
cd skill-platform
git init && git add index.html && git commit -m "Deploy Tunnel"
gh repo create tunnel --public --push
# → Import on vercel.com → Done.
```

### Deploy to Netlify

**Option A: Drag & Drop (fastest)**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `skill-platform/` folder onto the page
3. Your site is live at `https://your-site-name.netlify.app`

**Option B: Git-based (auto-deploy on push)**
```bash
cd skill-platform
git init
git add index.html 404.html netlify.toml
git commit -m "Deploy Tunnel"
gh repo create tunnel --public --push
cd ..
# Then on netlify.com → New site from Git → select your repo
# Build settings: Publish directory = skill-platform
```

**Option C: Netlify CLI**
```bash
npm install -g netlify-cli
cd skill-platform
netlify init
netlify deploy --prod --dir=.
```

**Files included for Netlify:**
- `index.html` — Main app (self-contained, no build needed)
- `404.html` — Custom error page
- `netlify.toml` — Headers, redirects, and CSP config

### Open Locally
```
open skill-platform/index.html
# Or: double-click index.html in any browser
```

---

## Features

### Onboarding Flow
When a user first visits the Learning Paths page:
1. **Interest Selection** — 12 topic chips (Python, AI/ML, Data Science, Statistics, Cybersecurity, etc.)
2. **Personalized Recommendations** — Courses sorted by relevance to selected interests
3. **Returning User Detection** — Saves interests to localStorage, skips onboarding on return
4. **Change Interests** — "Change" button lets users re-select at any time

### iGOT Karmayogi Integration
All courses link to **real iGOT Karmayogi courses**:

| Course | Duration | URL |
|--------|----------|-----|
| Data Driven Decision Making | 8h | portal.igotkarmayogi.gov.in/public/toc/do_1137349858229288961285/overview |
| AI Using Google Bard & ChatGPT | 6h | portal.igotkarmayogi.gov.in/public/toc/do_113923174474121216195/overview |
| Securing India's Digital Governance | 4h | portal.igotkarmayogi.gov.in/app/toc/do_1145242891094835201284/overview |
| Digital Personal Data Protection | 3h | portal.igotkarmayogi.gov.in/public/toc/do_113569878939262976132/overview |
| Basic Cybersecurity Awareness | 16h | portal.igotkarmayogi.gov.in/app/toc/do_1138093093777899521174/overview |
| Python for Data Analysis | 12h | portal.igotkarmayogi.gov.in/public/toc/do_113923174474121216195/overview |
| SQL for Government Databases | 8h | portal.igotkarmayogi.gov.in/public/toc/do_1137349858229288961285/overview |
| Machine Learning for Statistics | 10h | portal.igotkarmayogi.gov.in/public/toc/do_113923174474121216195/overview |
| Browse 4,400+ Courses | — | igotkarmayogi.gov.in |

### Dashboard Statistics
- Competency Score: 72% (+4.2% quarterly)
- Courses Completed: 7 (3 in progress)
- Learning Hours: 48.5h total (16.2h this month)
- Skills Acquired: 11 (4 critical gaps closed)

### Admin Analytics
- Total Officials: 2,450
- Active Learners: 1,847 (75%)
- Avg Competency Score: 71.3%
- Total Training Hours: 38,640
- Courses on iGOT: 4,428

### Streak & Credits System
- **Learning Streak** — 4-week calendar tracking daily learning activity
- **Credits** — Earn 50–200 credits per course, 30–100 per assessment, 10/day for streaks
- **Levels** — Beginner → Intermediate → Advanced → Expert based on credits
- **Company Bridge** — Unlock internship/exchange opportunities at NSO, NASSCOM, World Bank, IIM/IIT
- Persistence via localStorage across sessions

### Back Button Navigation
- Browser-style back button in the topbar
- Tracks last 20 pages visited
- Auto-enables when history exists
- Scroll-to-top on every navigation

### Home / Progress Hub
- Orange hero banner with user info, XP, Level, Streak, Competency Score
- 3 animated progress rings (Competency, Courses, Credits)
- 8-item Quick Navigation grid to all sections
- Domain Progress bars (Statistical 78%, Technical 42%, Digital 60%, Behavioural 75%)
- 6-item Recent Activity feed with timestamps
- 4 Goals & Next Steps with progress bars
- 6 Critical Skill Gaps with priority badges and time estimates

### AI Chatbot
- Floating chat button with contextual responses
- Skill gap analysis, course suggestions, learning tips
- Course cards with real iGOT enrollment links in chat
- Quick action buttons for common queries

### SPARROW/APAR Integration
- **Auto-generated** competency & training report for annual performance reviews
- Official details, 16+ competency scores, training completions from iGOT
- Achievements & credits summary, company bridge qualification status
- Export: PDF download, Print dialog, Copy to clipboard
- Unique Report ID (SP-2025-RK-XXXX) for audit trail

### Gamification — Badges & Ranks
- **15 achievement badges** across 4 categories: Learning Milestones, Consistency Champions, Assessment Masters, Domain Champions
- **XP & Level System** — 10 levels from Beginner (0 XP) to Expert Scholar (2,000+ XP)
- **Department Leaderboard** — All India rankings across 6 government departments with avg scores
- **Personal Leaderboard** — Top 5 learners within NSO, "You" highlighted at rank #3
- **Streak Milestones** — 6 milestones (3, 7, 14, 30, 60, 100 days) with achieved/locked states
- **Recent Badge Earners** — Cross-government feed showing who earned what and when
- Animated XP bar, staggered badge reveal, leaderboard bar animations

## Pages
| Page | Features |
|------|----------|
| Login | Government SSO, email/password, orange gradient |
| Home | Progress rings, domain progress, activity feed, goals, skill gaps |
| Dashboard | AI Summary, radar chart, skill gaps, learning path |
| Competencies | 18 competencies, 4 domains, expandable groups, interactive prerequisite graph |
| Learning | Interest selection → personalized iGOT recommendations |
| Assessments | Interactive quiz, AI quiz upload, history |
| Credits | Streak calendar, credit balance, earning rules, company bridge, milestones |
| Badges & Ranks | 15 badges, XP levels, dept leaderboard, personal ranking |
| Analytics | Org stats, dept performance, predictive insights |
| APAR/SPARROW | Exportable competency report for performance review |
