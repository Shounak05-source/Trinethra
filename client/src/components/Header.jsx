import { useState, useEffect } from 'react'
import './Header.css'

export default function Header({ model, onModelChange }) {
  const [models, setModels] = useState([])
  const [ollamaOk, setOllamaOk] = useState(null)

  useEffect(() => {
    fetch('/api/analyze/models')
      .then(r => r.json())
      .then(data => {
        if (data.models?.length) {
          setModels(data.models)
          setOllamaOk(true)
          if (!data.models.includes(model) && data.models.length > 0) {
            onModelChange(data.models[0])
          }
        } else {
          setOllamaOk(false)
        }
      })
      .catch(() => setOllamaOk(false))
  }, [])

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-eye">◈</span>
          <span className="logo-text">TRINETHRA</span>
          <span className="logo-sub">Fellow Performance Analyzer</span>
        </div>
      </div>
      <div className="header-right">
        <div className={`ollama-status ${ollamaOk === true ? 'ok' : ollamaOk === false ? 'err' : 'checking'}`}>
          <span className="status-dot" />
          <span>{ollamaOk === null ? 'Connecting...' : ollamaOk ? 'Ollama connected' : 'Ollama offline'}</span>
        </div>
        {models.length > 0 && (
          <select
            className="model-select"
            value={model}
            onChange={e => onModelChange(e.target.value)}
          >
            {models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
        {models.length === 0 && (
          <div className="model-manual">
            <input
              className="model-input"
              value={model}
              onChange={e => onModelChange(e.target.value)}
              placeholder="model name"
            />
          </div>
        )}
        <div className="draft-badge">AI DRAFT · REVIEW REQUIRED</div>
      </div>
    </header>
  )
}
