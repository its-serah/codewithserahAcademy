# CodewithSerah Academy

A DataCamp-inspired interactive learning platform with progressive module unlocking, embedded YouTube lessons, reading-based content, AI-powered tutoring, and assignment submissions.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND + API                          │
│                   Next.js 14 (App Router)                   │
│                    Deployed on Vercel                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Student  │  │  Admin   │  │   AI     │  │ Assignment │ │
│  │Dashboard │  │Dashboard │  │Assistant │  │  Portal    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘ │
│       │              │             │               │        │
│  Next.js API Routes (serverless functions)         │        │
│  /api/courses  /api/progress  /api/ai  /api/assignments    │
└───────┬──────────────┬─────────────┬───────────────┬────────┘
        │              │             │               │
        ▼              ▼             ▼               ▼
┌────────────────────────┐  ┌──────────────┐  ┌────────────┐
│   Supabase (FREE)      │  │ Google       │  │ Supabase   │
│                        │  │ Gemini API   │  │ Storage    │
│ PostgreSQL DB          │  │ (FREE tier)  │  │ (FREE 1GB) │
│ Auth (built-in)        │  │ 15 RPM       │  │            │
│ Row Level Security     │  │ 1M tokens/d  │  │ Assignments│
│                        │  └──────────────┘  │ Thumbnails │
│ - Users (via Auth)     │                    └────────────┘
│ - Courses              │
│ - Modules              │
│ - Progress             │
│ - Assignments          │
│ - AI History           │
└────────────────────────┘
```

---

## Core Features

### 1. Progressive Module System (DataCamp-style)

Students unlock modules sequentially. You must complete Module 1 before Module 2 becomes visible.

```
Course: "Intro to Python"
│
├── Module 1: Variables & Types ✅ COMPLETED
│   ├── Reading: "What are Variables?"
│   ├── Video: YouTube embed
│   ├── Practice: Interactive questions
│   └── Quiz: 3 questions (must pass to unlock next)
│
├── Module 2: Control Flow 🔓 UNLOCKED (current)
│   ├── Reading: "If/Else Statements"
│   ├── Video: YouTube embed
│   ├── Practice: Interactive questions
│   └── Quiz: 3 questions
│
├── Module 3: Functions 🔒 LOCKED
│   └── (hidden — complete Module 2 first)
│
└── Module 4: Projects 🔒 LOCKED
    └── (hidden — complete Module 3 first)
```

**Unlock Rules:**

- Module content is NOT sent to the client until unlocked (server-enforced)
- Completion = all readings read + video watched + quiz passed (≥70%)
- Progress is tracked per-user per-module with timestamps

### 2. Admin Dashboard (Course & Video Management)

```
┌─────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                │
├─────────────────────────────────────────────────┤
│                                                 │
│  [+ New Course]  [+ New Module]                 │
│                                                 │
│  Course: Intro to Python                        │
│  ├── Module 1: Variables        [Edit] [Delete] │
│  │   ├── Reading Block 1        [Edit]          │
│  │   ├── YouTube: dQw4w9WgXcQ   [Edit]          │
│  │   └── Quiz: 3 questions      [Edit]          │
│  ├── Module 2: Control Flow     [Edit] [Delete] │
│  └── [+ Add Module]                             │
│                                                 │
│  Course: Web Dev Bootcamp                       │
│  └── ...                                        │
│                                                 │
│  ── Assignment Submissions ──                   │
│  │ Student      │ Course    │ Status │ Grade │  │
│  │ alice@...    │ Python    │ Review │  --   │  │
│  │ bob@...      │ WebDev    │ Graded │  85%  │  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Admin can:**

- Create/edit/delete courses
- Add modules with drag-and-drop ordering
- Embed YouTube videos (paste URL, auto-extracts video ID)
- Write reading content in Markdown (rendered with syntax highlighting)
- Create quizzes (multiple choice, code fill-in)
- Review and grade assignments

### 3. YouTube Video Embedding

Videos are embedded directly in module content with progress tracking.

```
┌─────────────────────────────────────────────────┐
│  Module 2: Control Flow                         │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │          ▶  YouTube Player                │  │
│  │        (iframe embed, no-cookie)          │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Video Progress: ████████░░ 80% watched         │
│                                                 │
│  📖 Reading: If/Else Statements                 │
│  ─────────────────────────────                  │
│  In Python, conditional statements...           │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Uses `youtube-nocookie.com` for privacy
- Tracks watch progress via YouTube IFrame API
- Must watch ≥80% to mark video as complete

### 4. AI Assistant (Claude-powered)

A sidebar chat that is context-aware of the current module, asks follow-up questions, and personalizes learning.

````
┌──────────────────────┬──────────────────────────┐
│                      │  🤖 AI Assistant          │
│   Module Content     │                          │
│                      │  Hi! I see you're on     │
│   (Reading/Video)    │  Module 2: Control Flow. │
│                      │                          │
│                      │  Before we continue, can │
│                      │  you explain what a      │
│                      │  boolean is?             │
│                      │                          │
│                      │  Student: its true/false │
│                      │                          │
│                      │  Exactly! Now, what do   │
│                      │  you think happens when  │
│                      │  we write:               │
│                      │  ```python               │
│                      │  if 0:                   │
│                      │      print("yes")        │
│                      │  ```                     │
│                      │                          │
│                      │  [Type message...]  [Send]│
└──────────────────────┴──────────────────────────┘
````

**AI capabilities:**

- **Context-aware:** Knows what module/course the student is in
- **Socratic method:** Asks questions back instead of just giving answers
- **Adaptive difficulty:** Adjusts explanations based on student responses
- **Quiz prep:** Can generate practice questions for the current topic
- **Code review:** Reviews code submissions and gives feedback
- **Guardrails:** Scoped to course content only, won't do homework for you

### 5. Assignment Submission Portal

```
┌─────────────────────────────────────────────────┐
│  📝 Assignment: Build a Calculator              │
│                                                 │
│  Due: Feb 28, 2026                              │
│  Status: Not Submitted                          │
│                                                 │
│  Instructions:                                  │
│  Build a Python calculator that supports        │
│  +, -, *, / operations using functions...       │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  Upload your file (.py, .zip)             │  │
│  │  [Choose File]                            │  │
│  │                                           │  │
│  │  -- OR paste code --                      │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ def add(a, b):                      │  │  │
│  │  │     return a + b                    │  │  │
│  │  │                                     │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  Notes to instructor: ________________   │  │
│  │                                           │  │
│  │            [Submit Assignment]             │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Previous Submissions:                          │
│  • v1 (Feb 20) — Graded: 72% "Fix edge cases"  │
│  • v2 (Feb 22) — Pending Review                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Users are managed by Supabase Auth (auth.users table)
-- This profiles table extends auth.users with app-specific data
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',  -- 'student' | 'admin' | 'instructor'
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Student'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(20),  -- 'beginner' | 'intermediate' | 'advanced'
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules (sequential, ordered)
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,  -- 1, 2, 3... determines unlock sequence
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- Module Content Blocks (readings, videos, quizzes)
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,  -- 'reading' | 'video' | 'quiz' | 'code_exercise'
    title VARCHAR(255),
    order_index INTEGER NOT NULL,
    -- Reading fields
    markdown_content TEXT,
    -- Video fields
    youtube_video_id VARCHAR(20),
    video_duration_seconds INTEGER,
    -- Quiz fields (questions stored as JSONB)
    quiz_data JSONB,
    -- Exercise fields
    exercise_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Progress (per content block)
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_block_id UUID REFERENCES content_blocks(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started',  -- 'not_started' | 'in_progress' | 'completed'
    video_watch_percent INTEGER DEFAULT 0,
    quiz_score INTEGER,
    quiz_answers JSONB,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, content_block_id)
);

-- Module Completion (derived, cached for fast lookups)
CREATE TABLE module_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Course Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

-- Assignments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    max_file_size_mb INTEGER DEFAULT 10,
    allowed_extensions TEXT[] DEFAULT '{.py,.js,.ts,.zip,.pdf}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    file_url TEXT,
    code_content TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'submitted',  -- 'submitted' | 'in_review' | 'graded' | 'returned'
    grade INTEGER,  -- 0-100
    feedback TEXT,
    graded_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ
);

-- AI Chat History
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL,  -- 'user' | 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Row Level Security (Supabase RLS)

Supabase enforces access rules at the database level — no backend middleware needed.

```sql
-- Students can only see their own progress
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own progress"
    ON progress FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users update own progress"
    ON progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Students can only see their own submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own submissions"
    ON submissions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users submit own assignments"
    ON submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can see everything
CREATE POLICY "Admins full access to submissions"
    ON submissions FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Anyone can browse published courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published courses"
    ON courses FOR SELECT
    USING (is_published = TRUE);
CREATE POLICY "Admins manage courses"
    ON courses FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
```

This means even if someone tampers with the frontend, the database rejects unauthorized queries.

---

## API Routes

```
Auth (handled by Supabase client-side SDK — no API routes needed)
  supabase.auth.signUp()             — Create account
  supabase.auth.signInWithPassword() — Login (returns JWT)
  supabase.auth.signOut()            — Logout
  supabase.auth.getUser()            — Current user profile

Courses (public)
  GET    /api/courses                — List published courses
  GET    /api/courses/:slug          — Course detail + module list

Modules (auth required)
  GET    /api/courses/:slug/modules          — Modules with lock status
  GET    /api/courses/:slug/modules/:id      — Module content (if unlocked)

Progress (auth required)
  GET    /api/progress/:courseId              — Student's progress in course
  POST   /api/progress/video                 — Update video watch %
  POST   /api/progress/reading               — Mark reading complete
  POST   /api/progress/quiz                  — Submit quiz answers
  POST   /api/progress/complete-module       — Check & mark module done

AI Assistant (auth required)
  POST   /api/ai/chat                — Send message, get Gemini/Claude response
  GET    /api/ai/conversations       — List past conversations
  GET    /api/ai/conversations/:id   — Get conversation history

Assignments (auth required)
  GET    /api/assignments/:moduleId          — Get assignment for module
  POST   /api/assignments/:id/submit         — Submit assignment
  GET    /api/assignments/:id/submissions    — My submissions

Admin (admin role required)
  POST   /api/admin/courses              — Create course
  PUT    /api/admin/courses/:id          — Update course
  DELETE /api/admin/courses/:id          — Delete course
  POST   /api/admin/modules              — Create module
  PUT    /api/admin/modules/:id          — Update module
  DELETE /api/admin/modules/:id          — Delete module
  POST   /api/admin/content-blocks       — Add content block
  PUT    /api/admin/content-blocks/:id   — Edit content block
  POST   /api/admin/assignments          — Create assignment
  GET    /api/admin/submissions          — All submissions (for grading)
  PUT    /api/admin/submissions/:id      — Grade submission
```

---

## Module Unlock Logic

```
┌──────────────────────────────────────────────┐
│         Module Unlock Flow                   │
│                                              │
│  Student requests Module N                   │
│           │                                  │
│           ▼                                  │
│  Is N == 1? ──Yes──▶ UNLOCKED (always)       │
│           │                                  │
│           No                                 │
│           │                                  │
│           ▼                                  │
│  Is Module (N-1) in                          │
│  module_completions? ──No──▶ LOCKED (403)    │
│           │                                  │
│          Yes                                 │
│           │                                  │
│           ▼                                  │
│  Return full module ──▶ UNLOCKED             │
│  content to client                           │
│                                              │
└──────────────────────────────────────────────┘

Module Completion Check:
  ✅ All readings marked as read
  ✅ All videos watched ≥80%
  ✅ All quizzes scored ≥70%
  → INSERT INTO module_completions
```

---

## Tech Stack (100% Free Tier)

Optimized for ~30 users, $0/month operation.

| Layer        | Technology               | Free Tier Limits                      | Cost   |
| ------------ | ------------------------ | ------------------------------------- | ------ |
| Frontend     | Next.js 14 (App Router)  | —                                     | $0     |
| Styling      | Tailwind CSS + shadcn/ui | —                                     | $0     |
| Database     | Supabase (PostgreSQL)    | 500MB DB, 50K rows, 2 projects        | $0     |
| Auth         | Supabase Auth (built-in) | 50K MAU, email/password + OAuth       | $0     |
| File Storage | Supabase Storage         | 1GB storage, 2GB bandwidth/mo         | $0     |
| AI           | Google Gemini 2.0 Flash  | 15 RPM, 1M tokens/day, 1500 req/day   | $0     |
| Video        | YouTube IFrame API       | Unlimited embeds                      | $0     |
| Markdown     | react-markdown + rehype  | —                                     | $0     |
| Deployment   | Vercel (Hobby)           | 100GB bandwidth, serverless functions | $0     |
| **TOTAL**    |                          |                                       | **$0** |

### Why This Works for 30 Users

```
Database:  30 users x 10 courses x 5 modules = ~1,500 rows (limit: 50,000)
Storage:   Assignment uploads ~50MB total (limit: 1GB)
AI:        30 students x ~10 chats/day = 300 req/day (limit: 1,500/day)
Auth:      30 monthly active users (limit: 50,000)
Bandwidth: 30 users casual usage ~5GB/mo (limit: 100GB)
```

### Supabase = Database + Auth + Storage (All-in-One)

Instead of wiring up separate services, Supabase gives you everything:

- **PostgreSQL** — full relational DB with JSONB support
- **Auth** — email/password signup, JWT tokens, row-level security
- **Storage** — file uploads with signed URLs
- **Realtime** — optional live updates (free)
- **Dashboard** — GUI to manage data, no SQL needed

### AI: Gemini 2.0 Flash (Free) vs Claude (Paid)

| Option           | Cost      | Quality   | Best for               |
| ---------------- | --------- | --------- | ---------------------- |
| Gemini 2.0 Flash | $0 (free) | Good      | Budget, 30-user scale  |
| Claude Haiku     | ~$0.50/mo | Very good | If budget allows $1/mo |
| Claude Sonnet    | ~$3-5/mo  | Excellent | Premium tutoring       |

**Recommendation:** Start with Gemini free tier. Swap to Claude later with a one-line env change — the API wrapper abstracts the provider.

### Upgrade Path (When You Outgrow Free)

```
Stage 1: 0-30 users   → Everything free ($0/mo)
Stage 2: 30-100 users → Supabase Pro $25/mo (8GB DB, 250GB bandwidth)
Stage 3: 100+ users   → Add Vercel Pro $20/mo, Claude API ~$10/mo
```

---

## Project Structure

```
codewithserah-academy/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (student)/
│   │   ├── dashboard/page.tsx           # Student home — enrolled courses
│   │   ├── courses/page.tsx             # Browse courses
│   │   ├── courses/[slug]/page.tsx      # Course detail — module list
│   │   ├── courses/[slug]/[moduleId]/
│   │   │   └── page.tsx                 # Module content (reading/video/quiz)
│   │   └── assignments/page.tsx         # My assignments
│   ├── (admin)/
│   │   ├── admin/page.tsx               # Admin dashboard
│   │   ├── admin/courses/new/page.tsx   # Create course
│   │   ├── admin/courses/[id]/edit/
│   │   │   └── page.tsx                 # Edit course & modules
│   │   └── admin/submissions/page.tsx   # Grade assignments
│   ├── api/
│   │   ├── courses/route.ts
│   │   ├── modules/route.ts
│   │   ├── progress/route.ts
│   │   ├── ai/chat/route.ts          # Gemini (free) or Claude (paid)
│   │   ├── assignments/route.ts
│   │   └── admin/route.ts
│   ├── layout.tsx
│   └── page.tsx                         # Landing page
├── components/
│   ├── ui/                              # shadcn components
│   ├── module-viewer.tsx                # Reading + video + quiz renderer
│   ├── youtube-player.tsx               # YouTube embed with tracking
│   ├── quiz-component.tsx               # Interactive quiz UI
│   ├── ai-chat-sidebar.tsx              # AI assistant panel
│   ├── assignment-upload.tsx            # File upload + code paste
│   ├── progress-bar.tsx                 # Module/course progress
│   ├── module-lock-card.tsx             # Locked/unlocked module card
│   └── markdown-renderer.tsx            # Styled markdown for readings
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client
│   │   ├── server.ts                    # Server Supabase client
│   │   └── middleware.ts                # Auth session refresh
│   ├── ai.ts                            # AI provider (Gemini free / Claude paid)
│   ├── unlock.ts                        # Module unlock logic
│   └── youtube.ts                       # Video ID extraction
├── supabase/
│   ├── migrations/                      # SQL migrations
│   └── seed.sql                         # Seed data
├── public/
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## AI Assistant System Prompt

Works with both Gemini (free) and Claude (paid). Same prompt, swap providers via `AI_PROVIDER` env var.

```
You are the CodewithSerah Academy tutor. You help students learn
by asking guiding questions rather than giving direct answers.

Current context:
- Course: {{course_title}}
- Module: {{module_title}}
- Module content summary: {{module_summary}}
- Student progress: {{progress_summary}}

Rules:
1. Use the Socratic method — ask questions to guide understanding
2. If a student asks you to solve their assignment, refuse politely
   and instead help them think through the approach
3. Keep explanations at the level appropriate for this course difficulty
4. Use code examples relevant to the current module topic
5. If the student seems stuck, break the problem into smaller steps
6. Celebrate progress and correct answers
7. Stay on topic — redirect off-topic questions back to the course
```

---

## Key User Flows

### Student Flow

```
Register → Browse Courses → Enroll → Module 1 unlocks
→ Read content → Watch video → Take quiz → Pass (≥70%)
→ Module 2 unlocks → ... → Submit assignment
→ Chat with AI for help → Complete course → Certificate
```

### Admin Flow

```
Login (admin) → Create Course → Add Modules (ordered)
→ Add Content Blocks (readings, videos, quizzes)
→ Create Assignments → Publish Course
→ Review Submissions → Grade & Feedback
```

---

## Getting Started

### 1. Set Up Supabase (5 min)

1. Go to [supabase.com](https://supabase.com) → Create free account → New Project
2. Copy your project URL and anon key from Settings → API
3. Go to SQL Editor → Run the migration SQL from `supabase/migrations/`
4. Go to Authentication → Settings → Enable email/password sign-up

### 2. Set Up Gemini AI (2 min)

1. Go to [aistudio.google.com](https://aistudio.google.com) → Get API Key
2. Copy the key (free, no credit card needed)

### 3. Run Locally

```bash
# Clone
git clone https://github.com/codewithserah/academy.git
cd academy

# Install
npm install

# Environment
cp .env.example .env.local
# Fill in your Supabase + Gemini keys (see below)

# Run
npm run dev
# → http://localhost:3000
```

### 4. Deploy to Vercel (3 min)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Add environment variables → Deploy
4. Done. Free HTTPS, free domain (yourapp.vercel.app)

---

## Environment Variables

```env
# Supabase (Database + Auth + Storage — all-in-one)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# AI Assistant (pick ONE — Gemini is free)
AI_PROVIDER="gemini"                    # "gemini" (free) or "claude" (paid)
GEMINI_API_KEY="AIza..."                # Free from aistudio.google.com
# ANTHROPIC_API_KEY="sk-ant-..."        # Optional upgrade — uncomment if using Claude
```

Only 4 env vars needed. That's it.

---

## License

MIT
