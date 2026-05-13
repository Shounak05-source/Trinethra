import './KpiMapping.css'

const KPI_DESCRIPTIONS = {
  'Lead Generation': 'New customers identified',
  'Lead Conversion': 'Leads → paying customers',
  'Upselling': 'More from existing customers',
  'Cross-selling': 'Additional products to existing',
  'NPS': 'Customer satisfaction',
  'PAT': 'Profitability / cost reduction',
  'TAT': 'Turnaround time / speed',
  'Quality': 'Defect / rejection / complaint rates'
}

export default function KpiMapping({ kpiMapping = [] }) {
  if (!kpiMapping || kpiMapping.length === 0) {
    return (
      <div className="kpi-card fade-up fade-up-3">
        <div className="card-header">
          <span className="section-label">KPI Mapping</span>
        </div>
        <div className="kpi-empty">No KPI impact detected in this transcript.</div>
      </div>
    )
  }

  return (
    <div className="kpi-card fade-up fade-up-3">
      <div className="card-header">
        <span className="section-label">KPI Mapping</span>
        <span className="count-badge">{kpiMapping.length} KPI{kpiMapping.length > 1 ? 's' : ''}</span>
      </div>
      <div className="kpi-list">
        {kpiMapping.map((item, i) => (
          <div key={i} className="kpi-item">
            <div className="kpi-top">
              <span className="kpi-name">{item.kpi}</span>
              <span className={`kpi-type ${item.systemOrPersonal === 'system' ? 'kpi-system' : 'kpi-personal'}`}>
                {item.systemOrPersonal === 'system' ? '◉ Built system' : '○ Personal effort'}
              </span>
            </div>
            <p className="kpi-evidence">{item.evidence}</p>
            <p className="kpi-desc">{KPI_DESCRIPTIONS[item.kpi] || ''}</p>
          </div>
        ))}
      </div>
      <div className="kpi-legend">
        <span className="legend-system">◉ Built system</span> = survives Fellow's departure &nbsp;·&nbsp;
        <span className="legend-personal">○ Personal effort</span> = stops if Fellow leaves
      </div>
    </div>
  )
}
