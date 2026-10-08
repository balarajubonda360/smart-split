import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminService } from '../services/adminService';
import { reportService } from '../services/reportService';
import { StatCard } from '../components/StatCard';

export const AdminReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([adminService.overview(), reportService.getMonthly()])
      .then(([overview, report]) => {
        if (!active) return;
        setStats(overview.data.data.stats);
        setMonthly(report.data.data || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load platform reports.');
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="page-section">
      <div className="page-header"><div><div className="eyebrow">Platform insights</div><h1>Operations report</h1></div></div>
      {error && <div className="notice-box error" role="alert">{error}</div>}
      {!stats && !error ? <div className="page-state" role="status">Loading platform report…</div> : null}
      {stats && <>
        <div className="stats-grid">
          <StatCard label="Total users" value={stats.totalUsers} tone="primary" />
          <StatCard label="Households" value={stats.totalHouseholds} tone="success" />
          <StatCard label="Bills" value={stats.totalBills} tone="neutral" />
          <StatCard label="Open disputes" value={stats.openDisputes} tone="warning" />
        </div>
        <section className="card-block" aria-labelledby="platform-monthly-title">
          <div className="section-heading"><h2 id="platform-monthly-title">Platform bill totals</h2></div>
          {monthly.length ? <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer><BarChart data={monthly} margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
              <Bar dataKey="spending" name="Bill total" fill="#36d1bd" radius={[6, 6, 0, 0]} />
            </BarChart></ResponsiveContainer>
          </div> : <p>No bill records available for this report.</p>}
        </section>
      </>}
    </div>
  );
};
