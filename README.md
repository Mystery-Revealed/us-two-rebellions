# Two Rebellions: A Tale of Two Governments

**Unit 3 · 8th Grade U.S. History · TEKS 8.15B, 8.5A, 8.17B, 8.1A**

You run the national government **twice**. Round 1 (**1786**, the Articles of
Confederation): Shays' Rebellion rises in Massachusetts and **every lever on
the desk fails** — no tax power, no army, no executive, no national courts.
You're graded on *predicting the real failure and knowing why*. Round 2
(**1794**, the Constitution): the Whiskey Rebellion rises in Pennsylvania and
**the same levers work**. You're graded on *choosing the real constitutional
action*. Same nation, same kind of trouble, opposite endings — the game IS the
comparison TEKS 8.15B and 8.17B ask for.

**Winning vs. accuracy.** Round 1 is *designed to be lost* on the meters —
**Order ⚖️ · Money 💰 · Trust 🏛️** sag no matter what, because the Articles
government truly failed; the right call just loses less. The grade never
depends on meters: **accuracy is the score** (right = 1, partial = 0.5,
wrong = 0, server-side), and it tiers the ending — **Chief Historian** (≥83) /
**Junior Clerk** (50–82) / **Back to the Archives** (<50). The
collapse-then-recovery arc is the lesson made visible.

Built on the shared U.S. History Socket.IO engine (server-authoritative, solo
mode). Straight factory usage — 6 phases × 2 static graded steps = 12 graded
actions, one class group, no variants, no branch, no AI rival. The 1787
interlude is a **client-only** screen between steps 6 and 7 — the engine never
sees it; the adapter is flat.

## Run it

```bash
npm install        # installs server/ and client/ via postinstall
npm test           # server test suite (content + engine lifecycle)
npm run build      # builds the React client into client/dist
npm start          # serves game + Teacher Command Center on :4000
```

- Student game: `http://localhost:4000`
- Teacher Command Center: `http://localhost:4000/#teacher`

## What's specific to this game

- **Adapter:** `server/src/games/usTwoRebellions.js` — 12 decisions
  transcribed from the build spec's answer key. Meters start at 50; every
  choice carries the spec's explicit meter effect. The Round 1 "scripted
  drift" lives entirely in those per-choice effects (no hidden per-phase
  toll) and **never touches scoring** — content tests pin both the sagging
  Round 1 arc and the 100% accuracy of a flawless run.
- **The lever console (the novel client piece):** the three choices are brass
  levers on a federal-navy panel. In Round 1 every pull visibly **jams** with
  a crimson **NO POWER** stamp — whichever lever you reach for, the Articles
  government can't act. In Round 2 the same console's levers **engage**
  (green). A short client-side dwell guarantees the animation is seen before
  the verdict panel takes over (the server batches resolution + next prompt
  in one push).
- **The 1787 interlude:** Independence Hall at dusk, then the console rebuilds
  itself in a ~4-second animation as three new levers slot in — **Tax ·
  Executive · Courts**. Ungraded, skippable, plays exactly once, and skipped
  cleanly on a mid-game rejoin.
- **The dual-arc ending chart:** one continuous line (the three meters summed,
  0–300) split at 1787 — a crimson collapse arc under the Articles, a green
  recovery arc under the Constitution. Built entirely from meter snapshots
  the client already received; nothing extra is stored server-side.
- **The comparison table** (spec §2.1) renders on the ending screen: who rose,
  what they targeted, what the national response was, and how it ended —
  Shays vs. Whiskey, side by side.
- **Desk plates:** Round 1 plays under **CONGRESS OF THE CONFEDERATION**;
  Round 2 under **PRESIDENT OF THE UNITED STATES**.
- **Vocabulary bubbles:** armory, excise tax, militia, foreclosure, and
  enforce are underlined with tap-for-plain-words definitions.
- **The shared debrief** (every tier): both rebellions were farmers with real
  grievances; the government is what changed. "Same nation, same trouble.
  The difference was the Constitution."
- **Dashboard:** one class-wide group; PDF includes the roster (Name · Status ·
  Accuracy %) and the class average.

## Sensitivity (spec §11, Common Standards §10)

- Both rebellions were driven by ordinary farmers with real grievances —
  Shays' men were unpaid war veterans losing their homes. They are depicted
  with dignity: worried families and distant marches, never a violent mob,
  never gore.
- The game's judgment targets *government structure*, not the farmers.
- Washington's response is lawful force used with restraint ("almost without
  a shot"), not a celebration of crushing protest; S11's wrong answer ("the
  President can do anything he wants") exists to keep "strong government"
  tied to *limited* government.

Session data lives in server memory only; the teacher's PDF is the only record
that survives. Deploy shape: one Render web service (see `render.yaml`),
embedded in Wix — same workflow as the companion U.S. History games.

*Companion to Philadelphia 1787, Ratify It!, Rights Defender, and the Unit 3
apps.*
