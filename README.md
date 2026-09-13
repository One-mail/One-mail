# One-mail

AI Email Assistant
Full Project Guide: Architecture, Tech Stack, Features & Build Plan
An agentic AI project that automatically triages an inbox — classifying emails, extracting deadlines and action
items, generating reminders, and drafting replies — using background jobs, structured LLM outputs, and a real
Gmail integration.
Problem & Impact
People receive hundreds of emails and struggle to identify what actually requires action. This system automatically
processes incoming emails, classifies them, extracts key information (deadlines, action items, event details), and
creates reminders — turning a noisy inbox into a structured, actionable list.
Example
Incoming email: "Your interview is scheduled for September 2 at 11 AM."
Field Extracted Value
Event Interview
Date September 2
Time 11:00 AM
Company XYZ
Action Prepare for interview
The system would then automatically create a reminder for this event.
Users / Beneficiaries
Anyone managing a high email volume — job seekers tracking interviews, freelancers managing client requests,
professionals juggling deadlines, or knowledge workers who want a lighter mental load around their inbox.
Features
• Email categorization (e.g., work, personal, finance, promotions)
• Important email detection / priority scoring
• Summarization of long email threads
• Deadline extraction from natural language
• Action-item extraction
• Automatic reminder creation
• Draft reply generation
• Search across triaged emails
• Email analytics dashboard (volume, categories, response times)
Architecture & Workflow
The pipeline runs as a background process that polls Gmail, queues new messages for AI processing, and writes
structured results back to the database — keeping the LLM call off the main request path.
1 Gmail Inbox
2 Cron polls every ~5 minutes via the Gmail API
3 New email detected → pushed to Redis queue (BullMQ)
4 Worker picks up the job
5 LLM call with structured output: category, priority, is_actionable, deadline, sender_context, summary
6 Result saved to PostgreSQL via Prisma
7 If actionable → Task + Reminder created
8 Telegram / email notification sent
9 Dashboard (Next.js) displays triaged inbox, tasks, and analytics
Tech Stack & Tools Needed
Frontend
• Next.js 14+ (App Router) — React framework handling both UI and API routes
• TypeScript — type safety, expected for a production-grade resume project
• TailwindCSS — utility-first styling for fast UI development
• shadcn/ui — pre-built accessible components (tables, dialogs, cards)
Backend / API
• Next.js API Routes (or a separate Express/FastAPI service to show backend separation)
• Prisma ORM — type-safe database access and migrations
• PostgreSQL — relational database for users, emails, tasks, reminders (Supabase or Railway for free hosting)
Authentication
• Google OAuth 2.0 via NextAuth.js / Auth.js — required to access Gmail on the user's behalf
• Encrypted storage of refresh tokens in the database to support background polling
Email Ingestion
• Gmail API — fetch emails, read metadata, send replies
• Polling (simpler): cron job every few minutes checks for new messages via historyId
• Push notifications (advanced): Gmail API + Google Cloud Pub/Sub for real-time webhooks — good stretch
goal
AI / LLM Layer
• Anthropic Claude API or Gemini API — classification, summarization, extraction, draft generation
• Use structured outputs / tool calling so the model returns JSON (category, priority, deadline, action_items)
instead of free text
• Ollama (optional, local model) — good talking point for privacy-sensitive use cases
Background Jobs / Scheduling
• Cron — Vercel Cron Jobs if deployed there, or node-cron if self-hosted
• Upstash Redis — queue for async processing so LLM calls don't block the poll job, plus caching
• BullMQ (optional) — proper job queue with retries/backoff, more impressive than a bare cron loop
Notifications
• Telegram Bot API — easiest to set up, free, strong demo value
• Resend / SendGrid — alternative if you want to keep notifications within the email ecosystem
Deployment
• Vercel — frontend + API routes
• Supabase or Neon — managed Postgres
• Upstash — managed Redis (serverless-friendly, free tier)
Tech Stack Summary Table
Layer Tools
Frontend Next.js, TypeScript, TailwindCSS, shadcn/ui
Backend/API Next.js API Routes, Prisma, PostgreSQL
Auth Google OAuth 2.0, NextAuth.js / Auth.js
Email Ingestion Gmail API, cron polling or Pub/Sub push
AI / LLM Claude API / Gemini API, structured outputs, Ollama (optional)
Jobs / Queue node-cron / Vercel Cron, Upstash Redis, BullMQ
Notifications Telegram Bot API, Resend/SendGrid
Deployment Vercel, Supabase/Neon, Upstash
Minimum Viable Feature Set (2–3 Week Build)
Build in this order so there is always something demo-able at each stage.
1 Gmail OAuth + fetch last 20 emails
2 LLM classification (category + priority) with structured JSON output
3 Dashboard showing triaged inbox
4 Deadline / action-item extraction → auto-create task in database
5 Telegram notification for high-priority emails
6 Draft reply generation (button: "Generate reply")
7 Cron job to auto-poll every few minutes — turns it from a manual demo into something actually automated
8 Basic analytics page (emails/day, category breakdown, ideally with a chart)
Suggested Week-by-Week Plan
Week 1 — Foundations
• Set up Next.js + TypeScript + TailwindCSS + shadcn/ui project scaffold
• Configure PostgreSQL (Supabase/Neon) + Prisma schema (users, emails, tasks, reminders)
• Implement Google OAuth login and Gmail API connection
• Fetch and display the last 20 emails in a simple dashboard
Week 2 — AI Pipeline
• Design the LLM prompt/tool schema for structured extraction (category, priority, deadline, action items,
summary)
• Wire up Claude/Gemini API calls with structured JSON output
• Set up Upstash Redis + BullMQ queue so processing happens asynchronously
• Auto-create Task and Reminder records from actionable emails
• Add Telegram bot notifications for high-priority emails
Week 3 — Polish & Differentiation
• Add draft reply generation
• Add search across triaged emails
• Build a basic analytics page (volume over time, category breakdown)
• Set up cron polling (Vercel Cron or node-cron) for full automation
• Hand-label 30–50 emails and measure classification accuracy for a concrete resume metric
• Write the README with an architecture diagram and deploy to Vercel
What to Explicitly Call Out in Your README / Resume
• Structured extraction accuracy — hand-label 30-50 emails and report classification accuracy (e.g., "94%
classification accuracy on a hand-labeled test set"). A concrete number separates this from a toy project.
• Async processing design — explain why a queue was used instead of calling the LLM synchronously in the
request path.
• Token / cost optimization — mention prompt caching or batched calls, since cost-awareness signals
production thinking.
Sample Resume Bullet
Built an AI-powered email automation platform that classifies incoming emails, extracts deadlines and action items,
and automatically generates reminders using scheduled background jobs.
Architecture Diagram (Text Form)
Incoming Email
|
v
Classification (LLM structured output)
|
v
+----------------------------+
| Important? |
| Actionable? |
| Deadline present? |
+----------------------------+
|
v
AI Analysis (extract deadline, action items, summary)
|
v
Create Task / Reminder ---> Notification (Telegram / Email)
|
v
Dashboard (Next.js): triaged inbox, tasks, analytics
