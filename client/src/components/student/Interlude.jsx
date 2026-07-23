// Interlude.jsx — the 1787 card (spec §4, §5, §6): a client-only, UNGRADED
// screen between step 6 and step 7. The engine never sees it — Desk.jsx gates
// it purely on local dismissal state (`interludeSeen`), so a rejoin mid-game
// skips it cleanly if the student already passed this point (build checklist).
//
// The "money moment" (spec §5): the SAME navy console rebuilds itself in a
// ~4-second animation as three new levers slot in — Tax · Executive · Courts —
// the exact three powers Round 1 proved were missing. Purely decorative;
// nothing here is graded. A Skip control and a reduced-motion fallback both
// just reveal the three levers immediately and enable Continue.

import { useEffect, useRef, useState } from 'react';
import { Art } from '../../services/assets.jsx';

const NEW_LEVERS = ['Tax', 'Executive', 'Courts'];
const BUILD_MS = 4000;

export default function Interlude({ onContinue }) {
  const [built, setBuilt] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => { doneRef.current = true; setBuilt(true); }, BUILD_MS);
    return () => clearTimeout(t);
  }, []);

  function skip() {
    if (doneRef.current) return;
    doneRef.current = true;
    setBuilt(true);
  }

  return (
    <div className="interlude-card">
      <div className="event-kicker">1787 · Philadelphia</div>
      <Art
        name="scene_independence_hall.webp"
        alt="Independence Hall glowing at dusk, delegates' silhouettes in the lit windows"
        className="event-art"
      />
      <p className="event-text">
        Delegates gather in Philadelphia to build a new machine of government:
        the power to tax, a President, federal courts. The desk gets new
        levers. Let's test them.
      </p>

      <div className={`console-rebuild ${built ? 'built' : 'building'}`} aria-hidden="true">
        <div className="rebuild-frame">
          {NEW_LEVERS.map((label, i) => (
            <div key={label} className="rebuild-lever" style={{ transitionDelay: `${i * 0.5 + 0.3}s` }}>
              <span className="lever-shaft"><span className="lever-handle" /></span>
              <span className="rebuild-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {!built && (
        <button type="button" className="btn ghost skip" onClick={skip}>Skip</button>
      )}
      <button className="btn big" disabled={!built} onClick={onContinue}>
        {built ? 'Take the new desk' : 'Building the new machine…'}
      </button>
    </div>
  );
}
