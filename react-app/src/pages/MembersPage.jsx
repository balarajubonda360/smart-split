import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { householdService } from '../services/householdService';

const blankForm = { name: '', email: '', password: '' };

export const MembersPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const householdId = user?.householdId;

  useEffect(() => {
    if (!householdId) return undefined;
    let active = true;
    householdService.getMembers(householdId)
      .then((response) => { if (active) setMembers(response.data.data.members || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Could not load household members.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [householdId, reload]);

  const addMember = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await householdService.addMember(user.householdId, form);
      setMembers((current) => [...current.filter((member) => member.id !== response.data.data.member.id), response.data.data.member]);
      setNotice(`${response.data.data.member.name} was added to your household.`);
      setForm(blankForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add that member.');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (member) => {
    if (!window.confirm(`Remove ${member.name}? This removes them from the household and deactivates their account.`)) return;
    setRemovingId(member.id);
    setError('');
    setNotice('');
    try {
      await householdService.removeMember(member.id);
      setMembers((current) => current.filter((item) => item.id !== member.id));
      setNotice(`${member.name} was removed from your household.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not remove that member.');
    } finally {
      setRemovingId('');
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div><div className="eyebrow">Household admin</div><h1>Household members</h1></div>
      </div>

      {!householdId && <div className="notice-box error" role="alert">Your admin account is not assigned to a household.</div>}
      {error && <div className="notice-box error" role="alert">{error} <button type="button" className="link-button" onClick={() => { setLoading(true); setReload((current) => current + 1); }}>Retry</button></div>}
      {notice && <div className="notice-box success" role="status">{notice}</div>}

      <form className="card-block form-card member-add-form" onSubmit={addMember}>
        <div className="section-heading"><div><h2>Add a member</h2><p>New members can sign in with the email and initial password you provide.</p></div></div>
        <div className="member-form-grid">
          <label>Full name<input name="name" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Initial password<input name="password" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters for a new account" /></label>
        </div>
        <small className="member-form-hint">An initial password is required for a new account. Removing a member deactivates their account and signs them out of the app.</small>
        <button className="primary-button" type="submit" disabled={saving || loading}>{saving ? 'Adding member…' : 'Add member'}</button>
      </form>

      <div className="table-card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Share</th><th>Action</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="5">Loading members…</td></tr> : members.length ? members.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td><td>{member.email}</td><td>{member.role?.replaceAll('_', ' ')}</td>
                <td>{member.role === 'HOUSEHOLD_ADMIN' ? '50%' : '25%'}</td>
                <td>{member.role === 'HOUSEHOLD_MEMBER' ? <button className="member-remove-button" type="button" onClick={() => void removeMember(member)} disabled={removingId === member.id}>{removingId === member.id ? 'Removing…' : 'Remove'}</button> : <span className="muted-empty">Admin</span>}</td>
              </tr>
            )) : <tr><td colSpan="5">No household members found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
