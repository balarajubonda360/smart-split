import { useEffect, useState } from 'react';
import { billService } from '../services/billService';
import { predictionService } from '../services/predictionService';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export const PredictionsPage = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await predictionService.getAll();
        const latest = data.data.predictions?.[0];
        if (latest) {
          if (active) setPrediction(latest);
          return;
        }
        const billsResponse = await billService.getBills();
        const currentBill = (billsResponse.data.data.bills || []).reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
        if (!currentBill) {
          if (active) setError('There are no bill records available to estimate yet.');
          return;
        }
        const generated = await predictionService.generate(currentBill);
        if (active) setPrediction(generated.data.data.prediction);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Could not load your estimate.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const refresh = async () => {
    setGenerating(true);
    setError('');
    try {
      const billsResponse = await billService.getBills();
      const currentBill = (billsResponse.data.data.bills || []).reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
      if (!currentBill) throw new Error('There are no bill records available to estimate yet.');
      const { data } = await predictionService.generate(currentBill);
      setPrediction(data.data.prediction);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not refresh your estimate.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="page-state" role="status">Preparing your estimate…</div>;
  if (!prediction) return <div className="page-section"><div className="page-header"><div><div className="eyebrow">Predictions</div><h1>Estimated next month</h1></div></div><div className="notice-box error" role="alert">{error || 'No estimate is available.'}</div></div>;

  return (
    <div className="page-section">
      <div className="page-header">
        <div><div className="eyebrow">Predictions · demo estimate</div><h1>Estimated next month</h1></div>
        <button type="button" className="secondary-button" onClick={() => void refresh()} disabled={generating}>{generating ? 'Updating…' : 'Refresh estimate'}</button>
      </div>
      {error && <div className="notice-box error" role="alert">{error}</div>}
      <div className="notice-box info">This estimate uses a simple demo calculation, not a trained forecasting model.</div>
      <div className="stats-grid single-row">
        <div className="stat-card tone-primary"><div className="stat-meta">Current bill total</div><div className="stat-value">{money(prediction.currentBill)}</div></div>
        <div className="stat-card tone-success"><div className="stat-meta">Estimated bill</div><div className="stat-value">{money(prediction.predictedBill)}</div></div>
        <div className="stat-card tone-warning"><div className="stat-meta">Estimated change</div><div className="stat-value">{Number(prediction.percentageChange).toFixed(1)}%</div></div>
      </div>
      <div className="card-block">
        <div className="section-heading"><h3>Historical bills</h3><span>Estimate generated {new Date(prediction.generatedAt).toLocaleDateString()}</span></div>
        <ul className="history-list">{prediction.previousBills.map((value, index) => <li key={`${value}-${index}`}><span>Previous {index + 1}</span><strong>{money(value)}</strong></li>)}</ul>
      </div>
    </div>
  );
};
