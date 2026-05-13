import { useState } from 'react'
import './TranscriptInput.css'

const CHAR_MIN = 100

export default function TranscriptInput({ value, onChange, onSubmit, loading }) {
  const [samples, setSamples] = useState(null)
  const [showSamples, setShowSamples] = useState(false)
  const [loadingSamples, setLoadingSamples] = useState(false)

  const loadSamples = async () => {
    if (samples) { setShowSamples(true); return; }
    setLoadingSamples(true)
    try {
      const res = await fetch('/api/samples')
      const data = await res.json()
      setSamples(data.transcripts)
      setShowSamples(true)
    } catch (_) {
      alert('Could not load samples.')
    } finally {
      setLoadingSamples(false)
    }
  }

  const handleSampleSelect = (transcript) => {
    onChange(transcript.transcript)
    setShowSamples(false)
  }

  const canSubmit = value.trim().length >= CHAR_MIN && !loading

  return (
    <div className="input-panel">
      <div className="input-header">
        <div>
          <h2 className="input-title">Supervisor Transcript</h2>
          <p className="input-hint">Paste the 10-15 min call transcript below</p>
        </div>
        <button
          className="btn-ghost"
          onClick={loadSamples}
          disabled={loadingSamples}
        >
          {loadingSamples ? '...' : 'Load sample'}
        </button>
      </div>

      {showSamples && samples && (
        <div className="samples-dropdown">
          <div className="samples-header">
            <span>Select a test transcript</span>
            <button className="close-btn" onClick={() => setShowSamples(false)}>✕</button>
          </div>
          {samples.map(s => (
            <button
              key={s.id}
              className="sample-item"
              onClick={() => handleSampleSelect(s)}
            >
              <div className="sample-name">{s.fellow.name}</div>
              <div className="sample-meta">
                {s.company.name} · {s.fellow.tenure}
                <span className="expected-range"> · expected {s.expectedScoreRange[0]}–{s.expectedScoreRange[1]}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <textarea
        className="transcript-area"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste transcript here...

Example: 'Karthik? Haan, he is good. Very sincere boy. Comes on time, leaves on time...'"
        spellCheck={false}
      />

      <div className="input-footer">
        <span className="char-count">
          {value.length > 0 && `${value.length.toLocaleString()} chars`}
          {value.length > 0 && value.length < CHAR_MIN && <span className="warn"> · too short</span>}
        </span>
        <button
          className={`btn-run ${loading ? 'btn-run--loading' : ''}`}
          onClick={() => onSubmit(value)}
          disabled={!canSubmit}
        >
          {loading ? (
            <><span className="spinner" />Analyzing…</>
          ) : (
            <>◈ Run Analysis</>
          )}
        </button>
      </div>

      {loading && (
        <div className="loading-status">
          <div className="loading-bar" />
          <p className="loading-text">Running analysis with Ollama — this may take 30–90 seconds depending on model size</p>
        </div>
      )}
    </div>
  )
}
