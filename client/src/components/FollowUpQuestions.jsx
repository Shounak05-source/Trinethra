import { useState } from 'react'
import './FollowUpQuestions.css'

const DIMENSION_COLORS = {
  execution: 'var(--blue)',
  systems_building: 'var(--purple)',
  kpi_impact: 'var(--green)',
  change_management: 'var(--yellow)',
  problem_identification: 'var(--accent)'
}

export default function FollowUpQuestions({ questions = [] }) {
  const [copied, setCopied] = useState(null)

  const copyAll = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied('all')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const copyOne = (i, q) => {
    navigator.clipboard.writeText(q.question).then(() => {
      setCopied(i)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="fq-card fade-up fade-up-5">
      <div className="card-header">
        <span className="section-label">Follow-up Questions</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="count-badge">{questions.length} questions</span>
          <button className="copy-all-btn" onClick={copyAll}>
            {copied === 'all' ? '✓ Copied' : 'Copy all'}
          </button>
        </div>
      </div>
      <div className="fq-intro">
        Ask these in the next supervisor call. Each targets a specific gap in this transcript.
      </div>
      <div className="fq-list">
        {questions.map((q, i) => {
          const color = DIMENSION_COLORS[q.targetGap] || 'var(--text3)'
          return (
            <div key={i} className="fq-item">
              <div className="fq-num" style={{ color }}>{i + 1}</div>
              <div className="fq-content">
                <p className="fq-question">"{q.question}"</p>
                <div className="fq-meta">
                  <span className="fq-gap" style={{ color }}>
                    Targets: {q.targetGap?.replace(/_/g, ' ')}
                  </span>
                  {q.lookingFor && (
                    <p className="fq-looking">Looking for: {q.lookingFor}</p>
                  )}
                </div>
              </div>
              <button
                className="copy-btn"
                onClick={() => copyOne(i, q)}
                title="Copy question"
              >
                {copied === i ? '✓' : '⧉'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
