import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { billService } from '../services/billService';
import { StatusBadge } from '../components/StatusBadge';
import { UtilityMascot } from '../components/UtilityMascot';

export const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const getBills = useCallback(async () => {
    try {
      const response = await billService.getBills();
      setBills(response.data.data.bills || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load utility bills.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    billService.getBills()
      .then((response) => { if (active) setBills(response.data.data.bills || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Could not load utility bills.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const syncBills = async () => {
    setSyncing(true);
    setError('');
    try {
      const response = await billService.syncBills();
      setBills((previous) => [...(response.data.data.bills || []), ...previous]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not sync demo bills.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <div className="eyebrow">Bills</div>
          <h1>Utility bills</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => void syncBills()} disabled={syncing}>{syncing ? 'Syncing…' : 'Sync demo bills'}</button>
      </div>

      {error && <div className="notice-box error" role="alert">{error} <button type="button" className="link-button" onClick={() => void getBills()}>Retry</button></div>}
      {loading ? <div className="page-state" role="status">Loading bills…</div> : (
        <div className="table-card bills-table-card">
          <table>
            <thead>
              <tr>
                <th>Utility</th>
                <th>Provider</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.length ? bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.utilityType}</td>
                  <td>{bill.provider}</td>
                  <td>{bill.billingPeriod}</td>
                  <td>₹{Number(bill.amount).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={bill.status} /></td>
                  <td><Link to={`/bills/${bill.id}`} className="link-button">Open</Link></td>
                </tr>
              )) : <tr><td colSpan="6"><div className="bills-empty-state"><UtilityMascot kind="water" /><span>No utility bills yet. Create a household or sync demo bills to get started.</span></div></td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
