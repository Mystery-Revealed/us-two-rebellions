// Desk.jsx — the student game. A small state machine over socket pushes:
// title → how to play → join (no pick — one "Take the Desk" button) → (approval)
// → briefing → match (6 phases, 12 decisions across two rounds, one client-only
// interlude between them) → result. Single role, no pick, no branch: everyone
// runs the same national government through the same two rebellions. The
// server owns all truth; this component only renders what it's told, plus one
// purely client-side thing the server never sees — the interlude screen and
// the running meter history used for the ending's dual-arc chart (spec §6).

import { useEffect, useReducer, useRef } from 'react';
import { getSocket, emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import VocabText from './VocabText.jsx';
import MatchView from './MatchView.jsx';
import ResultScreen from './ResultScreen.jsx';

const SIDE = 'class';
// The chapter index (0-based) at which Round 2 begins — three phases per round.
const ROUND2_STARTS_AT = 3;

const initialState = {
  screen: 'title', // title | how | join | waiting_approval | briefing | match | result | ended
  joinCode: '',
  name: '',
  studentId: null,
  error: '',
  endedMessage: '',
  match: null,
  matchEnd: null,
  interludeSeen: false,
};

function freshMatch(begin) {
  return {
    begin,
    meters: begin.meters,
    eventCard: null,
    pendingEventCard: null,
    turn: null,
    feedback: null,
    // The running score (sum of the three meters) at match start, then after
    // every resolved decision — purely client-side, used only by the ending's
    // dual-arc chart. Never sent anywhere; never touches scoring.
    meterHistory: [{ step: -1, ...begin.meters }],
  };
}

// Merge live payloads (chapter:event, turn:begin, turn:resolution) into the match.
function mergeLive(match, payload) {
  const next = { ...match };
  if (payload.meters) next.meters = payload.meters;
  return next;
}

function pushHistory(history, step, meters) {
  if (!meters) return history;
  const last = history[history.length - 1];
  const entry = { step, ...meters };
  if (last && last.step === step) return [...history.slice(0, -1), entry];
  return [...history, entry];
}

function reducer(state, action) {
  switch (action.type) {
    case 'ui':
      return { ...state, ...action.patch };
    case 'joined':
      return {
        ...state,
        studentId: action.studentId,
        error: '',
        screen: action.approved ? 'briefing' : 'waiting_approval',
      };
    case 'approved':
      return { ...state, screen: state.screen === 'waiting_approval' ? 'briefing' : state.screen };
    case 'match:begin':
      return { ...state, screen: 'match', matchEnd: null, interludeSeen: false, match: freshMatch(action.payload) };
    case 'chapter:event': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      const isRound2Start = action.payload.chapter.index === ROUND2_STARTS_AT;
      // Gate the interlude on CLIENT dismissal, not server arrival (the server
      // pushes chapter:event chapter-eagerly) — show it exactly once, right
      // before the Round 2 desk plate first appears (spec §4, §6).
      if (isRound2Start && !state.interludeSeen) {
        return { ...state, match: { ...match, pendingEventCard: action.payload, eventCard: null } };
      }
      return { ...state, match: { ...match, eventCard: action.payload } };
    }
    case 'turn:begin': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, turn: action.payload } };
    }
    case 'turn:resolution': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      const meterHistory = pushHistory(match.meterHistory, action.payload.stepIndex, action.payload.meters);
      return { ...state, match: { ...match, feedback: action.payload, meterHistory } };
    }
    case 'interlude-done': {
      if (!state.match) return { ...state, interludeSeen: true };
      const pending = state.match.pendingEventCard;
      return {
        ...state,
        interludeSeen: true,
        match: { ...state.match, eventCard: pending, pendingEventCard: null },
      };
    }
    case 'match:end': {
      // Hold the result until the pending feedback (and any interlude) is
      // dismissed (chronological).
      const showNow = !state.match?.feedback && !state.match?.pendingEventCard;
      return { ...state, matchEnd: action.payload, screen: showNow ? 'result' : state.screen };
    }
    case 'dismiss-feedback': {
      if (!state.match) return state;
      if (state.matchEnd && !state.match.pendingEventCard) return { ...state, screen: 'result', match: { ...state.match, feedback: null } };
      return { ...state, match: { ...state.match, feedback: null } };
    }
    case 'dismiss-event':
      return state.match ? { ...state, match: { ...state.match, eventCard: null } } : state;
    case 'sync': {
      const s = action.sync;
      if (s.screen === 'waiting_approval') return { ...state, screen: 'waiting_approval' };
      if (s.screen === 'lobby') return { ...state, screen: 'briefing' };
      if (s.screen === 'result') return { ...state, screen: 'result', matchEnd: s.matchEnd };
      if (s.screen === 'match') {
        const match = freshMatch(s.matchBegin);
        const idx = s.chapterEvent?.chapter?.index ?? s.turn?.chapter?.index ?? 0;
        // Skip-safe on rejoin (build checklist): if they're already past the
        // Round 2 boundary, don't replay the interlude.
        const interludeSeen = idx > ROUND2_STARTS_AT || (idx === ROUND2_STARTS_AT && !s.chapterEvent);
        return {
          ...state,
          screen: 'match',
          matchEnd: null,
          interludeSeen,
          match: { ...match, eventCard: s.chapterEvent, turn: s.turn },
        };
      }
      return state;
    }
    case 'removed':
      return { ...initialState, screen: 'join', joinCode: state.joinCode, name: '', error: 'Your teacher removed you from the session. You can join again.' };
    case 'ended':
      return { ...initialState, screen: 'ended', endedMessage: 'Your teacher ended this session. The record is closed.' };
    case 'play-again':
      return { ...initialState, screen: 'join', joinCode: state.joinCode, name: state.name };
    default:
      return state;
  }
}

export default function Desk() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const socket = getSocket();
    const on = (event, type) => {
      const fn = (payload) => dispatch({ type, payload });
      socket.on(event, fn);
      return [event, fn];
    };
    const subs = [
      on('match:begin', 'match:begin'),
      on('chapter:event', 'chapter:event'),
      on('turn:begin', 'turn:begin'),
      on('turn:resolution', 'turn:resolution'),
      on('match:end', 'match:end'),
    ];
    const approved = () => dispatch({ type: 'approved' });
    const removed = () => dispatch({ type: 'removed' });
    const ended = () => dispatch({ type: 'ended' });
    socket.on('join:approved', approved);
    socket.on('student:removed', removed);
    socket.on('session:ended', ended);

    // School wifi blip: the socket reconnects → re-attach and re-sync the screen.
    const onReconnect = async () => {
      const s = stateRef.current;
      if (!s.studentId || !s.joinCode) return;
      const res = await emitAck('student:rejoin', { joinCode: s.joinCode, studentId: s.studentId });
      if (res.ok) dispatch({ type: 'sync', sync: res.sync });
    };
    socket.io.on('reconnect', onReconnect);

    return () => {
      for (const [event, fn] of subs) socket.off(event, fn);
      socket.off('join:approved', approved);
      socket.off('student:removed', removed);
      socket.off('session:ended', ended);
      socket.io.off('reconnect', onReconnect);
    };
  }, []);

  const { screen } = state;
  return (
    <div className="app student-app">
      {screen === 'title' && <TitleScreen onStart={() => dispatch({ type: 'ui', patch: { screen: 'join' } })} onHow={() => dispatch({ type: 'ui', patch: { screen: 'how' } })} />}
      {screen === 'how' && <HowToPlay onBack={() => dispatch({ type: 'ui', patch: { screen: 'title' } })} />}
      {screen === 'join' && <JoinForm state={state} dispatch={dispatch} />}
      {screen === 'waiting_approval' && (
        <WaitCard title="Hold your position!" text="Your teacher is checking names. You take the desk in a moment." />
      )}
      {screen === 'briefing' && (
        <WaitCard
          title="You are about to run the national government."
          text="1786. Massachusetts farmers are marching. Your first order is being drawn up — stand ready."
        />
      )}
      {screen === 'match' && state.match && <MatchView state={state} dispatch={dispatch} />}
      {screen === 'result' && state.matchEnd && <ResultScreen state={state} dispatch={dispatch} />}
      {screen === 'ended' && (
        <WaitCard title="Session ended" text={state.endedMessage}>
          <button className="btn" onClick={() => dispatch({ type: 'ui', patch: { ...initialState, screen: 'title' } })}>
            Back to the title screen
          </button>
        </WaitCard>
      )}
      <footer className="app-footer">Made for 8th Grade U.S. History · TEKS 8.15B, 8.5A, 8.17B, 8.1A</footer>
    </div>
  );
}

/* ---------------- small screens ---------------- */

function TitleScreen({ onStart, onHow }) {
  return (
    <div className="card title-screen">
      <Art name="title_hero.webp" alt="The same government writing desk shown twice: dim candlelight on the left, steady lamplight on the right" className="hero-art" />
      <h1 className="game-title">Two Rebellions</h1>
      <p className="tagline">A Tale of Two Governments</p>
      <p className="title-blurb">
        Run the national government <b>twice</b>. First in <b>1786</b>, against
        Shays' Rebellion — under the Articles of Confederation, every order you
        give <b>fails</b>. Then in <b>1794</b>, against the Whiskey Rebellion —
        under the Constitution, the very same kind of order <b>works</b>. Same
        nation, same kind of trouble. You find out why the difference was the
        Constitution.
      </p>
      <div className="btn-col">
        <button className="btn big" onClick={onStart}>Join your class</button>
        <button className="btn secondary" onClick={onHow}>How to play</button>
      </div>
    </div>
  );
}

function HowToPlay({ onBack }) {
  return (
    <div className="card how-screen">
      <h2>How to play</h2>
      <ol className="how-list">
        <li><b>Join with your class code</b> and your first name.</li>
        <li><b>Round 1, 1786:</b> six orders against Shays' Rebellion, as Congress under the Articles. Nothing you pick can truly fix it — pick the move that <b>predicts what really happened</b>.</li>
        <li><b>1787 interlude:</b> the Constitution rebuilds the desk with new levers — a tax power, a President, federal courts.</li>
        <li><b>Round 2, 1794:</b> six orders against the Whiskey Rebellion, as President under the Constitution. This time the right lever actually works.</li>
        <li><b>Your grade is accuracy</b> — twelve orders, one real answer each — not whether the meters go up.</li>
      </ol>
      <div className="note">
        <b>Winning versus accuracy.</b> Round 1 is <b>built to be lost</b> on the
        meters — even your best order still costs something, because the real
        government had almost no power. Your grade never depends on the meters:
        it depends on whether you picked the move that actually happened.
      </div>
      <h3>Your three meters</h3>
      <ul className="how-list">
        <li>⚖️ <b>Order</b> — the public peace.</li>
        <li>💰 <b>Money</b> — the treasury.</li>
        <li>🏛️ <b>Trust</b> — faith in the government.</li>
      </ul>
      <h3>Words to know (tap them in the game)</h3>
      <ul className="how-list vocab-list">
        <li><VocabText text="Armory — where weapons are stored." /></li>
        <li><VocabText text="Excise tax — a tax on making or selling a product." /></li>
        <li><VocabText text="Militia — citizens called up as emergency soldiers." /></li>
        <li><VocabText text="Foreclosure — losing your farm over unpaid debt." /></li>
        <li><VocabText text="Enforce — make people follow a law." /></li>
      </ul>
      <button className="btn" onClick={onBack}>Back</button>
    </div>
  );
}

function JoinForm({ state, dispatch }) {
  const set = (patch) => dispatch({ type: 'ui', patch });
  const busyRef = useRef(false);

  async function join() {
    if (busyRef.current) return;
    busyRef.current = true;
    set({ error: '' });
    const res = await emitAck('student:join', {
      joinCode: state.joinCode.trim(),
      nickname: state.name.trim(),
      mode: 'solo',
      nation: SIDE,
    });
    busyRef.current = false;
    if (!res.ok) return set({ error: errorText(res.error) });
    dispatch({ type: 'joined', studentId: res.studentId, approved: res.approved });
  }

  const ready = state.joinCode.length === 6 && state.name.trim().length >= 2;

  return (
    <div className="card join-screen">
      <h2>Join your class</h2>
      <p className="muted">It's 1786. You are about to take the national government's desk.</p>
      <label htmlFor="join-code">Class code</label>
      <input
        id="join-code" inputMode="numeric" autoComplete="off" maxLength={6}
        placeholder="6-digit code" value={state.joinCode}
        onChange={(e) => set({ joinCode: e.target.value.replace(/\D/g, '') })}
      />
      <label htmlFor="join-name">Your first name</label>
      <input
        id="join-name" maxLength={20} placeholder="e.g. Ana R." value={state.name}
        onChange={(e) => set({ name: e.target.value })}
      />

      <p className="err" role="alert">{state.error}</p>
      <div className="btn-col">
        <button className="btn big" disabled={!ready} onClick={join}>Take the desk</button>
        <button className="btn ghost" onClick={() => set({ screen: 'title', error: '' })}>Back</button>
      </div>
    </div>
  );
}

function WaitCard({ title, text, children }) {
  return (
    <div className="card wait-card">
      <div className="pulse-dot" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}

export { ROUND2_STARTS_AT };
