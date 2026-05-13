import ScoreCard from './ScoreCard'
import EvidenceList from './EvidenceList'
import KpiMapping from './KpiMapping'
import GapAnalysis from './GapAnalysis'
import FollowUpQuestions from './FollowUpQuestions'
import './AnalysisPanel.css'

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">◈</div>
      <h3>Ready to analyze</h3>
      <p>Paste a supervisor transcript on the left and click <strong>Run Analysis</strong>.</p>
      <p className="empty-sub">The AI will produce a draft assessment — you review, edit, and decide.</p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠</div>
      <h3>Analysis failed</h3>
      <p>{message}</p>
      <p className="error-sub">Check that Ollama is running: <code>ollama serve</code></p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="loading-skeleton">
      <div className="skeleton" style={{ height: 120, borderRadius: 8, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 200, borderRadius: 8, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 140, borderRadius: 8, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 160, borderRadius: 8 }} />
    </div>
  )
}

export default function AnalysisPanel({ analysis, loading, error }) {
  if (loading) return <div className="analysis-panel"><LoadingSkeleton /></div>
  if (error) return <div className="analysis-panel"><ErrorState message={error} /></div>
  if (!analysis) return <div className="analysis-panel"><EmptyState /></div>

  return (
    <div className="analysis-panel">
      <div className="analysis-notice">
        <span className="notice-icon">⚠</span>
        This is an <strong>AI-generated draft</strong>. Review each section carefully. The AI may be wrong — your judgment overrides the suggestion.
      </div>

      <ScoreCard score={analysis.score} />
      <EvidenceList evidence={analysis.evidence} />
      <KpiMapping kpiMapping={analysis.kpiMapping} />
      <GapAnalysis gaps={analysis.gaps} />
      <FollowUpQuestions questions={analysis.followUpQuestions} />
    </div>
  )
}
