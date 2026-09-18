# 🌱 Focus Garden

A calm, Pomodoro-style focus timer that turns your concentration into a living garden. Set an intention, pick a plant, and start a session — it grows in real time as you focus, blooms if you finish, and wilts if you give up or wander off. Everything runs entirely in your browser: no sign-up, no backend, no tracking.

**Live demo:** _add your deployment URL here once you've deployed to Vercel_

## ✨ Features

- 🌸 **Four hand-illustrated, procedurally-animated plant species** — Wildflower, Bonsai, Lotus, Fern — each grows through real SVG growth stages (seed → sprout → stem → foliage → bud → bloom), driven by Framer Motion.
- ⏱️ **Intention-based focus sessions** — set a goal, tag a category (coding, reading, writing, design, learning, zen), and pick a duration from 15 to 300 minutes.
- 🛡️ **Three anti-distraction strictness levels** — Gentle (15s grace period on tab-switch), Strict Monk (instant wilt), Zen Flow (no penalty).
- 🎨 **Light & dark themes** — Light, Dark, or Auto (follows your OS), with no flash-of-wrong-theme on load.
- 🔊 **Zero-asset ambient audio** — rain, forest, and wave noise plus bloom/wilt chimes are synthesized live with the Web Audio API; no audio files are shipped.
- 🪴 **Garden gallery** — every past session becomes a permanent plant card, filterable by category or by "wilted only," with a replayable growth time-lapse and an editable reflection note.
- 📊 **Analytics dashboard** — current/longest streak, total focused hours, bloom rate, and a GitHub-style 30-day bloom heatmap.
- 💾 **Local-first & private** — all data lives in `localStorage`; nothing is ever sent to a server. Export or import your entire garden as a JSON backup at any time.
- 📱 **Installable PWA** — add it to your home screen via the web manifest and generated icons.

## 🛠️ Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, Turbopack
- [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/) for all SVG growth animation
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) for synthesized sound
- [canvas-confetti](https://github.com/catdad/canvas-confetti) for bloom celebrations
- [lucide-react](https://lucide.dev) icons

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables or external services are required — the app is entirely client-side.

## 📦 Deploying to Vercel

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected, zero configuration needed.
3. Deploy.

Optionally set a `NEXT_PUBLIC_SITE_URL` environment variable in your Vercel project to your production domain, so social-share previews (Open Graph image, metadata) resolve to absolute URLs. If you skip it, Vercel's own deployment URL is used automatically.

## 🗂️ Project Structure

```
src/
├── app/            # App Router shell, metadata, generated icons & OG image
├── components/
│   ├── garden/     # Garden gallery, analytics dashboard, plant inspector modal
│   ├── plant/      # The four animated SVG plant species
│   ├── timer/      # Intention selector, countdown timer, tab-away banner
│   └── ui/         # Header, settings modal
├── store/          # useGardenStore — all app state, session timer, streaks, theme
├── types/          # Shared TypeScript types
└── utils/          # Color palette generation, Web Audio sound engine
```

## 🔒 Privacy

Focus Garden stores everything in your browser's `localStorage` under a single key. There is no backend, no analytics, and no account system — your focus data never leaves your device unless you explicitly export it.

## 📄 License

MIT — see [LICENSE](LICENSE).
