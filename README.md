# Google Hackathon — AI Coding Tutor

An AI coding tutor that guides learners through programming problems using progressive hints and guiding questions — never giving direct answers.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **AI:** Google Gemini API (`gemini-2.0-flash`)
- **Auth:** Firebase Authentication (Google Sign-In)
- **Database:** Cloud Firestore
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **State:** Zustand, React Context
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Authentication and Firestore enabled
- A Gemini API key

### 1. Clone and install

```bash
git clone https://github.com/your-org/google-hackathon.git
cd google-hackathon
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `GOOGLE_GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same as above |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same as above |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same as above |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same as above |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same as above |

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → your project
2. **Authentication** → Get started → Enable **Google** sign-in provider
3. **Firestore** → Create database → Choose a region
4. **Firestore Rules** → Set to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /problems/{problemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /progress/{progressId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Set up admin access

1. Sign in to the app with Google (this creates your user doc in Firestore)
2. Find your UID in Firebase Console → Authentication → Users
3. Promote yourself to admin:

```bash
npx tsx scripts/seed-admin.ts YOUR_UID
```

4. Refresh the app — you'll see an **Admin** button in the dashboard header

### 6. Seed starter problems

1. Go to `/admin` (requires admin access)
2. Click **"Seed Starter Problems"** to add FizzBuzz, Reverse String, and Two Sum

## Project Structure

```
app/
  page.tsx                  # Landing page
  layout.tsx                # Root layout with AuthProvider
  login/page.tsx            # Google sign-in
  dashboard/page.tsx        # Problem list + progress
  problem/[id]/page.tsx     # Problem solver (editor + hints)
  chat/[problemId]/page.tsx # AI tutor chat
  code/[problemId]/page.tsx # Standalone code editor
  upload/page.tsx           # Create problem (admin only)
  admin/page.tsx            # Admin panel
  api/
    tutor/route.ts          # Hint generation
    evaluate/route.ts       # Code evaluation
    generate-sol/route.ts   # Reference solution gen (admin)

components/
  CodeEditor.tsx            # Monaco editor wrapper
  HintPanel.tsx             # Progressive hint display
  ChatMessage.tsx           # Chat message bubble
  ProblemCard.tsx           # Problem list card
  ProgressTracker.tsx       # User stats + progress bar
  ProtectedRoute.tsx        # Auth guard
  AdminRoute.tsx            # Admin guard
  providers/
    AuthProvider.tsx         # Firebase auth context

lib/
  firebase.ts               # Firebase client init
  gemini.ts                 # Gemini API client
  prompts.ts                # AI prompt templates
  rate-limit.ts             # In-memory rate limiter
  lessons.ts                # Seed problems + Firestore helpers
  admin.ts                  # Admin check utility

hooks/
  useAuth.ts                # Auth context consumer
  useAdmin.ts               # Admin role check
  useTutor.ts               # Tutor interaction flow

types/
  index.ts                  # Shared TypeScript types

scripts/
  seed-admin.ts             # Promote user to admin
```

## Key Features

- **AI Tutoring:** Never gives direct answers — uses 3 levels of progressive hints
- **Code Editor:** Full Monaco editor with syntax highlighting and dark theme
- **Code Evaluation:** AI evaluates submissions against test cases
- **Chat Interface:** Conversational AI tutor for deeper discussions
- **Admin Panel:** Seed problems, manage users, generate reference solutions
- **Role-Based Access:** Admin vs regular user permissions

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/seed-admin.ts <uid>` | Promote a user to admin |

## Firestore Collections

| Collection | Description |
|---|---|
| `problems` | Coding problems with test cases |
| `users` | User profiles with role (user/admin) |
| `progress` | Per-user per-problem progress tracking |

## Team Notes

- `NEXT_PUBLIC_FIREBASE_*` env vars are safe to expose client-side — they're identifiers, not secrets
- `GOOGLE_GEMINI_API_KEY` is server-only — must NOT be prefixed with `NEXT_PUBLIC_`
- Firestore security rules are what protect your data — keep them locked down
- First user to sign in needs to be manually promoted to admin via the seed script
- Rate limiting is in-memory (resets on server restart) — fine for hackathon, not for production
