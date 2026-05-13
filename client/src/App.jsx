import { useState, useCallback } from 'react'
import TranscriptInput from './components/TranscriptInput'
import AnalysisPanel from './components/AnalysisPanel'
import Header from './components/Header'
import './App.css'

export default function App() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [model, setModel] = useState('llama3.2')
  const [transcript, setTranscript] = useState('')

  const runAnalysis = useCallback(async (transcriptText) => {
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText, model })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

      setAnalysis(data.analysis)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [model])

  return (
    <div className="app-shell">
      <Header model={model} onModelChange={setModel} />
      <main className="app-body">
        <div className="left-panel">
          <TranscriptInput
            value={transcript}
            onChange={setTranscript}
            onSubmit={runAnalysis}
            loading={loading}
          />
        </div>
        <div className="right-panel">
          <AnalysisPanel
            analysis={analysis}
            loading={loading}
            error={error}
          />
        </div>
      </main>
    </div>
  )
}
