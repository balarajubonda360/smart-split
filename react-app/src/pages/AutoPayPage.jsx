import { useEffect, useState } from 'react';
import { autopayService } from '../services/autopayService';

const emptyForm = { enabled: false, maxAmount: 3500, preference: 'AUTO_DEBIT', nextPaymentDate: '' };

export const AutoPayPage = () => {
  const [rule, setRule] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    autopayService.get()
      .then(({ data }) => {
        if (!active) return;
        const savedRule = data.data.rule;
        setRule(savedRule);
        if (savedRule) {
          setForm({
            enabled: savedRule.enabled,
            maxAmount: savedRule.maxAmount,
            preference: savedRule.preference,
            nextPaymentDate: savedRule.nextPaymentDate || '',
          });
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load auto-pay settings.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const { data } = await autopayService.save({ ...form, maxAmount: Number(form.maxAmount) });
      setRule(data.data.rule);
      setNotice('Your auto-pay settings were saved for this demo session.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save auto-pay settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-state" role="status">Loading auto-pay settings…</div>;

  return (
    <div className="page-section">
      <div className="page-header">
        <div><div className="eyebrow">Auto-pay</div><h1>Automatic payments</h1></div>
      </div>

      {error && <div className="notice-box error" role="alert">{error}</div>}
      {notice && <div className="notice-box success" role="status">{notice}</div>}
      <form className="card-block form-card" onSubmit={saveSettings}>
        <p className="notice-box info">Demo only: this saves settings in memory for this server session. It does not authorize or execute real payments.</p>
        <label className="toggle-row"><span>Auto-pay enabled</span><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} /></label>
        <label>Maximum amount<input type="number" min="1" max="10000000" required value={form.maxAmount} onChange={(event) => setForm({ ...form, maxAmount: event.target.value })} /></label>
        <label>Payment preference<select value={form.preference} onChange={(event) => setForm({ ...form, preference: event.target.value })}><option value="AUTO_DEBIT">Auto-debit</option><option value="UPI">UPI</option><option value="CARD">Debit card</option></select></label>
        <label>Next payment date<input type="date" value={form.nextPaymentDate} onChange={(event) => setForm({ ...form, nextPaymentDate: event.target.value })} /></label>
        <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving…' : rule ? 'Save auto-pay settings' : 'Set up auto-pay'}</button>
      </form>
    </div>
  );
};
