import { ArrowRight, Clock3, ShieldCheck, Star, Zap } from 'lucide-react';
import './LandingPage.css';

const highlights = [
  { title: 'Rides In Minutes', detail: 'Smart dispatch pairs riders and nearby drivers in seconds.', icon: Clock3 },
  { title: 'Built For Safety', detail: 'Trip monitoring, verified drivers, and SOS-ready support flows.', icon: ShieldCheck },
  { title: 'Predictable Pricing', detail: 'Transparent fare estimates and clear route-based billing.', icon: Zap },
];

const serviceTags = ['City Rides', 'Intercity', 'Airport', 'Parcel', 'Bike Rental', 'Shared Cab'];

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-background-glow landing-background-glow-one" />
      <div className="landing-background-glow landing-background-glow-two" />

      <header className="landing-header">
        <div className="landing-brand">
          <span className="landing-brand-mark">A</span>
          <span>AppZeto Taxi</span>
        </div>
        <nav className="landing-nav">
          <a href="/login">Log In</a>
          <a href="/signup" className="landing-cta-link">
            Get Started
          </a>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <p className="landing-chip">Smarter urban mobility</p>
          <h1>One platform for ride, parcel, rental, and everything in between.</h1>
          <p className="landing-subtitle">
            Launch trips faster, move goods reliably, and grow operations with a single app stack designed for modern transport businesses.
          </p>
          <div className="landing-actions">
            <a href="/signup" className="landing-button landing-button-primary">
              Start Free
              <ArrowRight size={16} />
            </a>
            <a href="/user" className="landing-button landing-button-secondary">
              Open User App
            </a>
          </div>
          <div className="landing-tags">
            {serviceTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>

        <section className="landing-stats-card">
          <h2>Trusted Daily Operations</h2>
          <div className="landing-stats-grid">
            <div>
              <strong>2.4M+</strong>
              <p>Trips Completed</p>
            </div>
            <div>
              <strong>99.2%</strong>
              <p>Fulfillment Rate</p>
            </div>
            <div>
              <strong>4.9/5</strong>
              <p>Average Rating</p>
            </div>
          </div>
          <div className="landing-rating">
            <Star size={16} />
            <span>Top rated by riders and fleet partners</span>
          </div>
        </section>
      </main>

      <section className="landing-highlights">
        {highlights.map(({ title, detail, icon: Icon }) => (
          <article key={title} className="landing-highlight-card">
            <span className="landing-highlight-icon">
              <Icon size={18} />
            </span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default LandingPage;
