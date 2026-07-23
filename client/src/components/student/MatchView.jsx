// MatchView.jsx — one phase at a time: a framing card sets the scene → the
// lever console asks for two orders → each gets a verdict flash and feedback.
// Single role, no pick, no branch: every student runs the same government
// through the same six phases (spec §3, §5, §6).
//
// THE CONSOLE (spec §5, §8 — the one genuinely novel client piece here): the
// three choices render as brass levers on a navy panel. In Round 1 every pull
// visibly JAMS — a crimson "NO POWER" stamp — because the Articles government
// could not act, no matter which lever a student reached for. In Round 2 the
// same console's levers actually ENGAGE (green) on the historically right
// pull. This is pure client theatre keyed off the round; it never touches
// scoring — the server's verdict already decided the grade.
//
// THE DWELL (non-obvious): the server batches this move's turn:resolution
// together with the NEXT turn:begin (and, at the round boundary, the
// interlude-triggering chapter:event) in one push — same chapter-eager
// pattern as the other engine games. Naively swapping to FeedbackPanel or the
// Interlude the instant those arrive would skip the jam/engage animation
// entirely; it would never be visible. MatchView freezes a snapshot of the
// just-answered turn (`pulledTurn`) for a minimum dwell so the lever's own
// animation always gets its moment before anything else takes over.
//
// The INTERLUDE (spec §4, §6) is a client-only screen inserted between step 6
// and step 7 — a 4-second console-rebuild animation. The engine never sees it;
// Desk.jsx gates it on local dismissal state, not on server arrival.

import { useEffect, useRef, useState } from 'react';
import { emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import MetersBar from '../shared/MetersBar.jsx';
import VocabText from './VocabText.jsx';
import Interlude from './Interlude.jsx';
import { ROUND2_STARTS_AT } from './Desk.jsx';

// Long enough for the full pull + stamp + jam-shake to play (the shake ends at
// ~1.05s — see styles.css jamShake: 0.25s delay + 2 × 0.4s iterations).
const LEVER_DWELL_MS = 1100;

export default function MatchView({ state, dispatch }) {
  const { match } = state;
  const { begin, eventCard, pendingEventCard, turn, feedback } = match;
  const meta = begin.meta;

  // While a lever is mid-animation, hold on the ANSWERED turn — not whatever
  // the server has already advanced `turn`/`feedback`/`pendingEventCard` to.
  const [pulledTurn, setPulledTurn] = useState(null);
  const dwellTimer = useRef(null);
  useEffect(() => () => clearTimeout(dwellTimer.current), []);

  function handlePulled() {
    setPulledTurn(turn);
    clearTimeout(dwellTimer.current);
    dwellTimer.current = setTimeout(() => setPulledTurn(null), LEVER_DWELL_MS);
  }
  function handlePullFailed() {
    clearTimeout(dwellTimer.current);
    setPulledTurn(null);
  }

  // While the interlude is pending, `turn` has already silently advanced to
  // Round 2's first prompt (the batching described above) — so the header
  // must NOT read off `turn` here, or the desk plate would flip to
  // "PRESIDENT OF THE UNITED STATES" while the 1787 interlude card is still
  // asking the student to sit through the handoff. Freeze it at Round 1's
  // last phase until the interlude is actually dismissed.
  // Beyond the round boundary (handled below via pendingEventCard), the SAME
  // batching means eventCard/turn race ahead at every phase's last decision
  // too — pin the header to the last phase seen before feedback started so
  // it doesn't jump a beat early.
  const settledChapterRef = useRef(null);
  if (!feedback) settledChapterRef.current = eventCard?.chapter || turn?.chapter || settledChapterRef.current;
  const settledChapter = feedback ? (settledChapterRef.current || eventCard?.chapter || turn?.chapter) : (eventCard?.chapter || turn?.chapter);

  const chapterIdx = pendingEventCard
    ? ROUND2_STARTS_AT - 1
    : (settledChapter?.index ?? 0);
  const round = chapterIdx < ROUND2_STARTS_AT ? 1 : 2;
  const phaseInRound = (chapterIdx % ROUND2_STARTS_AT) + 1;
  const desk = meta.desks?.[round - 1] || '';
  // No chip during the interlude — its own "1787 · Philadelphia" kicker is
  // the label; the real Round 2 phase info reveals once it's dismissed.
  const phase = pendingEventCard ? null : settledChapter;

  const lowMeter = Object.entries(match.meters || {}).find(([, v]) => v <= 15);

  return (
    <div className={`match round-${round}`}>
      <header className="match-header">
        <div className={`desk-plate round-${round}`}>{desk}</div>
        {phase && (
          <div className="chapter-chip">
            Round {round} of 2 · Phase {phaseInRound} of 3 · {phase.date}
          </div>
        )}
      </header>

      <div className="meters-row solo">
        <MetersBar meters={match.meters} meta={meta} title="Order · Money · Trust" />
      </div>

      {lowMeter && !feedback && !pendingEventCard && (
        <div className="banner danger" role="alert">
          ⚠️ Your {meta.meters[lowMeter[0]]?.name || lowMeter[0]} is running very low.
        </div>
      )}

      <div className="match-body single">
        <section className="action-panel" aria-live="polite">
          {pulledTurn ? (
            <LeverConsole turn={pulledTurn} round={round} frozen onPulled={handlePulled} onPullFailed={handlePullFailed} />
          ) : feedback ? (
            <FeedbackPanel
              feedback={feedback}
              meta={meta}
              round={round}
              matchEnded={!!state.matchEnd}
              onContinue={() => dispatch({ type: 'dismiss-feedback' })}
            />
          ) : pendingEventCard ? (
            <Interlude onContinue={() => dispatch({ type: 'interlude-done' })} />
          ) : eventCard ? (
            <SituationCard eventCard={eventCard} onContinue={() => dispatch({ type: 'dismiss-event' })} />
          ) : turn?.yourTurn && turn.kind === 'decision' ? (
            <LeverConsole turn={turn} round={round} onPulled={handlePulled} onPullFailed={handlePullFailed} />
          ) : (
            <div className="waiting-panel"><div className="pulse-dot" aria-hidden="true" /><p>Steady…</p></div>
          )}
        </section>
      </div>
    </div>
  );
}

/* -------- panels -------- */

function SituationCard({ eventCard, onContinue }) {
  const ch = eventCard.chapter;
  return (
    <div className="event-card">
      <div className="event-kicker">{ch.title}</div>
      <Art name={ch.image} alt={ch.title} className="event-art" />
      <p className="event-text"><VocabText text={eventCard.text} /></p>
      <button className="btn big" onClick={onContinue}>Take your orders</button>
    </div>
  );
}

/* -------- the lever console (spec §5, §8) -------- */

const LEVER_STATE = { idle: 'idle', pulled: 'pulled', jam: 'jam', engage: 'engage' };

function LeverConsole({ turn, round, frozen = false, onPulled, onPullFailed }) {
  const [busy, setBusy] = useState(frozen);
  const [pulledIndex, setPulledIndex] = useState(null);
  const [leverPhase, setLeverPhase] = useState(LEVER_STATE.idle);
  // Synchronous double-click lock — see [[double-submit-race-fix]]: the server
  // acks BEFORE pushing turn:resolution, so two same-frame clicks both read a
  // stale `busy === false`. The ref engages immediately; `busy` still drives
  // the disabled styling.
  const busyRef = useRef(false);
  const [err, setErr] = useState('');

  // A genuinely NEW question (not just the parent re-passing the same one
  // while frozen) resets the console. `frozen` consoles are never re-keyed
  // mid-dwell — the parent holds the same `turn` object throughout.
  useEffect(() => {
    if (frozen) return;
    busyRef.current = false;
    setBusy(false);
    setPulledIndex(null);
    setLeverPhase(LEVER_STATE.idle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn.stepIndex]);

  async function pull(choiceIndex) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setPulledIndex(choiceIndex);
    setLeverPhase(LEVER_STATE.pulled);
    const res = await emitAck('student:submit_move', { move: { kind: 'decision', choiceIndex } });
    if (!res.ok) {
      setErr(errorText(res.error));
      busyRef.current = false;
      setBusy(false);
      setLeverPhase(LEVER_STATE.idle);
      setPulledIndex(null);
      onPullFailed?.();
      return;
    }
    // Round 1: the government has no power yet — EVERY lever jams, regardless
    // of which one was pulled (spec §1, §5). Round 2: the machinery works —
    // the crisp right/wrong verdict itself arrives with the feedback panel
    // right after this dwell.
    setLeverPhase(round === 1 ? LEVER_STATE.jam : LEVER_STATE.engage);
    onPulled?.();
  }

  return (
    <div className="lever-console">
      <h2 className="console-heading">Pull a lever to give your order</h2>
      <p className="prompt"><VocabText text={turn.prompt} /></p>
      <div className="console-panel">
        {(turn.choices || []).map((label, i) => {
          const isPulled = pulledIndex === i;
          const cls = [
            'lever',
            isPulled && leverPhase === LEVER_STATE.pulled ? 'pulling' : '',
            isPulled && leverPhase === LEVER_STATE.jam ? 'jammed' : '',
            isPulled && leverPhase === LEVER_STATE.engage ? 'engaged' : '',
          ].filter(Boolean).join(' ');
          return (
            <button key={i} type="button" className={cls} disabled={busy} onClick={() => pull(i)}>
              <span className="lever-shaft" aria-hidden="true">
                <span className="lever-handle" aria-hidden="true" />
              </span>
              <span className="lever-label">{label}</span>
              {isPulled && leverPhase === LEVER_STATE.jam && <span className="lever-stamp jam-stamp">NO POWER</span>}
              {isPulled && leverPhase === LEVER_STATE.engage && <span className="lever-stamp engage-stamp">ENGAGED</span>}
            </button>
          );
        })}
      </div>
      <p className="err" role="alert">{err}</p>
    </div>
  );
}

const VERDICT_UI = {
  right: { label: 'The real move', className: 'right', icon: '✓' },
  partial: { label: 'A half-measure', className: 'partial', icon: '≈' },
  wrong: { label: "That's not what happened", className: 'wrong', icon: '✗' },
};

function FeedbackPanel({ feedback, meta, round, matchEnded, onContinue }) {
  const v = VERDICT_UI[feedback.verdict] || VERDICT_UI.partial;
  return (
    <div className="feedback-panel">
      <div className={`verdict-badge ${v.className} flash`}>
        <span aria-hidden="true">{v.icon}</span> {v.label}
      </div>
      <p className="feedback-text"><VocabText text={feedback.feedback} /></p>
      <div className="effects-row">
        {Object.entries(feedback.effects || {}).map(([k, val]) => (
          <span key={k} className={`effect-chip ${val > 0 ? 'up' : 'down'}`}>
            {meta.meters[k]?.name} {val > 0 ? `+${val}` : val}
          </span>
        ))}
      </div>
      <button className="btn big" onClick={onContinue}>
        {matchEnded ? 'See how it ends' : 'Next order'}
      </button>
    </div>
  );
}
