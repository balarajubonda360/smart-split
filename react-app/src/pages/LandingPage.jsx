import { Link } from 'react-router-dom';
import { UtilityMascot } from '../components/UtilityMascot';

const highlights = [
  { value: '3', label: 'utility types', detail: 'Electricity · Water · Internet' },
  { value: 'One', label: 'shared dashboard', detail: 'Bills, usage, and payments together' },
  { value: 'Simple', label: 'bill splitting', detail: 'Keep household costs clear' },
];

const steps = [
  {
    number: '01',
    icon: '⌂',
    title: 'Bring your household together',
    description: 'Set up your household and keep member and utility details in one place.',
    actions: [{ label: 'Open household', path: '/household' }],
  },
  {
    number: '02',
    icon: '▤',
    title: 'Review bills and usage',
    description: 'See utility bills, understand consumption, and check each billing period.',
    actions: [
      { label: 'View bills', path: '/bills' },
      { label: 'Explore usage', path: '/usage' },
    ],
  },
  {
    number: '03',
    icon: '↗',
    title: 'Pay and track with confidence',
    description: 'Review payment activity, follow bill status, and stay on top of what is due.',
    actions: [{ label: 'View payments', path: '/payments' }],
  },
];

const features = [
  { icon: '₹', title: 'Bills made clearer', text: 'Keep household utility bills and due dates easy to find.', action: 'View your bills', path: '/bills' },
  { icon: '⌁', title: 'Understand usage', text: 'Explore electricity, water, and internet consumption.', action: 'Explore usage', path: '/usage' },
  { icon: '↗', title: 'Track payments', text: 'Review transaction history and payment status in one view.', action: 'See payment history', path: '/payments' },
  { icon: '?', title: 'Help when you need it', text: 'Find customer care and account-service options from your dashboard.', action: 'Contact customer care', path: '/customer-care' },
];

const mascotCrew = [
  { kind: 'electricity', name: 'Watt', detail: 'Your energy buddy' },
  { kind: 'water', name: 'Ripple', detail: 'Here for every drop' },
  { kind: 'internet', name: 'Pixel', detail: 'Keeping you connected' },
];

export const LandingPage = () => (
  <main className="landing-page">
    <header className="landing-nav">
      <Link to="/" className="landing-brand" aria-label="PAYMATE home">
        <span className="brand-mark">P</span>
        <span>
          <strong>PAYMATE</strong>
          <small>Robotic utility control</small>
        </span>
      </Link>
      <nav className="landing-nav-links" aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#features">Features</a>
      </nav>
      <div className="landing-nav-actions">
        <Link to="/login" className="landing-login">Login</Link>
        <Link to="/dashboard" className="landing-nav-cta">Dashboard <span aria-hidden="true">→</span></Link>
      </div>
    </header>

    <section className="landing-hero">
      <div className="landing-hero-copy">
        <div className="landing-kicker"><span /> A smarter way to split home utilities</div>
        <h1>Goodbye bill confusion.<br /><span>Hello, shared clarity.</span></h1>
        <p className="landing-lede">
          Bring household utility bills, consumption, and payments together.
          PAYMATE helps everyone see what is due and how the costs are shared.
        </p>
        <div className="landing-hero-actions">
          <Link to="/login" className="landing-primary-cta">Login to PAYMATE <span aria-hidden="true">→</span></Link>
          <Link to="/dashboard" className="landing-secondary-cta">Open dashboard</Link>
        </div>
        <div className="landing-trust-note"><span aria-hidden="true">✦</span> A clear view for every household member</div>
        <div className="landing-mascot-crew" aria-label="Meet the utility buddies">
          {mascotCrew.map((mascot) => (
            <div className="landing-mascot" key={mascot.kind}>
              <UtilityMascot kind={mascot.kind} />
              <span><strong>{mascot.name}</strong><small>{mascot.detail}</small></span>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-visual" aria-label="Illustration of a sample utility dashboard">
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
        <div className="visual-glow" />
        <div className="visual-float visual-float-top"><span className="visual-mini-icon teal">↗</span><span><strong>Usage overview</strong><small>All utilities in view</small></span></div>
        <div className="visual-dashboard">
          <div className="visual-dashboard-top">
            <span><i /> Household overview</span>
            <span className="visual-period">THIS MONTH</span>
          </div>
          <div className="visual-bill-label">Total household bills</div>
          <div className="visual-bill-total">₹ 8,420 <span>sample</span></div>
          <div className="visual-chart" aria-hidden="true">
            <div className="visual-chart-grid" />
            <svg viewBox="0 0 420 120" preserveAspectRatio="none" role="presentation">
              <defs>
                <linearGradient id="landing-chart-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3c76f5" stopOpacity=".28" />
                  <stop offset="100%" stopColor="#3c76f5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 94 C38 82 46 88 78 67 S128 76 160 55 S211 64 244 38 S292 58 324 30 S377 44 420 10 L420 120 L0 120Z" fill="url(#landing-chart-fill)" />
              <path d="M0 94 C38 82 46 88 78 67 S128 76 160 55 S211 64 244 38 S292 58 324 30 S377 44 420 10" fill="none" stroke="#4778ef" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="visual-chart-labels"><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span></div>
          </div>
          <div className="visual-utility-list">
            <div><span className="visual-utility-icon electricity">ϟ</span><span><strong>Electricity</strong><small>Monthly bill</small></span><b>₹ 4,280</b></div>
            <div><span className="visual-utility-icon water">≈</span><span><strong>Water</strong><small>Monthly bill</small></span><b>₹ 1,640</b></div>
            <div><span className="visual-utility-icon internet">⌁</span><span><strong>Internet</strong><small>Monthly bill</small></span><b>₹ 2,500</b></div>
          </div>
        </div>
        <div className="visual-caption">Illustrative sample dashboard · Demo values</div>
      </div>
    </section>

    <section className="landing-highlights" aria-label="PAYMATE at a glance">
      {highlights.map((item) => (
        <div className="highlight-card" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
          <small>{item.detail}</small>
        </div>
      ))}
    </section>

    <section className="landing-section how-section" id="how-it-works">
      <div className="landing-section-heading">
        <div className="landing-kicker">A little less admin. A lot more clarity.</div>
        <h2>Shared bills, made simple</h2>
        <p>From the first bill to the final split, your household stays in sync.</p>
      </div>
      <div className="steps-grid">
        {steps.map((step) => (
          <article className="step-card" key={step.number}>
            <div className="step-card-top"><span className="step-icon">{step.icon}</span><span className="step-number">{step.number}</span></div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <div className="step-card-actions">
              {step.actions.map((action) => (
                <Link className="step-action" key={action.path} to={action.path}>
                  {action.label}<span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="landing-section feature-section" id="features">
      <div className="landing-section-heading">
        <div className="landing-kicker">One useful place for the essentials</div>
        <h2>Your household utility companion</h2>
        <p>Everything you need to understand and manage shared utility costs.</p>
      </div>
      <div className="features-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
            <Link className="feature-action" to={feature.path}>
              {feature.action}<span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>

    <section className="landing-bottom-cta">
      <div>
        <div className="landing-kicker">Your household, all caught up</div>
        <h2>Make utility bills the easy part.</h2>
        <p>Sign in to bring your household dashboard into view.</p>
      </div>
      <Link to="/login" className="landing-primary-cta">Login to PAYMATE <span aria-hidden="true">→</span></Link>
    </section>

    <footer className="landing-footer">
      <Link to="/" className="landing-brand">
        <span className="brand-mark">P</span>
        <span><strong>PAYMATE</strong><small>Robotic utility control</small></span>
      </Link>
      <span>Household utility billing, usage, and payment tracking.</span>
      <span>© PAYMATE · Demo application</span>
    </footer>
  </main>
);
