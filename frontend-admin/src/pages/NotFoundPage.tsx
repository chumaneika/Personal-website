import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="empty-state">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <Link to="/">Back to dashboard</Link>
    </section>
  );
}
