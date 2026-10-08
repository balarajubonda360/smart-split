import { useCallback, useEffect, useState } from 'react';
import { disputeService } from '../services/disputeService';

export const DisputesPage = () => {
  const [form, setForm] = useState({ title: '', description: '' });
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDisputes = useCallback(async () => {
    try {
      const { data } = await disputeService.getAll();
      setDisputes(data.data.disputes || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load billing disputes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    disputeService.getAll()
      .then(({ data }) => { if (active) setDisputes(data.data.disputes || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Could not load billing disputes.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const submitDispute = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const { data } = await disputeService.create(form);
      setDisputes((current) => [data.data.dispute, ...current]);
      setForm({ title: '', description: '' });
      setNotice('Your dispute was submitted.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit this dispute.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div><div className="eyebrow">Disputes</div><h1>Review billing concerns</h1></div>
      </div>

      {error && <div className="notice-box error" role="alert">{error} <button type="button" className="link-button" onClick={() => void loadDisputes()}>Retry</button></div>}
      {notice && <div className="notice-box success" role="status">{notice}</div>}
      <div className="detail-grid">
        <form onSubmit={submitDispute} className="card-block form-card">
          <h3>Raise a dispute</h3>
          <label>Title<input maxLength={160} required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} minLength={10} maxLength={4000} required /></label>
          <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Submitting…' : 'Submit dispute'}</button>
        </form>

        <div className="card-block">
          <h3>Current status</h3>
          <ul className="list-block">
            {loading ? <li role="status">Loading disputes…</li> : disputes.length ? disputes.map((dispute) => (
              <li key={dispute.id}>
                <div><strong>{dispute.title}</strong><small>{new Date(dispute.createdAt).toLocaleDateString()} · {dispute.status.replaceAll('_', ' ')}</small></div>
                <div className={`badge ${dispute.status === 'RESOLVED' ? 'green' : 'warning'}`}>{dispute.status.replaceAll('_', ' ')}</div>
              </li>
            )) : <li>No disputes yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};
