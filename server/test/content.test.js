// content.test.js — structure, scoring-reachability, and sensitivity checks on
// Two Rebellions content. The core promises (spec §3, §4, §10): 6 phases × 2
// decisions = 12 graded actions with exactly one right answer each (so
// all-right = 100%); endings tiered by ACCURACY (not meter sum — unlike
// Washington's War); Round 1 rights still bleed meters (the scripted drift,
// spec §3) while Round 2 rights mostly repair them; every S2/S8, S5/S9-style
// mirrored beat lines up with the spec's answer key; and the five required
// vocabulary terms actually appear in student-visible text.
import test from 'node:test';
import assert from 'node:assert/strict';
import game, {
  METERS, START_METERS, PHASES, SIDE, VOCAB, DESKS, COMPARISON,
  phasesFor, meterScore, endingFor, debriefFor, ENDINGS, CHIEF_MIN, CLERK_MIN,
} from '../src/games/usTwoRebellions.js';

const stepsOf = () => phasesFor().flatMap((p) => p.steps);
const pointsFor = (v) => (v === 'right' ? 1 : v === 'partial' ? 0.5 : 0);

test('one class group, solo, no rival, three meters at 50, 12 actions, six phases', () => {
  assert.deepEqual(game.sides, ['class']);
  assert.equal(SIDE, 'class');
  assert.equal(game.soloRival, false, 'you run the government alone — no AI rival');
  assert.deepEqual(Object.keys(METERS), ['order', 'money', 'trust']);
  assert.deepEqual(START_METERS, { order: 50, money: 50, trust: 50 });
  assert.equal(game.meta.positions, undefined, 'no map board');
  assert.equal(game.totalActions, 12);
  assert.equal(game.chapterCount, 6, 'six phases, three per round');
});

test('six phases, each with a framing card and two decisions', () => {
  assert.equal(PHASES.length, 6);
  for (const [i, p] of PHASES.entries()) {
    assert.ok(p.title?.length > 2, `phase ${i} title`);
    assert.ok(p.event?.length > 20, `phase ${i} framing card`);
    assert.ok(p.image?.length > 4, `phase ${i} scene image`);
    assert.equal(p.steps.length, 2, `phase ${i}: two decisions`);
  }
});

test('no per-phase eventEffects — the scripted drift lives only in choice-level effects (spec §6, §8: flat adapter)', () => {
  for (const p of phasesFor()) assert.equal(p.eventEffects, null);
});

test('twelve decisions, each with three choices and all fields present', () => {
  const steps = stepsOf();
  assert.equal(steps.length, 12, 'twelve graded actions');
  for (const [i, s] of steps.entries()) {
    assert.equal(s.kind, 'decision', `decision ${i} is a decision`);
    assert.equal(s.choices.length, 3, `decision ${i}: three choices`);
    for (const ch of s.choices) {
      assert.ok(ch.label?.length > 5, `decision ${i} label`);
      assert.ok(['right', 'partial', 'wrong'].includes(ch.verdict), `decision ${i} verdict`);
      assert.ok(ch.feedback?.length > 10, `decision ${i} feedback`);
      assert.equal(typeof ch.effects, 'object', `decision ${i} effects object`);
    }
  }
});

test('exactly one right answer per decision (this is what makes 100% reachable)', () => {
  for (const [i, s] of stepsOf().entries()) {
    const rights = s.choices.filter((ch) => ch.verdict === 'right').length;
    assert.equal(rights, 1, `decision ${i}: exactly one right`);
  }
});

test('Round 1 (S1-S6): playing it perfectly still nets a loss overall (spec §3: "right loses less" — the arc sags even on right answers)', () => {
  const round1 = stepsOf().slice(0, 6);
  const totalNet = round1.reduce((sum, s) => {
    const right = s.choices.find((c) => c.verdict === 'right');
    return sum + Object.values(right.effects).reduce((a, b) => a + b, 0);
  }, 0);
  assert.ok(totalNet < 0, `Round 1's six right answers net a loss overall (got ${totalNet})`);
  // S6's right answer is the one deliberate exception: the correct "we need a
  // stronger government" realization is itself a trust-building moment, even
  // inside Round 1's losing arc (spec §4 S6 option B: trust +5).
  const s6Right = round1[5].choices.find((c) => c.verdict === 'right');
  assert.deepEqual(s6Right.effects, { trust: 5 });
});

test('Round 2 (S7-S12): every right answer nets a gain (spec §3: "Round 2 reverses the arc")', () => {
  const round2 = stepsOf().slice(6, 12);
  for (const [i, s] of round2.entries()) {
    const right = s.choices.find((c) => c.verdict === 'right');
    const vals = Object.values(right.effects);
    const net = vals.reduce((a, b) => a + b, 0);
    assert.ok(net > 0, `Round 2 decision ${i}: the right call nets a real gain (got ${net})`);
  }
});

test('the "no power yet" wrong options in Round 1 name the missing power (spec §2.2)', () => {
  const steps = stepsOf();
  assert.match(steps[0].choices.find((c) => /national tax/i.test(c.label)).feedback, /NO power to tax/i);
  assert.match(steps[1].choices.find((c) => /federalizes the militia/i.test(c.label)).feedback, /no executive/i);
  assert.match(steps[2].choices.find((c) => /federal court issues/i.test(c.label)).feedback, /no national courts/i);
});

test('key explicit meter effects match spec §4', () => {
  const steps = stepsOf();
  // S1 right — ask the states: money -5, trust -5
  assert.deepEqual(steps[0].choices.find((c) => c.verdict === 'right').effects, { money: -5, trust: -5 });
  // S5 right — Massachusetts raises its own force: order +5, trust -5
  assert.deepEqual(steps[4].choices.find((c) => c.verdict === 'right').effects, { order: 5, trust: -5 });
  // S7 right — the excise tax: money +10
  assert.deepEqual(steps[6].choices.find((c) => c.verdict === 'right').effects, { money: 10 });
  // S9 right — nearly 13,000 militiamen: order +10, money -5
  assert.deepEqual(steps[8].choices.find((c) => c.verdict === 'right').effects, { order: 10, money: -5 });
  // S10 right — collapses almost without a shot: order +10, trust +5
  assert.deepEqual(steps[9].choices.find((c) => c.verdict === 'right').effects, { order: 10, trust: 5 });
});

// --- Playthrough helpers: drive the adapter directly, honoring the shuffle ----
function playRun(pick = 'right') {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  for (let c = 0; c < game.totalActions; c++) {
    game.chapterEvent(state, SIDE);
    const ss = state.sides[SIDE];
    const step = stepsOf()[c];
    let real = step.choices.findIndex((ch) => ch.verdict === pick);
    if (real < 0) real = step.choices.findIndex((ch) => ch.verdict === 'partial');
    if (real < 0) real = 0;
    const choiceIndex = ss.shuffles[c].indexOf(real);
    const res = game.resolve(state, SIDE, { kind: 'decision', choiceIndex });
    assert.ok(!res.error, `decision ${c}: ${res.error}`);
  }
  return game.report(state).perSide[SIDE];
}

test('all-right = 100% accuracy and "Chief Historian"', () => {
  const r = playRun('right');
  assert.equal(r.accuracy, 100);
  assert.equal(r.ending.key, 'chief');
});

test('all-wrong = 0% accuracy and "Back to the Archives"', () => {
  const r = playRun('wrong');
  assert.equal(r.accuracy, 0);
  assert.equal(r.ending.key, 'archives');
});

test('endings tier by ACCURACY, not the meter sum (spec §3 — the opposite of Washington\'s War)', () => {
  assert.equal(endingFor(0, 100).key, 'chief');
  assert.equal(endingFor(0, CHIEF_MIN).key, 'chief');
  assert.equal(endingFor(0, CHIEF_MIN - 1).key, 'clerk');
  assert.equal(endingFor(0, CLERK_MIN).key, 'clerk');
  assert.equal(endingFor(0, CLERK_MIN - 1).key, 'archives');
  assert.equal(ENDINGS.chief.title, 'Chief Historian');
  assert.equal(ENDINGS.clerk.title, 'Junior Clerk');
  assert.equal(ENDINGS.archives.title, 'Back to the Archives');
});

test('a flawless run still visibly dips meters in Round 1 and recovers in Round 2 — the divergence is real, not just in feedback text', () => {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  const steps = stepsOf();
  const history = [];
  for (let c = 0; c < game.totalActions; c++) {
    game.chapterEvent(state, SIDE);
    const ss = state.sides[SIDE];
    const real = steps[c].choices.findIndex((x) => x.verdict === 'right');
    const ci = ss.shuffles[c].indexOf(real);
    const res = game.resolve(state, SIDE, { kind: 'decision', choiceIndex: ci });
    assert.ok(!res.error);
    history.push(meterScore(res.meters));
  }
  // Round 1 (indices 0-5): the running total never climbs above its start.
  const startTotal = meterScore(START_METERS);
  assert.ok(history[5] < startTotal, 'Round 1 ends below where it started, even played perfectly');
  // Round 2 (indices 6-11): by the end, the total has recovered above the Round-1 low.
  assert.ok(history[11] > history[5], 'Round 2 recovers meters above the Round 1 low point');
  const r = game.report(state).perSide[SIDE];
  assert.equal(r.accuracy, 100, 'the dip never touches the grade');
  assert.equal(r.ending.key, 'chief', 'a flawless run still earns the top tier on accuracy');
});

test('the mirrored beats (S2/S8 army lever, S5/S9 raising a force) land opposite results across rounds', () => {
  const steps = stepsOf();
  // S2 (index 1): Round 1 army lever — right answer is still a failure-shaped outcome (order drops).
  const s2Right = steps[1].choices.find((c) => c.verdict === 'right');
  assert.match(s2Right.label, /almost nothing arrives in time/i);
  assert.ok(Object.values(s2Right.effects).every((v) => v <= 0));
  // S9 (index 8): Round 2 army lever — right answer is a real mobilization that costs money but builds order.
  const s9Right = steps[8].choices.find((c) => c.verdict === 'right');
  assert.match(s9Right.label, /13,000 militiamen/i);
  assert.equal(s9Right.effects.order, 10);
});

test('all five vocabulary terms appear in student-visible text (spec §2.3 bubbles)', () => {
  const text = [
    ...PHASES.map((p) => p.event),
    ...stepsOf().flatMap((s) => [s.prompt, ...s.choices.map((c) => `${c.label} ${c.feedback}`)]),
  ].join(' ');
  assert.deepEqual(Object.keys(VOCAB), ['armory', 'excisetax', 'militia', 'foreclosure', 'enforce']);
  for (const re of [/armory/i, /excise tax/i, /militia/i, /foreclosure/i, /enforce/i]) {
    assert.match(text, re, `vocabulary term present: ${re}`);
  }
});

test('the desk plate names both governments (spec §5)', () => {
  assert.deepEqual(DESKS, ['CONGRESS OF THE CONFEDERATION', 'PRESIDENT OF THE UNITED STATES']);
});

test('the comparison table has one row per §2.1 fact and both governments named', () => {
  assert.equal(COMPARISON.length, 5);
  for (const row of COMPARISON) {
    assert.ok(row.label && row.shays && row.whiskey, `comparison row complete: ${row.label}`);
  }
  assert.match(COMPARISON[0].shays, /Articles/);
  assert.match(COMPARISON[0].whiskey, /Constitution/);
});

test('the debrief lands the same truth every tier: the Constitution is what changed (8.15B, 8.5A, 8.17B, 8.1A)', () => {
  const d = debriefFor();
  assert.match(d, /Constitution/);
  assert.match(d, /Shays/i);
  assert.match(d, /Whiskey/i);
  assert.match(d, /1787/);
});

test('currentPrompt never leaks the answer key (labels only)', () => {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  game.chapterEvent(state, SIDE);
  const prompt = game.currentPrompt(state, SIDE);
  assert.equal(prompt.kind, 'decision');
  assert.equal(prompt.choices.length, 3);
  for (const c of prompt.choices) assert.equal(typeof c, 'string');
  assert.ok(!('verdict' in prompt), 'no verdict leaks');
});

test('sensitivity: farmers on both sides are named as farmers with grievances, never a mob (spec §11)', () => {
  const text = stepsOf().flatMap((s) => [s.prompt, ...s.choices.map((c) => c.feedback)]).join(' ');
  assert.doesNotMatch(text, /\bmob\b/i);
  assert.match(text, /farmers/i);
});
