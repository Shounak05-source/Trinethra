import './GapAnalysis.css'

const DIMENSION_INFO = {
  execution: { label: 'Driving Execution', icon: '⚡' },
  systems_building: { label: 'Systems Building', icon: '⚙' },
  kpi_impact: { label: 'KPI Impact', icon: '📊' },
  change_management: { label: 'Change Management', icon: '🤝' }
}

const ALL_DIMENSIONS = ['execution', 'systems_building', 'kpi_impact', 'change_management']

export default function GapAnalysis({ gaps = [] }) {
  const gapDimensions = new Set(gaps.map(g => g.dimension))
  const coveredDimensions = ALL_DIMENSIONS.filter(d => !gapDimensions.has(d))

  return (
    <div className="gap-card fade-up fade-up-4">
      <div className="card-header">
        <span className="section-label">Gap Analysis</span>
        <span className={`count-badge ${gaps.length > 0 ? 'badge-warn' : 'badge-ok'}`}>
          {gaps.length} gap{gaps.length !== 1 ? 's' : ''}
        </span>
      </div>

      {coveredDimensions.length > 0 && (
        <div className="covered-dims">
          {coveredDimensions.map(d => (
            <span key={d} className="dim-covered">
              ✓ {DIMENSION_INFO[d]?.label || d}
            </span>
          ))}
        </div>
      )}

      {gaps.length === 0 ? (
        <div className="gap-all-good">✓ All 4 assessment dimensions were covered in this transcript.</div>
      ) : (
        <div className="gap-list">
          {gaps.map((gap, i) => {
            const info = DIMENSION_INFO[gap.dimension] || { label: gap.dimension, icon: '?' }
            return (
              <div key={i} className="gap-item">
                <div className="gap-dim">
                  <span className="gap-icon">{info.icon}</span>
                  <span className="gap-dim-label">{info.label}</span>
                  <span className="gap-missing-tag">NOT COVERED</span>
                </div>
                <p className="gap-detail">{gap.detail}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
