import './EvidenceList.css'

const DIMENSION_LABELS = {
  execution: 'Execution',
  systems_building: 'Systems',
  kpi_impact: 'KPI Impact',
  change_management: 'Change Mgmt'
}

export default function EvidenceList({ evidence = [] }) {
  return (
    <div className="evidence-card fade-up fade-up-2">
      <div className="card-header">
        <span className="section-label">Extracted Evidence</span>
        <span className="count-badge">{evidence.length} quotes</span>
      </div>
      <div className="evidence-list">
        {evidence.map((item, i) => (
          <div key={i} className={`evidence-item signal-${item.signal}`}>
            <blockquote className="quote-text">"{item.quote}"</blockquote>
            <div className="evidence-tags">
              <span className={`tag tag-${item.signal}`}>
                {item.signal === 'positive' ? '↑' : item.signal === 'negative' ? '↓' : '→'} {item.signal}
              </span>
              <span className={`tag ${item.layer === 'layer2_systems' ? 'tag-layer2' : 'tag-layer1'}`}>
                {item.layer === 'layer2_systems' ? '◉ Layer 2 · Systems' : item.layer === 'layer1_execution' ? '○ Layer 1 · Execution' : '? Unclear'}
              </span>
              {item.dimension && (
                <span className="tag tag-neutral">
                  {DIMENSION_LABELS[item.dimension] || item.dimension}
                </span>
              )}
            </div>
            <p className="interpretation">{item.interpretation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
