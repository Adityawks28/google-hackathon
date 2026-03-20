# AI Coding Tutor - Project Overview

An AI-powered platform for students to solve programming problems with guided support from an AI tutor (CodeSensei). The tutor emphasizes algorithmic thinking and progressive hints, never providing direct answers until the final "teaching moment" (Level 3).

## Core Technologies
- **Framework:** Next.js 15+ (App Router), React 19, TypeScript.
- **AI:** Google Gemini API (`gemini-2.5-flash`).
- **Database & Auth:** Firebase (Firestore + Authentication).
- **Editor:** Monaco Editor (`@monaco-editor/react`).
- **Styling:** Tailwind CSS 4.

## Architecture & Patterns

### 1. Database Access (The "Model" Pattern)
- **Rule:** NEVER use `getDoc`, `setDoc`, `addDoc`, or `updateDoc` directly in components or API routes.
- **Pattern:** Use the pre-instantiated models in `lib/db/index.ts` (e.g., `problemModel`, `userModel`, `progressModel`).
- **Location:** Models are defined in `lib/db/models/` and utilize a generic converter in `lib/db/utils.ts` to handle ID mapping and type safety.

### 2. AI Tutor Logic
- **Brainstorm Mode:** Focuses on algorithm design and step-by-step planning before any code is written. (No code/syntax allowed).
- **Help Mode:** Progressive hints (Levels 1-3) based on the user's current code and their original brainstorm plan.
- **Prompts:** All system instructions are centralized in `lib/prompts.ts`.
- **Integration:** `lib/gemini.ts` contains the core interaction logic with the Gemini API.

### 3. Imports & Conventions
- **Global Imports:** Always use `@/` for imports (e.g., `import { ... } from '@/lib/db'`).
- **Top-Level:** All imports must be at the very top of the file.
- **Interfaces:** Prefer `interface` over `type` for object definitions.
- **ES Modules:** Use `import/export` exclusively; no `require()`.

## Building and Running

### 1. Prerequisites
- **Node.js 18+**
- **Docker & Docker Compose** (for Firebase Emulators)
- **Google Gemini API Key**

### 2. Setup
```bash
npm install
cp .env.dist .env
# Fill in Firebase and Gemini credentials in .env
```

### 3. Local Development
```bash
docker-compose up -d  # Start Firebase Emulators
npm run dev           # Start Next.js development server
```
- **App:** [http://localhost:3000](http://localhost:3000)
- **Firebase UI:** [http://localhost:4000](http://localhost:4000)

### 4. Admin Setup
To access the `/admin` panel:
1. Sign in to the app (creates your user record).
2. Get your UID from the Firebase Emulator/Console.
3. Promote yourself: `npx tsx scripts/seed-admin.ts YOUR_UID`.

## Coding Guidelines

- **Keep it Minimal:** Prioritize simple, readable implementations over complex abstractions.
- **No Over-Engineering:** Avoid "just-in-case" features or excessive generic types.
- **Consistency:** Follow existing patterns in `lib/db/models` when adding new collections.
- **Validation:** Always verify database changes in the Firebase Emulator UI.
- **Safety:** Never expose `GOOGLE_GEMINI_API_KEY` to the client (do NOT prefix with `NEXT_PUBLIC_`).

## Backend Extensions (Experimental)
- **Python Functions:** Located in `functions/`, these are Firebase Functions using the Python SDK. They include triggers for Firestore events (e.g., `on_problem_added`) and placeholder HTTP endpoints for AI generation.
- **Usage:** Primarily intended for background processing or complex AI logic that benefits from Python's ecosystem.

## Key Directory Structure
- `app/api/`: Server-side routes for AI interactions and evaluation.
- `lib/db/models/`: Data access layer (Problem, User, Progress).
- `lib/prompts.ts`: Source of truth for AI personalities and rules.
- `components/`: UI components (Editor, Chat, Progress).
- `scripts/`: Utility scripts for seeding and admin management.
