import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, subtitle, color, percentage }) {
  const colorVar = `var(--${color || 'primary'})`;

  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ backgroundColor: `${colorVar}15`, color: colorVar }}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-card__content">
        <span className="stat-card__value" style={{ color: colorVar }}>
          {value}
        </span>
        <span className="stat-card__label">{label}</span>
        {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
      </div>
      {percentage !== undefined && (
        <div className="stat-card__bar-wrapper">
          <div className="stat-card__bar">
            <div
              className="stat-card__bar-fill"
              style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: colorVar }}
            />
          </div>
          <span className="stat-card__percentage">{percentage}%</span>
        </div>
      )}
    </div>
  );
}
