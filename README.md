# Informatics Engineering · UTB — platform scaffold

This is a starting build, not the full five-module platform in one pass — a system this size
(auth, curriculum tree, lab booking, recruiter portal, GPA simulator, AI advisor) is normally
weeks of work across a real repo. What's here is production-ready and directly extendable.

## What's included

**`demo.html`** — open this directly in a browser. It's a standalone, dependency-free preview
of the 3D hero: a mouse-reactive neural mesh (three layers of glowing nodes, pulse particles
traveling along connectors, an outer wireframe shell) plus the vision/mission and career-track
sections with working badge interactions. This is what `Hero3D.jsx` renders in the real app.

**`frontend/`**
- `components/Hero3D.jsx` — the actual React Three Fiber component (not raw Three.js) for
  your Next.js app. Same visual logic as the demo, built the way you'd actually ship it:
  `useFrame` for the render loop, `useThree().pointer` for mouse tracking, lazy-loaded via
  `next/dynamic` with `ssr: false` since WebGL can't run server-side.
- `components/Homepage.jsx` — full page layout: hero + Suspense boundary, vision/mission cards,
  and the career-badge interaction that will drive the curriculum tree highlighting.
- `tailwind.config.js` — the neon-on-void color tokens (`neon-blue`, `neon-emerald`,
  `neon-orange`) and type scale (Space Grotesk / JetBrains Mono / Inter) used throughout.

**`backend/`**
- `models/` — Mongoose schemas for `User`, `Course`, `Project`, `Activity`, `Labs`, `LabBooking`.
  Prerequisite edges live on `Course.prerequisites`, ready to feed React Flow directly.
- `routes/` — `auth`, `courses` (tree + progress %), `projects` (showcase + recruiter access +
  partner matcher), `labs` (map + booking with conflict checks).
- `middleware/auth.js` — JWT verification and role gating (`student`, `ambassador`, `faculty`,
  `recruiter`, `admin`).
- `server.js` — Express app wiring, Helmet, rate limiting, CORS scoped to the frontend origin.

**`frontend/app/`** — proper Next.js 14 App Router structure:
- `layout.jsx` — root layout, imports global styles and React Flow's base CSS
- `page.jsx` — home route, renders `Homepage`
- `curriculum/page.jsx` — the curriculum tree route
- `globals.css` — Tailwind directives + font imports

**`frontend/components/SkillsTree.jsx` + `CourseNode.jsx`** — the interactive curriculum tree,
built on `@xyflow/react` (React Flow), seeded with the **real BSIE curriculum** transcribed from
`BSIE-Programme-Specifications-AY2022-2023.pdf` — all 75 courses, exact prerequisite chains, and
credit values across foundation + 4 years + the three major elective groups. Clicking an unlocked
(sky-blue) node marks it passed and unlocks whatever depends on it. The progress bar tracks
credits earned against the 204-credit degree total, including the 162-credit gate on the
Design Project A capstone.

**`frontend/lib/api.js`** — fetch wrapper for the Express backend (`NEXT_PUBLIC_API_URL`,
defaults to `http://localhost:4000`). The tree works two ways:
- **Live**: fetches `/api/courses` from your running backend; if you're logged in
  (`utb_token` in localStorage), passed courses sync through `/api/auth/me` and
  `/api/courses/:id/mark-passed`.
- **Guest fallback**: if the backend is unreachable, it silently falls back to the bundled
  `frontend/data/courses.json` and tracks progress in localStorage instead — so the tree always
  works, even before the backend is running.

**`backend/seed/courses.json` + `backend/seed.js`** — the same real curriculum, seedable straight
into MongoDB. The seed script does a two-pass insert to resolve prerequisite course codes into
proper ObjectId references.

## Not yet built

The GPA simulator, AI advisor chat UI, lab map React component, and certification upload flow
are designed for (the schemas and routes support them) but not coded yet — each is its own
focused build. Tell me which one to do next.

## Running it

```bash
# backend
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed               # populates MongoDB with the real BSIE curriculum
npm run dev                # http://localhost:4000

# frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                # http://localhost:3000
```

Open `http://localhost:3000`, click "View curriculum tree," and it'll either talk to your live
backend or fall back to guest mode automatically — no setup required to try it.
