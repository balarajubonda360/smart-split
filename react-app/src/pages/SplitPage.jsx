import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { billService } from '../services/billService';
import { householdService } from '../services/householdService';

const initialShares = (members) => {
  const base = Math.floor((100 / members.length) * 100) / 100;
  return Object.fromEntries(members.map((member, index) => [
    member.id,
    index === members.length - 1 ? Number((100 - base * (members.length - 1)).toFixed(2)) : base,
  ]));
};

export const SplitPage = () => {
  const { user } = useAuth();
  const householdId = user?.householdId;
  const [members, setMembers] = useState([]);
  const [shares, setShares] = useState({});
  const [totalBill, setTotalBill] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!householdId) return undefined;
    householdService.getMembers(householdId)
      .then(({ data }) => {
        if (!active) return;
        const householdMembers = data.data.members || [];
        setMembers(householdMembers);
        setShares(initialShares(householdMembers));
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load household members.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [householdId]);

  const calculate = async (event) => {
    event.preventDefault();
    setCalculating(true);
    setError('');
    try {
      const payload = {
        totalBill: Number(totalBill),
        splitType,
        members: members.map(({ id }) => id),
        ...(splitType === 'PERCENTAGE' ? { percentages: shares } : {}),
        ...(splitType === 'CUSTOM' ? { customAdjustments: shares } : {}),
      };
      const { data } = await billService.calculateSplit(payload);
      setSplits(data.data.splits);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not calculate this split.');
      setSplits([]);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div><div className="eyebrow">Household tools</div><h1>Split a bill</h1></div>
      </div>
      {error && <div className="notice-box error" role="alert">{error}</div>}
      {!householdId && <div className="card-block"><p>Create a household before configuring a bill split.</p></div>}
      {householdId && loading && <div className="page-state" role="status">Loading household members…</div>}
      {householdId && !loading && !members.length ? (
        <div className="card-block"><p>Add household members before calculating a split.</p></div>
      ) : null}
      {householdId && !loading && members.length > 0 && (
        <div className="detail-grid">
          <form className="card-block form-card" onSubmit={calculate}>
            <h2>Split configuration</h2>
            <label>Total bill amount<input type="number" min="0.01" max="100000000" step="0.01" required value={totalBill} onChange={(event) => setTotalBill(event.target.value)} placeholder="e.g. 2450.00" /></label>
            <label>Split method<select value={splitType} onChange={(event) => setSplitType(event.target.value)}><option value="EQUAL">Split equally</option><option value="PERCENTAGE">By percentage</option><option value="CUSTOM">Custom percentages</option></select></label>
            {splitType !== 'EQUAL' && <fieldset className="split-member-inputs"><legend>Member shares (must total 100%)</legend>
              {members.map((member) => <label key={member.id}>{member.name}<span className="split-share-input"><input aria-label={`${member.name} share percentage`} type="number" min="0" max="100" step="0.01" required value={shares[member.id] ?? ''} onChange={(event) => setShares((current) => ({ ...current, [member.id]: Number(event.target.value) }))} /><span>%</span></span></label>)}
            </fieldset>}
            <button type="submit" className="primary-button" disabled={calculating}>{calculating ? 'Calculating…' : 'Calculate split'}</button>
            <small>Calculation is a demo and is not saved to a bill.</small>
          </form>

          <section className="card-block" aria-labelledby="split-result-title">
            <div className="section-heading"><h2 id="split-result-title">Member breakdown</h2></div>
            {splits.length ? <ul className="split-list">{splits.map((split) => (
              <li key={split.id}><span>{split.name}<small> · {Number(split.share).toLocaleString()}%</small></span><strong>₹{Number(split.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></li>
            ))}</ul> : <p>Enter a bill amount and calculate to see each member’s share.</p>}
          </section>
        </div>
      )}
    </div>
  );
};
