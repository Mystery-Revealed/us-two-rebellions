// usTwoRebellions.js — Unit 3 U.S. History adapter: "Two Rebellions: A Tale of
// Two Governments" (SOLO, single class group, NO variant, NO branch, NO AI rival).
//
// The student runs the national government TWICE against a real armed uprising.
// Round 1 (1786, six decisions): the Articles of Confederation face Shays'
// Rebellion. Congress can't tax, can't raise an army, has no executive, and no
// national courts — so EVERY lever the student pulls fails, no matter how sound
// the choice is. Accuracy grades whether the student correctly PREDICTED each
// real failure. Round 2 (1794, six decisions): the same student, the same desk,
// now runs the Constitution against the Whiskey Rebellion — the same levers
// work, because the Constitution added the tax power, an executive, and federal
// courts. Accuracy grades whether the student picked the real constitutional
// action. Twelve graded actions total; the comparison between the two rounds
// IS the lesson (TEKS 8.15B, 8.5A, 8.17B, 8.1A).
//
// THE ENGINE OF THE DESIGN (spec §1, §3): three meters — Order ⚖️, Money 💰,
// Trust 🏛️ — are DRAMA, never the grade. In Round 1 even the historically right
// call still bleeds meters (Congress has no power to make the outcome good); in
// Round 2 the right call mostly repairs them. This divergence lives entirely in
// each choice's own `effects` — there is no extra per-phase toll layered on top,
// so the adapter stays flat (spec §6, §8: "Opus-light — flat adapter").
// ACCURACY (verdict-only, right=1 / partial=0.5 / wrong=0) decides the ending
// tier here (unlike the meter-sum tiering in Washington's War) — spec §3.
//
// Straight factory usage (spec §6): 6 phases × 2 static graded steps = 12 graded
// actions, one class group ('class'), no variants, no branch, no map board, no
// AI rival. Phases 0–2 are Round 1 (Shays); phases 3–5 are Round 2 (Whiskey) —
// the interlude between them (spec §4: "Interlude card, ungraded") is a
// CLIENT-ONLY screen inserted between step 6 and step 7; the engine never sees
// it (spec §6: "no engine change; the adapter is flat").
//
// Reading level (Common Standards §3): every student-facing word is 8th-grade
// content at a 5th-grade reading level.
//
// SENSITIVITY (spec §11, Common Standards §10): both rebellions were driven by
// ordinary farmers with real grievances — Shays' men were unpaid war veterans
// losing their homes. They are named with dignity; the judgment here targets
// GOVERNMENT STRUCTURE, not the farmers. Washington's response is framed as
// lawful force used with restraint ("almost without a shot"), not a celebration
// of crushing protest — S11's wrong option B exists to keep "strong government"
// tied to *limited* government.

import { createStepGame } from './_stepGame.js';

// ---------------------------------------------------------------------------
// Meters (shipped to clients at match:begin — display info only). Start 50
// each (spec §3). They never touch accuracy — only the drama on screen.
// ---------------------------------------------------------------------------

export const METERS = {
  order: { name: 'Order', icon: 'order', blurb: 'The public peace. Is anyone actually keeping it?' },
  money: { name: 'Money', icon: 'money', blurb: 'The treasury. Can the government pay for anything at all?' },
  trust: { name: 'Trust', icon: 'trust', blurb: 'Faith in the government — from the people, and from history.' },
};

export const START_METERS = { order: 50, money: 50, trust: 50 };

// One class group (spec §1: "Pick: none — one class group"). The roster and
// the Command Center group every student under this single side.
export const SIDE = 'class';

// The five required vocabulary terms (spec §2.3). The client underlines these
// in student-visible text with tap-for-plain-words bubbles.
export const VOCAB = {
  armory:     'where weapons are stored',
  excisetax:  'a tax on making or selling a product',
  militia:    'citizens called up as emergency soldiers',
  foreclosure: 'losing your farm over unpaid debt',
  enforce:    'make people follow a law',
};

// Desk plates (spec §5, "Screens & UI Flow"): the console's nameplate reads
// differently by round. Round is derived client-side from the chapter index
// (phases 0–2 = Round 1, phases 3–5 = Round 2) — no engine change needed.
export const DESKS = ['CONGRESS OF THE CONFEDERATION', 'PRESIDENT OF THE UNITED STATES'];

// The comparison table (spec §2.1, §4 "the debrief contrasts the two
// rebellions in one table") — pure display data, shipped once in `meta`.
export const COMPARISON = [
  { label: 'Government', shays: 'Articles of Confederation', whiskey: 'U.S. Constitution' },
  { label: 'Who rose', shays: 'Massachusetts farmers — many war veterans — crushed by debt and foreclosure', whiskey: 'Western Pennsylvania farmers, angered by the 1791 whiskey tax' },
  { label: 'Target', shays: 'A federal armory; the debtor courts', whiskey: 'Federal tax collectors' },
  { label: 'National response', shays: 'None possible — no tax power, no army, no executive, no national courts', whiskey: 'Washington personally led nearly 13,000 militiamen west' },
  { label: 'Result', shays: 'Government humiliated — the clearest sign the Articles were too weak', whiskey: 'Collapsed quickly, almost without a shot — proof the new government could enforce its laws' },
];

// ---------------------------------------------------------------------------
// Decisions. Every choice carries an EXPLICIT effects object matching spec §4's
// named meter change for each option (the drift is authored per-choice, not
// bolted on as a separate toll — spec §3's "scripted drama" IS this table).
//
// v: 'right' | 'partial' | 'wrong'   fx: explicit meter effects for that choice.
// ---------------------------------------------------------------------------

const V = { R: 'right', P: 'partial', W: 'wrong' };

function choice(label, verdict, fx, feedback) {
  return { label, verdict, effects: fx, feedback };
}

// A decision is a full situation-card prompt (spec §4's own text) + three
// choices, one graded step.
function decision(prompt, a, b, c) {
  return {
    kind: 'decision',
    prompt,
    choices: [
      choice(a.label, a.v, a.fx, a.fb),
      choice(b.label, b.v, b.fx, b.fb),
      choice(c.label, c.v, c.fx, c.fb),
    ],
  };
}

// ---------------------------------------------------------------------------
// The six phases (3 per round, 2 decisions each = 12 graded actions). Content
// is verbatim from spec §4, with one light addition: "foreclosure" is woven
// into S1's prompt so the required vocabulary term actually appears in
// student-visible text (spec §2.3 defines it; the spec's own §4 prose never
// used the word). Nothing graded changes.
// ---------------------------------------------------------------------------

export const PHASES = [
  // ===== ROUND 1 — 1786, the Articles ("CONGRESS OF THE CONFEDERATION") =====

  // ----- Phase 1: The Debt Crisis -----
  {
    title: 'The Debt Crisis',
    date: '1786 · Massachusetts',
    image: 'scene_shays_farm.webp',
    event: 'Farmers across Massachusetts are losing their farms to unpaid debt and foreclosure. They served in the Revolution. Now Congress must decide what it can do.',
    steps: [
      decision(
        'Massachusetts farmers — veterans you never paid — are losing their farms to debt courts and foreclosure. What can Congress actually do about money?',
        { label: 'Pass a national tax.',
          v: V.W, fx: { money: -5 },
          fb: 'The catch: under the Articles, Congress has NO power to tax. None.' },
        { label: 'Ask the states — politely — for funds.',
          v: V.R, fx: { money: -5, trust: -5 },
          fb: 'Begging is the only tool you have. The states mostly say no, as always.' },
        { label: 'Order the states to lower their court fees.',
          v: V.W, fx: { trust: -5 },
          fb: "Congress can't order states to do anything." },
      ),
      decision(
        'Daniel Shays leads armed farmers toward a federal armory. You reach for the army lever. What happens?',
        { label: 'Congress raises a national force at once.',
          v: V.W, fx: { order: -10 },
          fb: 'With what money? Recruiting fails before it starts.' },
        { label: 'You ask the states for men and money; almost nothing arrives in time.',
          v: V.R, fx: { order: -5 },
          fb: 'Exactly what happened. The government watched, powerless.' },
        { label: 'The President federalizes the militia.',
          v: V.W, fx: { trust: -5 },
          fb: 'What President? The Articles created no executive at all.' },
      ),
    ],
  },

  // ----- Phase 2: No Referee, No Money -----
  {
    title: 'No Referee, No Money',
    date: '1786 · Massachusetts',
    image: 'scene_shays_farm.webp',
    event: 'No national court can step in. No national treasury can pay for help. Congress has neither a referee nor a wallet.',
    steps: [
      decision(
        'Can a national judge order the rebellion stopped?',
        { label: 'A federal court issues the order.',
          v: V.W, fx: { trust: -5 },
          fb: 'There are no national courts to issue anything.' },
        { label: 'There is no national court — and state courts are exactly what the farmers are shutting down.',
          v: V.R, fx: { order: -5 },
          fb: 'Right. There is no referee in sight.' },
        { label: 'Congress acts as the court.',
          v: V.P, fx: { trust: -5 },
          fb: "Half-credit: Congress refereed disputes between states — not rebellions inside one." },
      ),
      decision(
        'You send urgent money requests to all thirteen states. What comes back?',
        { label: 'Every state pays its fair share.',
          v: V.W, fx: { money: -5 },
          fb: "They never did — not once in the Articles' whole life." },
        { label: 'A trickle from a few states; the treasury stays empty.',
          v: V.R, fx: { money: -5 },
          fb: "The Confederation's permanent condition." },
        { label: 'The states send soldiers instead of cash.',
          v: V.W, fx: { order: -5 },
          fb: 'They guarded their own borders and their own budgets instead.' },
      ),
    ],
  },

  // ----- Phase 3: The Reckoning -----
  {
    title: 'The Reckoning',
    date: '1786–87 · Massachusetts',
    image: 'scene_shays_march.webp',
    event: 'Someone has to stop the armed farmers marching on the armory. Congress cannot. Someone else will have to.',
    steps: [
      decision(
        'Someone finally stops the rebellion. Who?',
        { label: 'The national army, in the nick of time.',
          v: V.W, fx: { trust: -5 },
          fb: "No such national force ever marched — there wasn't one to send." },
        { label: 'Massachusetts raises its own force and ends it itself.',
          v: V.R, fx: { order: 5, trust: -5 },
          fb: "The state did the national government's job. Everyone noticed." },
        { label: 'The farmers give up on their own.',
          v: V.W, fx: {},
          fb: 'They were desperate, not tired. They had to be stopped, not talked out of it.' },
      ),
      decision(
        'Washington reads the reports, alarmed. What lesson do leaders draw?',
        { label: 'The Articles need only small patches.',
          v: V.W, fx: { trust: -5 },
          fb: 'Amending the Articles needed all 13 states to agree — even small patches were nearly impossible.' },
        { label: 'The nation needs a government strong enough to keep order, enforce laws, and pay its own way.',
          v: V.R, fx: { trust: 5 },
          fb: 'The definitive signal. Next stop: Philadelphia, 1787.' },
        { label: "Rebellions can't happen in a republic.",
          v: V.W, fx: {},
          fb: 'One just did. Pretending it could not happen again would not have made it true.' },
      ),
    ],
  },

  // ===== ROUND 2 — 1794, the Constitution ("PRESIDENT OF THE UNITED STATES") =====

  // ----- Phase 4: Revenue and Backlash -----
  {
    title: 'Revenue and Backlash',
    date: '1791–94 · Pennsylvania',
    image: 'scene_whiskey_tax.webp',
    event: 'War debts must be paid. This time, the Constitution gives the government real tools to raise money — and to answer when people push back.',
    steps: [
      decision(
        '1791: war debts must be paid. Under the Constitution, how does the nation raise money?',
        { label: 'Congress passes a tax — an excise tax on whiskey.',
          v: V.R, fx: { money: 10 },
          fb: 'The power to tax, used at last. It works — and causes our next problem.' },
        { label: 'Beg the states, like old times.',
          v: V.W, fx: { money: -5 },
          fb: 'That was the old machine. The new one taxes people directly.' },
        { label: 'Only states may tax; the nation borrows instead.',
          v: V.W, fx: {},
          fb: 'Backwards — the taxing power was the whole repair the Constitution made.' },
      ),
      decision(
        'Pennsylvania farmers — who use whiskey like cash — attack the tax collectors, 1794. Who answers, under what authority?',
        { label: "President Washington, using the Constitution's executive power.",
          v: V.R, fx: { trust: 10 },
          fb: "An executive exists now, and enforcing the law is his job." },
        { label: "Nobody — there's no executive to answer.",
          v: V.W, fx: { trust: -5 },
          fb: 'That was 1786. The repair added a President.' },
        { label: 'Massachusetts handles it again.',
          v: V.W, fx: {},
          fb: "Not a state's job anymore — and not even the same state." },
      ),
    ],
  },

  // ----- Phase 5: The March -----
  {
    title: 'The March',
    date: '1794 · Western Pennsylvania',
    image: 'scene_whiskey_ride.webp',
    event: 'The tax collectors are under attack. This time the government has money, an executive, and an army to send.',
    steps: [
      decision(
        'How does the government field an army this time?',
        { label: 'Washington calls up nearly 13,000 militiamen under federal authority.',
          v: V.R, fx: { order: 10, money: -5 },
          fb: 'Funded by real revenue, summoned by real authority — not hope.' },
        { label: 'Send requests to the states and hope.',
          v: V.W, fx: {},
          fb: "Hope was the old system's whole budget. Not anymore." },
        { label: 'Hire foreign troops.',
          v: V.W, fx: { trust: -10 },
          fb: 'This never happened — imagine the message that would send.' },
      ),
      decision(
        "Washington personally rides at the column's head — a sitting President leading troops. What happens out west?",
        { label: 'The rebellion collapses quickly, almost without a shot.',
          v: V.R, fx: { order: 10, trust: 5 },
          fb: 'The show of lawful force was enough — there was almost no fighting at all.' },
        { label: 'Years of bloody civil war follow.',
          v: V.W, fx: { order: -10 },
          fb: 'No — the whole point is how fast it ended, not how long it dragged on.' },
        { label: 'The army defects to the rebels.',
          v: V.W, fx: {},
          fb: 'The militiamen answered a lawful call, and it held.' },
      ),
    ],
  },

  // ----- Phase 6: The Meaning -----
  {
    title: 'The Meaning',
    date: '1794 · Western Pennsylvania',
    image: 'scene_whiskey_ride.webp',
    event: 'The rebellion is over almost before it began. Now the nation has to say what that proved.',
    steps: [
      decision(
        "What did the government's response prove about the Constitution?",
        { label: 'The federal government can enforce its laws and keep order.',
          v: V.R, fx: { trust: 10 },
          fb: 'Demonstration complete: the new machine runs.' },
        { label: 'The President can do anything he wants.',
          v: V.W, fx: { trust: -5 },
          fb: 'No — he used listed powers, within the law. Limited government still applies.' },
        { label: 'Taxes will never be resisted again.',
          v: V.W, fx: {},
          fb: 'Americans arguing about taxes never really stopped.' },
      ),
      decision(
        'Same desk, two rebellions, opposite endings. Why?',
        { label: 'The Constitution added what the Articles lacked: the power to tax, an executive, and real authority.',
          v: V.R, fx: { trust: 10 },
          fb: 'The whole tale of two governments — say it just like that on the test.' },
        { label: 'Luck — the weather favored Washington.',
          v: V.W, fx: {},
          fb: 'Structure, not weather, made the difference.' },
        { label: "The whiskey farmers were weaker than Shays' men.",
          v: V.W, fx: { order: -5 },
          fb: 'Both groups were farmers with real grievances. What changed was the government, not the farmers.' },
      ),
    ],
  },
];

// ---------------------------------------------------------------------------
// Assembly. The engine groups steps into "chapters" of two; here a chapter IS
// one of the six phases above. `event` is the phase's brief framing card;
// `image`/`title`/`date` ride along for the client. No `eventEffects` — the
// scripted drift (spec §3) lives entirely in each choice's own effects, so
// there is no extra passive toll (the adapter stays flat, spec §6, §8).
// ---------------------------------------------------------------------------

export function phasesFor() {
  return PHASES.map((p) => ({
    title: p.title,
    date: p.date,
    image: p.image,
    event: p.event,
    eventEffects: null,
    steps: p.steps,
  }));
}

// ---------------------------------------------------------------------------
// Endings tier by ACCURACY (spec §3 — unlike Washington's War's meter-sum
// tiering, this game's grade decides the ending). Same three tiers regardless
// of which round the student is stronger in — accuracy is earned across both.
// ---------------------------------------------------------------------------

export const CHIEF_MIN = 83;  // "Chief Historian"
export const CLERK_MIN = 50;  // "Junior Clerk"; below this is "Back to the Archives"

export const ENDINGS = {
  chief: {
    key: 'chief',
    title: 'Chief Historian',
    text: "You called it correctly, both times. Under the Articles, you knew every lever would fail before you pulled it — no tax power, no army, no executive, no courts. Under the Constitution, you knew exactly which new power to reach for, and it worked. That is the whole tale of two governments, and you can explain why.",
  },
  clerk: {
    key: 'clerk',
    title: 'Junior Clerk',
    text: 'You got the shape of it — some of the Articles\' failures, some of the Constitution\'s real powers — but a few calls went the other way. Look back at the misses: a government either has a power or it does not, and there is no third option to reach for.',
  },
  archives: {
    key: 'archives',
    title: 'Back to the Archives',
    text: 'Too many orders here belonged to the wrong government — reaching for a tax, a President, or a court that did not exist yet in 1786, or doubting powers the Constitution genuinely gave in 1794. Back to the record books: what could each government actually do?',
  },
};

export function endingFor(_score, accuracy) {
  if (accuracy >= CHIEF_MIN) return ENDINGS.chief;
  if (accuracy >= CLERK_MIN) return ENDINGS.clerk;
  return ENDINGS.archives;
}

// The report's "score" — the three meters added (max 300). Informational only;
// it never decides the ending tier here (accuracy does, spec §3).
export function meterScore(meters) {
  return (meters.order || 0) + (meters.money || 0) + (meters.trust || 0);
}

// ---------------------------------------------------------------------------
// The debrief (spec §4, §10 checklist) — same truth under every tier: the
// Constitution is what changed, not the people or their grievances.
// ---------------------------------------------------------------------------

export const DEBRIEF =
  'Here is why the two rebellions ended so differently. Shays\' Rebellion and the Whiskey Rebellion were led by the same kind of people — ordinary farmers with real grievances, some of them Revolutionary War veterans. The government they faced is what changed. ' +
  'In 1786, Congress under the Articles of Confederation could not tax, could not enforce a law, had no President, and no national courts — so it could not respond to Shays\' men at all. Massachusetts had to save itself. That humiliation is the clearest reason the Constitutional Convention met in Philadelphia in 1787. ' +
  'In 1794, the same kind of uprising met a government with a tax power, an executive, and federal courts. President Washington enforced the law himself, and the Whiskey Rebellion collapsed almost without a shot. ' +
  'Same nation, same kind of trouble. The difference was the Constitution.';

export function debriefFor() {
  return DEBRIEF;
}

// ---------------------------------------------------------------------------

export default createStepGame({
  id: 'us-two-rebellions',
  title: 'Two Rebellions: A Tale of Two Governments',
  sides: [SIDE],                 // one class group — no pick
  modes: ['solo'],
  soloRival: false,              // you run the government alone — no AI rival
  startMeters: () => ({ ...START_METERS }),
  phasesFor,
  meta: { meters: METERS, vocab: VOCAB, desks: DESKS, comparison: COMPARISON },  // no map board
  scoreMeters: meterScore,
  endingFor,
  debriefFor,
});
