import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { householdService } from '../services/householdService';
import { UtilityMascot } from '../components/UtilityMascot';

export const HouseholdPage = () => {
  const { user, setUser } = useAuth();
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', address: '' });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await householdService.getHouseholds();
        if (active) setHousehold(response.data.data.households[0] || null);
      } catch (error) {
        if (active) setError(error.response?.data?.message || 'Could not load your household.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, []);

  const createHousehold = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await householdService.createHousehold(form);
      const created = response.data.data.household;
      setHousehold(created);
      setUser({ ...user, householdId: created.id, role: 'HOUSEHOLD_ADMIN' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create your household.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-state" role="status">Loading household…</div>;

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <div className="eyebrow">Household</div>
          <h1>{household?.name || 'Set up your household'}</h1>
        </div>
      </div>

      {error && <div className="notice-box error" role="alert">{error}</div>}
      {!household ? (
        <form className="card-block form-card" onSubmit={createHousehold}>
          <div className="household-welcome">
            <UtilityMascot kind="electricity" />
            <div><h2>Create a household</h2><p>Set up a household workspace to manage utility bills with the people you live with.</p></div>
          </div>
          <label>Household name<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Address<input required maxLength={240} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create household'}</button>
        </form>
      ) : (
      <div className="detail-grid">
        <div className="card-block">
          <div className="section-heading"><h3>Household details</h3></div>
          <div className="detail-list">
            <div><span>Address</span><strong>{household.address}</strong></div>
            <div><span>Members</span><strong>{household.members?.length || 0}</strong></div>
            <div><span>Admin</span><strong>{household.adminId}</strong></div>
          </div>
        </div>
        <div className="card-block">
          <div className="section-heading"><h3>Household activity</h3></div>
          <ul className="list-block">
            <li><div><strong>Monthly bill synced</strong><small>October utility cycle</small></div><div className="badge green">Synced</div></li>
            <li><div><strong>Member added</strong><small>New resident enrolled</small></div><div className="badge blue">Updated</div></li>
          </ul>
        </div>
      </div>
      )}
    </div>
  );
};
