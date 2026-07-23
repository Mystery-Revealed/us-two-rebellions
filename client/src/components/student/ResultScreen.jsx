// ResultScreen.jsx — three things, in order (spec §3, §5): (1) the dual-arc
// chart — government strength collapsing under the Articles, then recovering
// under the Constitution; (2) the comparison table (spec §2.1) laid side by
// side; (3) the score that matters to your teacher — accuracy, whether your
// twelve orders were the ones each government actually gave — then the shared
// debrief: same nation, same trouble, the difference was the Constitution.

import { Art } from '../../services/assets.jsx';
import DualArcChart from '../shared/DualArcChart.jsx';

const TIER_CLASS = { chief: 'win', clerk: 'mid', archives: 'low' };

export default function ResultScreen({ state, dispatch }) {
  const end = state.matchEnd;
  const meta = end.meta || state.match?.begin?.meta;
  const you = end.you;
  const ending = you.ending;
  const tierCls = TIER_CLASS[ending.key] || 'mid';
  const comparison = meta?.comparison || [];
  const history = state.match?.meterHistory;

  return (
    <div className="card result-screen">
      <div className="event-kicker">The Record Closes</div>
      <h1 className={`result-headline ${tierCls}`}>{ending.title}</h1>

      <Art
        name="scene_ending.webp"
        alt="The same government desk at peace: a balanced ledger, a steady lamp, the Constitution standing in its stand"
        className="result-art"
      />

      <p className="fall-note">
        This was never about "winning" either rebellion — history settled both
        either way. It was about <b>whether your orders were the ones each
        government actually gave</b>. Your accuracy shows exactly that.
      </p>

      {history && (
        <div className="score-block" aria-label="Government strength over both rounds">
          <div className="score-head">
            <span className="score-title">Government Strength — Two Rounds</span>
          </div>
          <DualArcChart history={history} />
        </div>
      )}

      <div className="comparison-block">
        <h3>Same nation, two governments</h3>
        <div className="table-wrap">
          <table className="comparison-table">
            <thead>
              <tr><th></th><th>Shays' Rebellion · 1786</th><th>Whiskey Rebellion · 1794</th></tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.shays}</td>
                  <td>{row.whiskey}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`ending-block ${tierCls}`}>
        <p>{ending.text}</p>
      </div>

      <div className="accuracy-block">
        <div className="accuracy-number">{you.accuracy}%</div>
        <div>
          <b>Your accuracy — the score your teacher sees.</b>
          <p>How many of your twelve orders were the moves each government actually made or actually couldn't make. The meters were drama; this is the grade.</p>
        </div>
      </div>

      <div className="debrief">
        <h3>Why it worked out so differently</h3>
        <p>{you.debrief}</p>
      </div>

      <div className="btn-col">
        <button className="btn big" onClick={() => dispatch({ type: 'play-again' })}>
          Play again — run the government from the start
        </button>
      </div>
    </div>
  );
}
