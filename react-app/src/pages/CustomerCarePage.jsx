import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UtilityMascot } from '../components/UtilityMascot';

export const CustomerCarePage = () => {
  const [submitted, setSubmitted] = useState(false);

  const submitRequest = (event) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <div className="eyebrow">We’re here to help</div>
          <h1>Customer care</h1>
        </div>
        <Link to="/disputes" className="secondary-button">Raise a billing dispute</Link>
      </div>

      <div className="support-intro card-block">
        <UtilityMascot kind="internet" className="support-mascot" />
        <div>
          <h2>How can we help you?</h2>
          <p>Send us a message about a bill, payment, or your utility account.</p>
        </div>
      </div>

      <div className="detail-grid">
        <form className="card-block form-card" onSubmit={submitRequest}>
          <h3>Contact us</h3>
          <label>
            Topic
            <select name="topic" defaultValue="Billing question">
              <option>Billing question</option>
              <option>Payment support</option>
              <option>Usage and consumption</option>
              <option>Account help</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
          </label>
          <label>
            How can we help?
            <textarea name="message" rows={5} minLength={10} required placeholder="Tell us a little about what you need help with..." />
          </label>
          <button type="submit" className="primary-button">Prepare support request</button>
          {submitted && (
            <div className="notice-box info" role="status">
              Demo only: your message was not sent or saved. Connect a customer-care service to submit real requests.
            </div>
          )}
        </form>

        <div className="card-block support-options">
          <div>
            <div className="eyebrow">Popular help</div>
            <h3>Get help with your account</h3>
          </div>
          <Link to="/bills" className="support-option">
            <span className="service-icon blue" aria-hidden="true">₹</span>
            <span><strong>Bill payment</strong><small>View a bill or make a payment</small></span>
            <span className="service-arrow" aria-hidden="true">→</span>
          </Link>
          <Link to="/payments" className="support-option">
            <span className="service-icon green" aria-hidden="true">↗</span>
            <span><strong>Payment history</strong><small>Check transaction status</small></span>
            <span className="service-arrow" aria-hidden="true">→</span>
          </Link>
          <Link to="/usage" className="support-option">
            <span className="service-icon orange" aria-hidden="true">⌁</span>
            <span><strong>Usage and consumption</strong><small>Explore your utility usage</small></span>
            <span className="service-arrow" aria-hidden="true">→</span>
          </Link>
          <Link to="/account-services" className="support-option">
            <span className="service-icon purple" aria-hidden="true">A</span>
            <span><strong>Account services</strong><small>Aadhaar and mobile number options</small></span>
            <span className="service-arrow" aria-hidden="true">→</span>
          </Link>
          <div className="notice-box info">
            SmartSplit is running in demo mode. No customer-care phone number or email has been configured.
          </div>
        </div>
      </div>
    </div>
  );
};
