export function ControlGroup({ label, htmlFor, children }) {
  return (
    <div className="control-group">
      <label className="field-label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export function RangeControl({ label, valueLabel, id, min, max, value, onChange }) {
  return (
    <div className="control-group">
      <div className="label-row">
        <label className="field-label" htmlFor={id}>{label}</label>
        <span className="field-value">{valueLabel}</span>
      </div>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}

export function ButtonGrid({ children }) {
  return <div className="button-grid">{children}</div>;
}
