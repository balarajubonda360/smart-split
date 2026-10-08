import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { reportService } from '../services/reportService';

export const ReportsPage = () => {
  const [monthly, setMonthly] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([reportService.getMonthly(), reportService.getUtilities()])
      .then(([monthlyResponse, utilitiesResponse]) => {
        if (!active) return;
        setMonthly(monthlyResponse.data.data || []);
        setUtilities(utilitiesResponse.data.data || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load household reports.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="page-section">
      <div className="page-header"><div><div className="eyebrow">Household insights</div><h1>Spending reports</h1></div></div>
      <div className="notice-box info">Reports summarize the bill and payment records currently stored for your household.</div>
      {error && <div className="notice-box error" role="alert">{error}</div>}
      {loading ? <div className="page-state" role="status">Loading household reports…</div> : (
        <div className="detail-grid">
          <section className="card-block" aria-labelledby="monthly-report-title">
            <div className="section-heading"><h2 id="monthly-report-title">Monthly bills</h2></div>
            {monthly.length ? <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer><BarChart data={monthly} margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                <Bar dataKey="spending" name="Bill total" fill="#36d1bd" radius={[6, 6, 0, 0]} />
              </BarChart></ResponsiveContainer>
            </div> : <p>No bill records are available for this household yet.</p>}
          </section>
          <section className="card-block" aria-labelledby="utility-report-title">
            <div className="section-heading"><h2 id="utility-report-title">By utility</h2></div>
            {utilities.length ? <ul className="list-block">{utilities.map((item) => (
              <li key={item.name}><div><strong>{item.name}</strong><small>Recorded bills</small></div><strong>₹{Number(item.value).toLocaleString('en-IN')}</strong></li>
            ))}</ul> : <p>No utility totals to show yet.</p>}
          </section>
        </div>
      )}
    </div>
  );
};
