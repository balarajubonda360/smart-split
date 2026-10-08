import { useEffect, useState } from 'react';
import { billService } from '../services/billService';

export const UtilitiesPage = () => {
  const [utilitySummary, setUtilitySummary] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [electricity, water, internet] = await Promise.all([
          billService.getUtilityBills('electricity'),
          billService.getUtilityBills('water'),
          billService.getUtilityBills('internet'),
        ]);

        setUtilitySummary([
          { name: 'Electricity', amount: electricity.data.data.summary.total },
          { name: 'Water', amount: water.data.data.summary.total },
          { name: 'Internet', amount: internet.data.data.summary.total },
        ]);
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
          <div className="eyebrow">Utilities</div>
          <h1>Connected utility providers</h1>
        </div>
      </div>

      <div className="card-block">
        <ul className="list-block">
          {utilitySummary.map((item) => (
            <li key={item.name}><div><strong>{item.name}</strong><small>Mock Utility Provider</small></div><div className="muted-value">₹{item.amount.toLocaleString('en-IN')}</div></li>
          ))}
        </ul>
      </div>
    </div>
  );
};
