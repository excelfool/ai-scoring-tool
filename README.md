# AI Competition Scoring Tool v2

A comprehensive 100-point scoring system for evaluating AI automation MVP projects, with **commentary/notes support** for each score.

## What's New in v2

- **Commentary Fields**: Add notes/rationale for each subcriterion score
- **Pre-Scored Sample Projects**: 8 AIGF Cohort 5 projects with full scoring and commentary
- **Excellent/Weak Examples**: Each subcriterion shows what excellent vs weak looks like
- **Enhanced Comparison**: Judge-type analysis now shows top 5 projects
- **Improved UI**: Better project cards with score previews

## Features

### Tab 1: Project Input
- Upload CSV files matching your Google Sheet format
- **Load 8 Pre-Scored Sample Projects** with one click
- Add projects manually
- View/edit project details

### Tab 2: Scoring
- Score each of 21 subcriteria with visual sliders
- **Add commentary/notes for each score** (click the message icon)
- See excellent vs weak examples for guidance
- Real-time total and tier calculation
- Category-level progress bars

### Tab 3: Comparison
- Side-by-side project ranking
- Color-coded score matrix
- Export to CSV
- **Judge-type analysis**:
  - 🔧 Technical Developer Focus (Automation + Reliability)
  - 🚀 Founder Focus (Problem + Adoption + Business)
  - 💰 VC Focus (Problem + Business + Defensibility)

### Tab 4: Rubric Reference
- Tier definitions (85+, 70+, 55+, 40+, 0+)
- Subcriteria details with hints
- Red flags checklist
- Live demo readiness checklist for Bangalore

## Scoring Categories (100 points)

| # | Category | Points | Focus |
|---|----------|--------|-------|
| 1 | Problem + ICP Clarity | 15 | Validated pain, specific customer |
| 2 | Automation Depth + Demo | 20 | Real AI work, working prototype |
| 3 | Measured ROI + Evaluation | 15 | Quantified value, accuracy metrics |
| 4 | Reliability + Failure Handling | 10 | Stability, graceful degradation |
| 5 | Integrations + Adoption Ease | 10 | Time-to-value, low friction |
| 6 | Security/Compliance/Audit | 10 | Data handling, audit trail |
| 7 | Business Model + GTM | 15 | Pricing, unit economics, channel |
| 8 | Defensibility | 5 | Moat identification, evidence |

## Pre-Loaded Sample Projects

The tool includes 8 pre-scored projects from AIGF Cohort 5:

| Rank | Project | Score | Tier |
|------|---------|-------|------|
| 1 | Piper (OEM Parts) | 76 | COMPETITIVE |
| 2 | Agent K (Tax Compliance) | 72 | COMPETITIVE |
| 3 | Aftermath (Estate Admin) | 64 | RISKY |
| 4 | CareGrid (Caregiver) | 62 | RISKY |
| 5 | ReadyOps (Automation Coach) | 58 | RISKY |
| 6 | Paperwork Pilot | 48 | UNLIKELY |
| 7 | Suno Music Creator | 45 | UNLIKELY |
| 8 | Artisan Backend | 42 | UNLIKELY |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deploy to Vercel

```bash
# Option 1: GitHub Integration (recommended)
# Push to GitHub, then import in Vercel

# Option 2: CLI
npm install -g vercel
vercel --prod
```

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3.4
- Lucide React (icons)

## License

MIT
