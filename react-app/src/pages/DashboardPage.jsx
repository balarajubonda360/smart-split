import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billService } from '../services/billService';
import { paymentService } from '../services/paymentService';
import { SpyLogo } from '../components/VoiceAssistant';

const money = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN')}`;
const paidStatus = (status) => ['PAID', 'SUCCESS'].includes(String(status || '').toUpperCase());
const utilityCards = [
  { type: 'ELECTRICITY', label: 'Electricity', icon: '\u26A1' },
  { type: 'WATER', label: 'Water', icon: '\u{1F4A7}' },
  { type: 'INTERNET', label: 'Internet', icon: '\u{1F4F6}' },
];
const pageLoadedAt = Date.now();

export const DashboardPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([billService.getBills(), paymentService.getPayments()])
      .then(([billResponse, paymentResponse]) => {
        if (!active) return;
        setBills(billResponse.data.data.bills || []);
        setPayments(paymentResponse.data.data.payments || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load your household overview.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';
  const transactionRows = [...bills]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || b.dueDate) - new Date(a.updatedAt || a.createdAt || a.dueDate))
    .slice(0, 5);

  return (
    <div className="page-section paymate-dashboard pm-reference-dashboard">
      <section className="pm-welcome">
        <div>
          <span className="pm-eyebrow">YOUR HOUSEHOLD AT A GLANCE</span>
          <h1>Good Morning, {firstName} <span aria-hidden="true">{'\u{1F44B}'}</span></h1>
          <p>Here is what is happening with your utility bills today.</p>
        </div>
      </section>

      {error && <div className="notice-box error" role="alert">{error}</div>}
      <section className="pm-utility-grid" aria-label="Utility bills">
        {utilityCards.map(({ type, label, icon }) => {
          const bill = bills.find((item) => String(item.utilityType).toUpperCase() === type);
          const paid = bill && paidStatus(bill.status);
          const daysUntilDue = bill?.dueDate ? Math.ceil((new Date(`${bill.dueDate}T00:00:00`).getTime() - pageLoadedAt) / 86400000) : null;
          const status = !bill ? 'No bill yet' : paid ? 'Paid \u2713' : daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 ? 'Due Soon' : 'Pending';
          return (
            <Link className={`pm-utility-card ${paid ? 'is-paid' : ''}`} to={bill ? `/bills/${bill.id}` : '/bills'} key={type}>
              <span className={`pm-utility-icon pm-icon-${type.toLowerCase()}`} aria-hidden="true">{icon}</span>
              <span className="pm-utility-label">{label}</span>
              <strong>{bill ? money(bill.amount) : '\u2014'}</strong>
              <span className={`pm-utility-status ${paid ? 'is-paid' : ''}`}>{status}</span>
              <span className="pm-card-arrow" aria-hidden="true">&#8599;</span>
            </Link>
          );
        })}
      </section>

      <section className="pm-voice-section" aria-labelledby="pm-voice-title">
        <div className="pm-section-title"><h2 id="pm-voice-title"><SpyLogo /> VOICE ASSISTANT</h2></div>
        <div className="pm-voice-card">
          <div className="pm-voice-orb" aria-hidden="true"><SpyLogo /><i /><i /><i /></div>
          <p className="pm-voice-quote">How can I help?</p>
          <p className="pm-voice-hint">Open pages, check bills, or start a payment with Spy.</p>
          <button className="pm-voice-button" type="button" onClick={() => window.dispatchEvent(new Event('spy-assistant:listen'))}><SpyLogo /> Tap to Speak</button>
          <small>English · हिन्दी · తెలుగు</small>
        </div>
      </section>

      <section className="pm-transactions" aria-labelledby="pm-transactions-title">
        <div className="pm-transactions-head"><div><span className="pm-eyebrow">LATEST ACTIVITY</span><h2 id="pm-transactions-title">Recent Transactions</h2></div><Link to="/payments">All payments <span aria-hidden="true">&#8599;</span></Link></div>
        {loading ? <div className="pm-empty-state">Loading your transactions...</div> : transactionRows.length ? (
          <div className="pm-transaction-list">
            {transactionRows.map((bill) => {
              const payment = payments.find((item) => item.billId === bill.id);
              const isPaid = paidStatus(bill.status) || paidStatus(payment?.status);
              const utility = utilityCards.find((item) => item.type === String(bill.utilityType).toUpperCase());
              return <Link className="pm-transaction-row" to={`/bills/${bill.id}`} key={bill.id}>
                <span className={`pm-transaction-icon ${isPaid ? 'is-paid' : ''}`} aria-hidden="true">{utility?.icon || '\u{1F4A1}'}</span>
                <span className="pm-transaction-name"><strong>{utility?.label || bill.utilityType}</strong><small>{bill.provider || bill.billingPeriod || 'Utility bill'}</small></span>
                <strong className="pm-transaction-amount">{money(payment?.amount ?? bill.amount)}</strong>
                <span className={`pm-transaction-status ${isPaid ? 'is-paid' : 'is-pending'}`}>{isPaid ? '\u2713 Paid' : 'Pending'}</span>
              </Link>;
            })}
          </div>
        ) : <div className="pm-empty-state">No transactions yet. Your bill activity will appear here.</div>}
      </section>
    </div>
  );
};
