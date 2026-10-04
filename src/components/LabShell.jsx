import { algorithmComplexity, pseudocode } from "../data/algorithmData";

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ComplexityCard({ complexityKey }) {
  const data = algorithmComplexity[complexityKey] || algorithmComplexity.practice;
  return (
    <section className="panel">
      <div className="panel-heading compact">
        <p className="eyebrow">Complexity</p>
        <h2>{data.name}</h2>
      </div>
      <div className="complexity-grid">
        <div><span>Best</span><strong>{data.best}</strong></div>
        <div><span>Average</span><strong>{data.average}</strong></div>
        <div><span>Worst</span><strong>{data.worst}</strong></div>
        <div><span>Space</span><strong>{data.space}</strong></div>
      </div>
    </section>
  );
}

function PseudocodePanel({ pseudoKey, activeLine }) {
  const lines = pseudocode[pseudoKey] || [];
  const data = algorithmComplexity[pseudoKey] || algorithmComplexity.practice;
  return (
    <article className="panel code-panel">
      <div className="panel-heading compact">
        <p className="eyebrow">Pseudocode</p>
        <h2>{data.name}</h2>
      </div>
      <ol className="pseudocode">
        {lines.map((line, index) => (
          <li className={index === activeLine ? "active" : ""} key={line}>{line}</li>
        ))}
      </ol>
    </article>
  );
}

function TracePanel({ trace }) {
  return (
    <article className="panel activity-panel">
      <div className="panel-heading compact">
        <p className="eyebrow">Trace</p>
        <h2>What just happened</h2>
      </div>
      <div className="trace-log" aria-live="polite">
        {trace.map((item, index) => (
          <div className="trace-entry" key={`${item}-${index}`}>{item}</div>
        ))}
      </div>
    </article>
  );
}

export default function LabShell({
  title,
  description,
  controls,
  children,
  complexityKey,
  pseudoKey,
  activeLine = -1,
  stats,
  trace,
}) {
  return (
    <main className="workspace">
      <aside className="sidebar" aria-label="Algorithm controls">
        <section className="panel controls-panel">
          <div className="panel-heading">
            <p className="eyebrow">Mode</p>
            <h1>{title}</h1>
          </div>
          <p className="panel-copy">{description}</p>
          {controls}
        </section>
        <ComplexityCard complexityKey={complexityKey} />
      </aside>

      <section className="stage-column">
        <div className="stats-row" aria-label="Live algorithm stats">
          <StatCard label="Steps" value={stats.steps} />
          <StatCard label="Comparisons" value={stats.comparisons} />
          <StatCard label="Writes" value={stats.writes} />
          <StatCard label="Status" value={stats.status} />
        </div>
        <section className="visual-stage" aria-live="polite">
          <div className="view mode-view active">{children}</div>
        </section>
        <section className="detail-grid">
          <PseudocodePanel pseudoKey={pseudoKey} activeLine={activeLine} />
          <TracePanel trace={trace} />
        </section>
      </section>
    </main>
  );
}
