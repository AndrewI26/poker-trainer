import { Link } from "react-router";

export function LandingPage() {
  return (
    <section className="card">
      <h2>Welcome to Poker Trainer</h2>
      <p className="muted">
        Improve your poker game with targeted drills and analytics.
      </p>
      <div className="landing-actions">
        <Link to="/drills" className="btn primary">
          Browse Drills
        </Link>
      </div>
    </section>
  );
}
