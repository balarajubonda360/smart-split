import { useState } from 'react';

export const AccountServicesPage = () => {
  const [aadhaarPreview, setAadhaarPreview] = useState('');
  const [mobilePreview, setMobilePreview] = useState('');

  const prepareAadhaarRequest = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const lastFour = new FormData(form).get('aadhaarLastFour');
    setAadhaarPreview(`Demo only: Aadhaar ending in ${lastFour} was not linked. Secure identity verification is not configured.`);
    form.reset();
  };

  const prepareMobileRequest = (event) => {
    event.preventDefault();
    setMobilePreview('Demo only: your mobile number was not changed. OTP verification and account update services are not configured.');
    event.currentTarget.reset();
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <div className="eyebrow">Manage your details</div>
          <h1>Account services</h1>
        </div>
        <span className="demo-pill">Demo mode</span>
      </div>

      <div className="notice-box info">
        For your privacy, never enter your full Aadhaar number here. These demo forms do not send or save personal information.
      </div>

      <div className="detail-grid">
        <form className="card-block form-card" onSubmit={prepareAadhaarRequest}>
          <div>
            <div className="eyebrow">Identity</div>
            <h3>Link Aadhaar</h3>
            <p className="form-description">Prepare a demo linking request using only the last four digits of your Aadhaar.</p>
          </div>
          <label>
            Last four digits
            <input
              name="aadhaarLastFour"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]{4}"
              maxLength={4}
              minLength={4}
              required
              placeholder="••••"
              aria-describedby="aadhaar-privacy"
            />
          </label>
          <label className="consent-row">
            <input type="checkbox" required />
            <span>I understand this demo cannot verify or link my Aadhaar.</span>
          </label>
          <button type="submit" className="primary-button">Check linking options</button>
          <p className="field-note" id="aadhaar-privacy">Only four digits are requested. Do not enter your full Aadhaar number.</p>
          {aadhaarPreview && <div className="notice-box info" role="status">{aadhaarPreview}</div>}
        </form>

        <form className="card-block form-card" onSubmit={prepareMobileRequest}>
          <div>
            <div className="eyebrow">Contact details</div>
            <h3>Change mobile number</h3>
            <p className="form-description">Review the demo flow for updating your registered mobile number.</p>
          </div>
          <label>
            New mobile number
            <div className="phone-input">
              <span aria-hidden="true">+91</span>
              <input
                name="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                minLength={10}
                required
                placeholder="10-digit mobile number"
              />
            </div>
          </label>
          <div className="field-note">Real number changes require OTP verification to protect your account.</div>
          <button type="submit" className="primary-button">Continue</button>
          {mobilePreview && <div className="notice-box info" role="status">{mobilePreview}</div>}
        </form>
      </div>
    </div>
  );
};
