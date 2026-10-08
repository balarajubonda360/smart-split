export const StatCard = ({ label, value, hint, tone = 'primary' }) => (
  <div className={`stat-card tone-${tone}`}>
    <div className="stat-meta">{label}</div>
    <div className="stat-value">{value}</div>
    {hint ? <div className="stat-hint">{hint}</div> : null}
  </div>
);
