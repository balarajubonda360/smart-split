import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { StatCard } from '../components/StatCard';

export const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await adminService.overview();
      setStats(response.data.data.stats);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load the platform overview.');
    }
  }, []);

  useEffect(() => {
    let active = true;
    adminService.overview()
      .then((response) => { if (active) setStats(response.data.data.stats); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Could not load the platform overview.'); });
    return () => { active = false; };
  }, []);

  if (!stats && !error) return <div className="page-state" role="status">Loading admin overview…</div>;

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <div className="eyebrow">Platform Admin</div>
          <h1>System overview</h1>
        </div>
      </div>

      {error && <div className="notice-box error" role="alert">{error}<button type="button" className="link-button" onClick={() => void load()}>Retry</button></div>}
      {stats && <>
      <div className="stats-grid">
        <StatCard label="Total Users" value={stats.totalUsers} tone="primary" />
        <StatCard label="Total Households" value={stats.totalHouseholds} tone="success" />
        <StatCard label="Total Bills" value={stats.totalBills} tone="neutral" />
        <StatCard label="Pending Payments" value={stats.pendingPayments} tone="warning" />
      </div>
      </>}
    </div>
  );
};
