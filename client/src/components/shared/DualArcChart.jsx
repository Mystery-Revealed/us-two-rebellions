// DualArcChart.jsx — the ending's "money moment" (spec §5: "dual-arc meter
// chart (collapse, then recovery)"). One continuous line — the three meters
// added together, 0-300 — split into two colored arcs at the 1787 boundary:
// a sagging crimson arc for Round 1 (the Articles), a rising green arc for
// Round 2 (the Constitution). Pure display; built entirely from the meter
// snapshots the client already received after every graded action (spec §6 —
// no engine change, nothing persisted server-side).

const W = 640;
const H = 200;
const PAD_X = 32;
const PAD_Y = 22;
const MAX_SCORE = 300;

function totalOf(pt) {
  return (pt.order || 0) + (pt.money || 0) + (pt.trust || 0);
}

export default function DualArcChart({ history }) {
  if (!history || history.length < 2) return null;

  const n = history.length;
  const xAt = (i) => PAD_X + (i / (n - 1)) * (W - PAD_X * 2);
  const yAt = (score) => H - PAD_Y - (score / MAX_SCORE) * (H - PAD_Y * 2);

  const points = history.map((h, i) => ({ x: xAt(i), y: yAt(totalOf(h)), step: h.step, score: totalOf(h) }));

  // The split is right after the sixth graded action (step index 5, 0-based —
  // the end of Round 1). Fall back to the midpoint if a reconnect ever left
  // history shorter than a full run.
  let splitPos = points.findIndex((p) => p.step === 5);
  splitPos = splitPos >= 0 ? splitPos + 1 : Math.min(6, points.length - 1);

  const seg1 = points.slice(0, splitPos + 1);
  const seg2 = points.slice(splitPos);
  const toPath = (arr) => arr.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const startScore = Math.round(points[0].score);
  const midScore = Math.round(points[splitPos].score);
  const endScore = Math.round(points[points.length - 1].score);
  const splitX = points[splitPos].x;

  return (
    <div className="arc-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="arc-chart" role="img" aria-label={`Government strength: started at ${startScore}, fell to ${midScore} by 1787, ended at ${endScore}`}>
        <line x1={PAD_X} y1={yAt(150)} x2={W - PAD_X} y2={yAt(150)} className="arc-gridline" />
        <line x1={splitX} y1={PAD_Y - 6} x2={splitX} y2={H - PAD_Y + 6} className="arc-split-line" />
        <text x={splitX} y={PAD_Y - 10} textAnchor="middle" className="arc-split-label">1787</text>

        <path d={toPath(seg1)} className="arc-path arc-collapse" fill="none" />
        <path d={toPath(seg2)} className="arc-path arc-recover" fill="none" />

        <circle cx={points[0].x} cy={points[0].y} r="5" className="arc-dot start" />
        <circle cx={points[splitPos].x} cy={points[splitPos].y} r="5" className="arc-dot mid" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" className="arc-dot end" />
      </svg>
      <div className="arc-legend">
        <span className="arc-legend-item"><span className="swatch collapse" /> Round 1 · Articles — {startScore} → {midScore}</span>
        <span className="arc-legend-item"><span className="swatch recover" /> Round 2 · Constitution — {midScore} → {endScore}</span>
      </div>
    </div>
  );
}
