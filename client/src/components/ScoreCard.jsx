import { useState } from 'react'
import './ScoreCard.css'

const BAND_COLORS = {
  'Need Attention': 'var(--red)',
  'Productivity': 'var(--yellow)',
  'Performance': 'var(--green)'
}

const BIAS_LABELS = {
  helpfulness_bias: 'Helpfulness bias detected',
  presence_bias: 'Presence bias detected',
  halo_effect: 'Halo effect detected',
  dependency_trap: 'Dependency trap detected',
  critical_bias_inversion: 'Bias inversion — supervisor negativity may mask real work'
}

export default function ScoreCard({ score }) {
  const [editedScore, setEditedScore] = useState(score?.value ?? 0)
  const [edited, setEdited] = useState(false)

  const bandColor = BAND_COLORS[score?.band] || 'var(--text2)'
  const biases = score?.biasesDetected || []

  const handleScoreChange = (v) => {
    const n = Math.min(10, Math.max(1, parseInt(v) || 1))
    setEditedScore(n)
    setEdited(n !== score?.value)
  }

  const pct = (editedScore / 10) * 100

  return (
    <div className="scorecard fade-up fade-up-1">
      <div className="scorecard-header">
        <span className="section-label">Rubric Score</span>
        {edited && <span className="edited-badge">✎ Edited</span>}
      </div>

      <div className="scorecard-body">
        <div className="score-display">
          <input
            type="number"
            min={1}
            max={10}
            value={editedScore}
            onChange={e => handleScoreChange(e.target.value)}
            className="score-input"
            title="Edit score if you disagree with AI suggestion"
          />
          <span className="score-denom">/10</span>
          <div className="score-labels">
            <span className="score-label-text" style={{ color: bandColor }}>{score?.label}</span>
            <span className="score-band" style={{ color: bandColor }}>{score?.band}</span>
          </div>
        </div>

        <div className="score-bar-wrap">
          <div className="score-bar">
            <div
              className="score-bar-fill"
              style={{ width: `${pct}%`, background: bandColor }}
            />
            {/* Band markers */}
            <div className="marker" style={{ left: '30%' }} title="Productivity starts at 4" />
            <div className="marker" style={{ left: '60%' }} title="Performance starts at 7" />
          </div>
          <div className="band-labels">
            <span>Need Attention</span>
            <span>Productivity</span>
            <span>Performance</span>
          </div>
        </div>

        <div className="score-confidence">
          <span className="conf-label">AI confidence:</span>
          <span className={`conf-value conf-${score?.confidence}`}>{score?.confidence}</span>
          <span className="conf-hint">— treat lower confidence scores with extra skepticism</span>
        </div>
      </div>

      <div className="scorecard-justification">
        <p>{score?.justification}</p>
      </div>

      {biases.length > 0 && (
        <div className="bias-alerts">
          <div className="bias-title">⚠ Supervisor biases detected — factored into score</div>
          {biases.map(b => (
            <div key={b} className="bias-item">
              <span className="bias-dot" />
              {BIAS_LABELS[b] || b}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
