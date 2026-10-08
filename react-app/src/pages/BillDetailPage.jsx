import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { billService } from '../services/billService';
import { paymentService } from '../services/paymentService';
import { StatusBadge } from '../components/StatusBadge';

export const BillDetailPage = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [paymentState, setPaymentState] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await billService.getBill(id);
        setBill(response.data.data.bill);
      } catch (error) {
        setError(error.response?.data?.message || 'Could not load this bill.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const payNow = async () => {
    if (!bill || paying || ['PAID', 'SUCCESS'].includes(String(bill.status).toUpperCase())) return;
    setPaying(true);
    setError('');
    setPaymentState('');
    try {
      const payRes = await paymentService.createPayment({ billId: bill.id, amount: bill.amount });
      const payment = payRes.data.data.payment;
      await paymentService.process({ paymentId: payment.id });
      setPaymentState('Demo payment is processing…');
      await new Promise((resolve) => window.setTimeout(resolve, 1300));
      const completed = await paymentService.getPayment(payment.id);
      if (completed.data.data.payment.status === 'SUCCESS') {
        setPaymentState('Demo payment successful.');
        setBill((current) => ({ ...current, status: 'PAID' }));
      } else {
        setError('Payment is still processing. Check payment history for its latest status.');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not complete the demo payment.');
    }
    setPaying(false);
  };

  if (loading) return <div className="page-state">Loading bill details...</div>;
  if (!bill) return <div className="page-state" role="alert">{error || 'Bill not found.'}</div>;

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <div className="eyebrow">Bill details</div>
          <h1>{bill.utilityType} bill</h1>
        </div>
        <button className="primary-button" onClick={() => void payNow()} disabled={paying || ['PAID', 'SUCCESS'].includes(String(bill.status).toUpperCase())}>{paying ? 'Processing…' : ['PAID', 'SUCCESS'].includes(String(bill.status).toUpperCase()) ? 'Paid' : 'Pay demo bill'}</button>
      </div>

      {error && <div className="notice-box error" role="alert">{error}</div>}
      {paymentState && <div className="notice-box info" role="status">{paymentState}</div>}
      <div className="detail-grid">
        <div className="card-block">
          <div className="section-heading"><h3>Bill overview</h3><StatusBadge status={bill.status} /></div>
          <div className="detail-list">
            <div><span>Provider</span><strong>{bill.provider}</strong></div>
            <div><span>Period</span><strong>{bill.billingPeriod}</strong></div>
            <div><span>Due date</span><strong>{bill.dueDate}</strong></div>
            <div><span>Usage</span><strong>{bill.usage} {bill.usageUnit}</strong></div>
            <div><span>Total bill</span>            <strong>₹{Number(bill.amount).toLocaleString('en-IN')}</strong></div>
          </div>
        </div>

        <div className="card-block">
          <div className="section-heading"><h3>Member split</h3></div>
          <ul className="split-list">
            {bill.splits?.map((split) => (
              <li key={split.memberId}><span>{split.memberId}</span><strong>₹{Number(split.amount).toLocaleString('en-IN')}</strong></li>
            )) || <li>No split available</li>}
          </ul>
        </div>
      </div>

    </div>
  );
};
