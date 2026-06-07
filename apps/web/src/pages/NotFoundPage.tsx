import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="card">
      <h2>404 — Page not found</h2>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="link">
        Go home
      </Link>
    </section>
  );
}
