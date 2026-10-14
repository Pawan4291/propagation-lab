# Propagation Lab

A community build that turns Ethereum's **real** block timing into things you can play with: a device
check (Flexnode Lab), a block-arrival guessing game (Monitor), a cutoff game (Deadline Lab), and an Optimum
quiz (Method). Every timing number comes from a real beacon-node event received by your browser, or a real
measurement your browser ran. **Not affiliated with, endorsed by, or sponsored by Optimum.**

## Stack
React + Vite + TypeScript + Tailwind v4, react-router-dom (HashRouter, so it works on any static host
without server rewrites), recharts, framer-motion. No backend, no database, no API keys, no wallet connect.
Scores and run history live only in `localStorage`.

## Data layer
- Primary: SSE on `{beacon}/eth/v1/events?topics=head`.
- Fallback A: polling `{beacon}/eth/v1/beacon/headers/head` every 250 ms.
- Fallback B: `api/beacon.js`, a tiny allow-listed Vercel proxy, used only if direct access fails.
- `genesis_time` and `SECONDS_PER_SLOT` are always fetched live, never hard-coded.
- Optional clock-offset probe against `https://www.cloudflare.com/cdn-cgi/trace`; if unreachable, the device
  clock is used and the UI says so.
- Speed probes use Cloudflare's free `speed.cloudflare.com` endpoints; if blocked, the device check shows
  latency + stability only and says exactly that.

## Known limitations (please read)
1. **Mascot asset**: the brief asked for `/public/mascot.webp` + `mascot.png` + `favicon.png` supplied by you.
   No mascot files existed in the project, and this tool cannot pause mid-build to request an upload, so an
   original mascot character (not a monkey, not any existing brand) was generated with the image tool and
   saved as `mascot.png` / `favicon.png`. Swap these two files for your own art at any time — no code changes
   needed. A `.webp` could not be produced by the image tool (PNG/JPG only), so the app references the PNG
   everywhere.
2. The mascot is a single still image, so "3D" reaction is a CSS/JS tilt, parallax, float and bounce — not a
   rigged/animated character.
3. This sandbox's outbound network access to `publicnode.com`/Cloudflare was not independently re-verified
   after every change; the data layer implements SSE → polling → proxy exactly as specified, with visible
   StatusPill source and honest "waiting…" / "unreachable" states if a given path is blocked on your network.
   Watch the StatusPill on `/monitor` after `npm run dev`.
4. `api/beacon.js` only runs on Vercel (serverless function). It is inert in a plain static preview — this is
   expected; it's a fallback for when the visitor's network blocks the direct beacon host.

## Run locally
```
npm install
npm run dev
```

## Build
```
npm run build
npm run preview
```

## Deploy (free)
```
git init
git add -A
git commit -m "Propagation Lab"
git branch -M main
git remote add origin https://github.com/Pawan4291/propagation-lab.git
git push -u origin main
```
Then on vercel.com → New Project → import the repo → framework "Vite" → build `npm run build` → output
`dist` → no environment variables → Deploy. Every `git push` redeploys.

## Verification checklist
- `grep -rn "Math.random\|faker\|mockData\|sampleData" src` → empty.
- `/monitor`: StatusPill shows the real source (SSE/polling/proxy); blocks accumulate in the table/CSV.
- Guess the Block, Cutoff Duel, Steady Hands, and the Quiz all score real or quiz data only; personal bests
  persist in `localStorage` (wrapped in try/catch) with no global leaderboard claim.
- All backgrounds are white/silver gradients; all text is black or graphite; the only colour on the site is
  inside the mascot image.
