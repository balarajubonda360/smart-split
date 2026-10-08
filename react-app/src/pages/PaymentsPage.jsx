import { useCallback, useEffect, useState } from 'react';
import { paymentService } from '../services/paymentService';
import { StatusBadge } from '../components/StatusBadge';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPayments = useCallback(async () => {
    try {
      const response = await paymentService.getPayments();
      setPayments(response.data.data.payments || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load payment history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    paymentService.getPayments()
      .then((response) => { if (active) setPayments(response.data.data.payments || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Could not load payment history.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="page-section">
      <div className="page-header">
        <div><div className="eyebrow">Payments</div><h1>Payment history</h1></div>
      </div>
      {error && <div className="notice-box error" role="alert">{error} <button type="button" className="link-button" onClick={() => void loadPayments()}>Retry</button></div>}
      <div className="table-card">
        <table>
          <thead><tr><th scope="col">Transaction</th><th scope="col">Method</th><th scope="col">Amount</th><th scope="col">Status</th><th scope="col">Date</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="5" role="status">Loading payments…</td></tr> : payments.length ? payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.transactionId}</td><td>{payment.method}</td>
                <td>₹{Number(payment.amount).toLocaleString('en-IN')}</td>
                <td><StatusBadge status={payment.status} /></td>
                <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            )) : <tr><td colSpan="5">No payments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
