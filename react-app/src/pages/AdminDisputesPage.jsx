import { useCallback, useEffect, useState } from 'react';
import { disputeService } from '../services/disputeService';

export const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await disputeService.getAll();
      setDisputes(data.data.disputes || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load the dispute queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    disputeService.getAll()
      .then(({ data }) => { if (active) setDisputes(data.data.disputes || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Could not load the dispute queue.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const updateStatus = async (id, status) => {
    setSavingId(id);
    setError('');
    try {
      const { data } = await disputeService.updateStatus(id, status);
      setDisputes((current) => current.map((item) => item.id === id ? data.data.dispute : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this dispute.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="page-section">
      <div className="page-header"><div><div className="eyebrow">Platform administration</div><h1>Dispute queue</h1></div></div>
      {error && <div className="notice-box error" role="alert">{error} <button type="button" className="link-button" onClick={() => void load()}>Retry</button></div>}
      <div className="table-card"><table>
        <thead><tr><th scope="col">Issue</th><th scope="col">Household</th><th scope="col">Opened</th><th scope="col">Status</th><th scope="col">Update</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan="5" role="status">Loading disputes…</td></tr> : disputes.length ? disputes.map((dispute) => (
            <tr key={dispute.id}>
              <td><strong>{dispute.title}</strong><br /><small>{dispute.description}</small></td>
              <td>{dispute.householdId || '—'}</td>
              <td>{new Date(dispute.createdAt).toLocaleDateString()}</td>
              <td>{dispute.status.replaceAll('_', ' ')}</td>
              <td><select aria-label={`Update status for ${dispute.title}`} value={dispute.status} disabled={savingId === dispute.id} onChange={(event) => void updateStatus(dispute.id, event.target.value)}>
                {['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
              </select></td>
            </tr>
          )) : <tr><td colSpan="5">No disputes found.</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
};
