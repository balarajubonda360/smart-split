import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { billService } from '../services/billService';

const utilityDetails = [
  { key: 'electricity', name: 'Electricity', unit: 'kWh', fallback: 420, icon: '\u26A1', color: '#3b82f6' },
  { key: 'water', name: 'Water', unit: 'KL', fallback: 18, icon: '\u{1F4A7}', color: '#06b6d4' },
  { key: 'internet', name: 'Internet', unit: 'GB', fallback: 800, icon: '\u{1F4F6}', color: '#6366f1' },
];

const UsageTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const { name, value, unit } = payload[0].payload;
  return (
    <div className="usage-tooltip">
      <span>{name}</span>
      <strong>{Number(value).toLocaleString()} {unit}</strong>
    </div>
  );
};

export const UsagePage = () => {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const responses = await Promise.all(utilityDetails.map(({ key }) => billService.getUtilityBills(key)));
        if (!active) return;
        setUsage(utilityDetails.map((utility, index) => {
          const bill = responses[index].data.data.bills[0];
          return {
            ...utility,
            value: Number(bill?.usage ?? utility.fallback),
            unit: bill?.usageUnit || utility.unit,
          };
        }));
      } catch (error) {
        if (active) {
          console.error('Usage data load failed', error);
          setError('We couldn’t load your usage right now. Please try again later.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  return (
    <div className="page-section usage-overview">
      <div className="page-header">
        <div>
          <div className="eyebrow">Usage</div>
          <h1>Personal usage overview</h1>
        </div>
      </div>

      <section className="usage-summary" aria-label="Latest utility usage">
        {utilityDetails.map((utility) => {
          const item = usage.find(({ key }) => key === utility.key);
          return (
            <article className={`usage-summary-card usage-${utility.key}`} key={utility.key}>
              <span className="usage-summary-icon" aria-hidden="true">{utility.icon}</span>
              <span className="usage-summary-label">{utility.name}</span>
              {loading ? (
                <span className="usage-summary-value" aria-label="Loading usage">—</span>
              ) : item ? (
                <strong className="usage-summary-value">
                  {item.value.toLocaleString()} <span>{item.unit}</span>
                </strong>
              ) : (
                <span className="usage-summary-value">—</span>
              )}
              <span className="usage-summary-caption">Latest bill</span>
            </article>
          );
        })}
      </section>

      <section className="card-block usage-chart-card" aria-labelledby="usage-chart-title">
        <div className="section-heading usage-chart-heading">
          <div>
            <h3 id="usage-chart-title">Usage by utility</h3>
            <p>Consumption from your latest available bills</p>
          </div>
          <span className="usage-period-badge"><i aria-hidden="true" /> Latest bills</span>
        </div>
        <p className="usage-chart-note">Each utility uses a different unit. Compare usage within each utility over time.</p>
        {loading ? (
          <div className="usage-chart-state" role="status">Loading your usage...</div>
        ) : error ? (
          <div className="usage-chart-state usage-chart-error" role="alert">{error}</div>
        ) : (
          <div className="chart-wrap large usage-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usage} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 5" stroke="var(--usage-grid)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--usage-muted)', fontSize: 13 }} tickMargin={12} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--usage-muted)', fontSize: 12 }} width={42} />
                <Tooltip content={<UsageTooltip />} cursor={{ fill: 'var(--usage-hover)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={88}>
                  {usage.map((item) => <Cell key={item.key} fill={item.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
};
