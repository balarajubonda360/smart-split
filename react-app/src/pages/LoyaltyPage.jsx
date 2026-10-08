import { useEffect, useState } from 'react';
import api from '../services/api';

export const LoyaltyPage = () => {
  const [balance, setBalance] = useState({ balance: 0, cashback: 0, history: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/loyalty/balance');
        setBalance(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <div className="eyebrow">Loyalty</div>
          <h1>Rewards and cashback</h1>
        </div>
      </div>

      <div className="stats-grid single-row">
        <div className="stat-card tone-success"><div className="stat-meta">Current points</div><div className="stat-value">{balance.balance}</div></div>
        <div className="stat-card tone-primary"><div className="stat-meta">Cashback balance</div><div className="stat-value">₹{balance.cashback || 0}</div></div>
        <div className="stat-card tone-warning"><div className="stat-meta">Total earned</div><div className="stat-value">₹{(balance.history || []).reduce((sum, item) => sum + (item.amount || 0), 0)}</div></div>
      </div>

      <div className="card-block">
        <div className="section-heading"><h3>Reward history</h3><span>Points earned and redeemed</span></div>
        <ul className="list-block">
          {(balance.history || []).map((entry) => (
            <li key={entry.id}><div><strong>{entry.description}</strong><small>{entry.type}</small></div><div className="badge green">{entry.points}</div></li>
          ))}
        </ul>
      </div>
    </div>
  );
};
