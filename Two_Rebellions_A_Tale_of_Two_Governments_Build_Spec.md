# "Two Rebellions: A Tale of Two Governments" — Build Specification
### Unit 3 Game · 8th Grade U.S. History · Articles of Confederation & the Constitution

**Purpose:** A build-ready spec to paste into Claude (Fable, Opus, Sonnet) to build, deploy on Render via GitHub, and embed in Wix. Shared engine and workflow — this covers what's unique.

> **Reading-level rule (everything the student sees):** 8th grade content at a **5th grade reading level** — short sentences, common words, hard terms defined on first use. Does not apply to this spec itself.

> **Data method:** the **shared Socket.IO engine, solo mode** (server-authoritative, in-memory sessions, no database), adding one adapter: `usTwoRebellions.js`.

> **The design's engine:** the student runs the national government **twice**. Round 1 (1786, the Articles): every lever fails — graded on *predicting the real failure and knowing why*. Round 2 (1794, the Constitution): the same levers work — graded on choosing the real constitutional action. Same problem, two governments, opposite results: the game IS the comparison TEKS 8.15B and 8.17B ask for.

---

## 1. Game at a Glance

| Field | Value |
|---|---|
| **Title** | Two Rebellions: A Tale of Two Governments |
| **Unit** | 3 — The Beginning of the Nation (Articles → Constitution) |
| **TEKS** | 8.15B (Articles' weaknesses exposed by Shays' Rebellion), 8.5A (Washington and the Whiskey Rebellion), 8.17B (federal authority demonstrated), 8.1A (1787 as the pivot) |
| **Pick** | **None: one class group** — everyone plays both rounds in sequence |
| **Type** | Solo compare-and-decide — 2 rounds × 6 decisions = **12 graded actions** |
| **Playtime** | 8–11 minutes |
| **Platform / tracking** | Shared engine solo mode; one class-wide accuracy group; session-only data |
| **Art style** | Semi-realistic / cinematic; a national "operations desk" frames both crises |

**One-sentence pitch:** Sit at the government's desk in 1786 and watch every order fail against Shays' Rebellion — then return in 1794, Constitution behind you, and watch the same orders end the Whiskey Rebellion almost without a shot.

**Winning vs. accuracy.** Round 1 is *designed to be lost* on the meters — they sag no matter what, because the Articles government truly failed. The grade never depends on meters: accuracy measures predicting each real failure (Round 1) and picking each real constitutional power (Round 2). The collapse-then-recovery arc is the lesson made visible.

---

## 2. Historical Content Bank

### 2.1 The two rebellions (the game's spine)
| | **Shays' Rebellion (1786–87)** | **Whiskey Rebellion (1794)** |
|---|---|---|
| **Government** | Articles of Confederation | U.S. Constitution |
| **Who rose** | Massachusetts farmers — many Revolutionary War veterans — crushed by debt, foreclosures, high taxes | Western Pennsylvania farmers, angered by the 1791 federal whiskey excise (whiskey was their money) |
| **Target** | A federal armory; the debtor courts | Federal tax collectors |
| **National response** | None possible: no tax power, no money for an army, no executive, no national courts. Massachusetts finally raised its own force | Washington invoked the Constitution, **personally leading nearly 13,000 militiamen** west |
| **Result** | Government humiliated; Washington alarmed; the definitive signal the Articles were too weak — next stop Philadelphia, 1787 | Collapsed **quickly, almost without a shot** — proof the new government could enforce its laws |

### 2.2 The Articles' failures (Round 1's answer key)
Congress could not tax (it begged states and stayed broke, war debts unpaid); could not regulate commerce (worthless state paper money, interstate tariffs); could not enforce laws (no President, no national courts); needed 9 of 13 states for major laws, all 13 to amend.

### 2.3 Vocabulary (define on first use)
**Armory** — where weapons are stored; **excise tax** — a tax on making or selling a product; **militia** — citizens called up as emergency soldiers; **foreclosure** — losing your farm over unpaid debt; **enforce** — make people follow a law.

---

## 3. Core Mechanics

**Meters (0–100, start 50):** **Order** ⚖️ — public peace; **Money** 💰 — the treasury; **Trust** 🏛️ — faith in government. **Scripted drama:** in Round 1 meters drift down even on right answers (right loses *less*); Round 2 reverses the arc. The end screen shows both arcs side by side.

**Structure:** Round 1 (Shays, six steps) → ungraded interlude ("1787: Philadelphia builds a new machine") → Round 2 (Whiskey, six steps) = **12 graded actions**; each: situation card → three choices → verdict + feedback → meters. Right = 1, partial = 0.5, wrong = 0, server-side; accuracy = points ÷ 12 × 100.

**Endings:** accuracy tiers ("Chief Historian" / "Junior Clerk" / "Back to the Archives"); the debrief contrasts the two rebellions in one table and lands on: "Same nation, same trouble. The difference was the Constitution."

---

## 4. Reference Content — the Twelve Steps (answer key)

Student-facing text models the 5th-grade voice; one shared key (no variants).

### ROUND 1 — 1786, the Articles. *Desk plate: CONGRESS OF THE CONFEDERATION.*

**S1 — The debt bomb.** *Massachusetts farmers — veterans you never paid — are losing their farms to debt courts. What can Congress actually do about money?*
- **A) Pass a national tax.** ❌ (Money −5). *"The catch: under the Articles, Congress has NO power to tax. None."*
- **B) Ask the states — politely — for funds.** ✅ (Money −5, Trust −5). *"Begging is the only tool. The states mostly say no, as always."*
- **C) Order states to lower court fees.** ❌ (Trust −5). *"Congress can't order states to do anything."*

**S2 — Armed march.** *Daniel Shays leads armed farmers toward a federal armory. You reach for the army lever. What happens?*
- **A) Congress raises a national force at once.** ❌ (Order −10). *"With what money? Recruiting fails."*
- **B) You ask states for men and money; almost nothing arrives in time.** ✅ (Order −5). *"Exactly what happened. The government watched, powerless."*
- **C) The President federalizes the militia.** ❌ (Trust −5). *"What President? The Articles created no executive."*

**S3 — Call the courts?** *Can a national judge order the rebellion stopped?*
- **A) A federal court issues the order.** ❌ (Trust −5). *"There are no national courts to issue anything."*
- **B) There is no national court — and state courts are what the farmers are shutting down.** ✅ (Order −5). *"Right. No referee in sight."*
- **C) Congress acts as the court.** ⚠️ (Trust −5). *"Half-credit: Congress refereed disputes between states — not rebellions inside one."*

**S4 — Emergency funding drive.** *You send urgent money requests to all thirteen states. What comes back?*
- **A) Every state pays its fair share.** ❌ (Money −5). *"They never did — not once in the Articles' life."*
- **B) A trickle from a few states; the treasury stays empty.** ✅ (Money −5). *"The Confederation's permanent condition."*
- **C) The states send soldiers instead of cash.** ❌ (Order −5). *"They guarded their own borders and budgets."*

**S5 — Who ends it?** *Someone finally stops the rebellion. Who?*
- **A) The national army, in the nick of time.** ❌ (Trust −5). *"No such force ever marched."*
- **B) Massachusetts raises its own force and ends it itself.** ✅ (Order +5, Trust −5). *"The state did the national government's job. Everyone noticed."*
- **C) The farmers give up on their own.** ❌. *"They were desperate, not tired."*

**S6 — The takeaway.** *Washington reads the reports, alarmed. What lesson do leaders draw?*
- **A) The Articles need only small patches.** ❌ (Trust −5). *"Amending needed all 13 states — even patches were impossible."*
- **B) The nation needs a government strong enough to keep order, enforce laws, and pay its way.** ✅ (Trust +5). *"The definitive signal. Next: Philadelphia, 1787."*
- **C) Rebellions can't happen in a republic.** ❌. *"One just did."*

*Interlude card (ungraded): "1787 — a new Constitution: power to tax, a President, federal courts. The desk gets new levers. Let's test them."*

### ROUND 2 — 1794, the Constitution. *Desk plate: PRESIDENT OF THE UNITED STATES.*

**S7 — Revenue, legally.** *1791: war debts must be paid. Under the Constitution, how does the nation raise money?*
- **A) Congress passes a tax — an excise tax on whiskey.** ✅ (Money +10). *"The power to tax, used. It works — and causes our next problem."*
- **B) Beg the states, like old times.** ❌ (Money −5). *"Old machine. The new one taxes directly."*
- **C) Only states may tax; the nation borrows.** ❌. *"Backwards — the taxing power was the whole repair."*

**S8 — The backlash.** *Pennsylvania farmers — who use whiskey like cash — attack the tax collectors, 1794. Who answers, under what authority?*
- **A) President Washington, using the Constitution's executive power.** ✅ (Trust +10). *"An executive exists now, and enforcement is his job."*
- **B) Nobody — there's no executive.** ❌ (Trust −5). *"That was 1786. The repair added a President."*
- **C) Massachusetts handles it again.** ❌. *"Not a state's job anymore — and not even the same state."*

**S9 — Raising the force.** *How does the government field an army this time?*
- **A) Washington calls up nearly 13,000 militiamen under federal authority.** ✅ (Order +10, Money −5). *"Funded by real revenue, summoned by real authority."*
- **B) Send requests to the states and hope.** ❌. *"Hope was the old system's budget."*
- **C) Hire foreign troops.** ❌ (Trust −10). *"Never happened — imagine the message."*

**S10 — The march.** *Washington personally rides at the column's head — a sitting President leading troops. What happens out west?*
- **A) The rebellion collapses quickly, almost without a shot.** ✅ (Order +10, Trust +5). *"The show of lawful force was enough — barely any fighting."*
- **B) Years of bloody civil war.** ❌ (Order −10). *"No — the point is how fast it ended."*
- **C) The army defects to the rebels.** ❌. *"The militiamen answered a lawful call, and it held."*

**S11 — The meaning.** *What did the response prove about the Constitution?*
- **A) The federal government can enforce its laws and keep order.** ✅ (Trust +10). *"Demonstration complete: the new machine runs."*
- **B) The President can do anything he wants.** ❌ (Trust −5). *"No — he used listed powers, within the law. Limited government still applies."*
- **C) Taxes will never be resisted again.** ❌. *"Americans arguing about taxes never stopped."*

**S12 — The comparison.** *Same desk, two rebellions, opposite endings. WHY?*
- **A) The Constitution added what the Articles lacked: taxing power, an executive, real authority.** ✅ (Trust +10). *"The whole tale of two governments — say it just like that on the test."*
- **B) Luck — the weather favored Washington.** ❌. *"Structure, not weather."*
- **C) The whiskey farmers were weaker than Shays' men.** ❌ (Order −5). *"Both were farmers with grievances. What changed was the government."*

---

## 5. Screens & UI Flow

1. **Title:** split-screen hero — the same desk in 1786 candle-gloom and 1794 lamplight; "Run the Government. Twice."
2. **No pick screen** — a single "Take the Desk" button (one class group).
3. **Round loop:** situation card above the **lever panel** (three choices as brass levers on a navy console). Round 1: pulled levers visibly *jam* — a crimson "NO POWER" stamp. Round 2: the same console, green-lit levers that engage. Verdict → feedback → meters.
4. **Interlude:** the 1787 card — the console rebuilt in a 4-second animation (new levers slot in: Tax · Executive · Courts).
5. **Ending:** dual-arc meter chart (collapse, then recovery), comparison table, accuracy, tier title.
- **Union Blue:** console federal navy `#1B2A4A`; jams crimson `#B23A48`; engaged levers deep green `#2F7D4F`; page `#F5F7FA`. **No tan/parchment UI.** The console rebuild is the money moment.

## 6. Engine Integration

- **Adapter:** `server/src/games/usTwoRebellions.js` (`createStepGame`); `gameId: 'us-two-rebellions'`, mode `solo`, **no variants**, `totalActions: 12`, meters `{ order: 50, money: 50, trust: 50 }`.
- The interlude is a client-side screen between steps 6 and 7 — no engine change; the adapter is flat.
- Register in `games/index.js`; repo `us-two-rebellions`. Command Center stock, one accuracy group.

## 7. Visual & Audio Assets (Higgsfield MCP)

**Art direction (prepend):** *Semi-realistic cinematic historical illustration, 1780s–1790s America, cool natural light, dignified working people, no violence shown. No text, no logos. 16:9.*

| # | Asset | Prompt sketch |
|---|---|---|
| 1 | Title / hero | "One wooden government desk shown twice: dim candle-gloom left, confident lamplight right." |
| 2 | R1 — farms | "A Massachusetts farm in late autumn, a family reading a court notice, dignified and worried, 1786." |
| 3 | R1 — march | "A distant column of farmers with muskets crossing a snowy field toward a stone armory — tension, no fighting." |
| 4 | Interlude | "Independence Hall glowing at dusk, 1787, delegates' silhouettes in the windows." |
| 5 | R2 — tax | "A Pennsylvania farm still and copper kettles, farmers arguing with a man holding papers — heated, not violent, 1794." |
| 6 | R2 — the ride | "Washington on horseback reviewing ranks of militiamen on a misty road west, banners, solemn scale — no combat." |
| 7 | Ending | "The same desk at peace: ledger balanced, lamp steady, the Constitution in a stand." |
| 8 | *(Optional)* ambience | R1: wind, a distant bell; R2: drums and hoofbeats. Muted by default. |

## 8. Model Workflow

Standard order. Deltas: **Fable-moderate** — two distinct textures (helplessness vs. capability) without editorializing; feedback carries the comparison. **Opus-light** — flat adapter, but Opus verifies the Round 1 *scripted meter drift* stays cosmetic and never touches scoring. Sonnet builds the jamming-lever console and rebuild animation.

## 9. Teacher Command Center

Standard, **one class-wide accuracy group** ("Class — 26 students — 81% average"). PDF: Students (Name · Status · Accuracy %) + class row. Footer: `Made for 8th Grade U.S. History · TEKS 8.15B, 8.5A, 8.17B, 8.1A`.

## 10. Build Checklist & Test Plan (delta)

- [ ] All 12 verdicts match Section 4; S2/S8 and S5/S9 mirror across rounds (same lever, opposite result)
- [ ] Round 1 meters sag on right answers while accuracy scores 1.0 — divergence explicitly tested
- [ ] All-right = 100%, all-wrong = 0%, server-side; interlude ungraded and skip-safe on rejoin
- [ ] "NO POWER" stamp only in Round 1; console rebuild plays exactly once
- [ ] Dual-arc ending chart renders at 360px
- [ ] Palette check: navy console, zero tan/parchment
- [ ] Standard items: reading level, alt text, session-only data, PDF, end-session box

## 11. Teacher / Sensitivity Notes

Both rebellions were driven by ordinary farmers with real grievances — Shays' men were unpaid war veterans losing their homes. Depict them with dignity: worried families and distant marches, never a violent mob, never gore. The game's judgment targets *government structure*, not the farmers. Washington's response is lawful force used with restraint ("almost without a shot"), not a celebration of crushing protest; S11's wrong answer B exists to keep "strong government" tied to *limited* government.

---
*Companion to Philadelphia 1787, Ratify It!, Rights Defender, and the Unit 3 apps. Shared engine (solo mode), Union Blue palette, same GitHub → Render → Wix workflow.*
