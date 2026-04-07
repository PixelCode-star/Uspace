import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '120px 20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--bg-highlight)', lineHeight: 1, marginBottom: '24px' }}>404</div>
      <h1 style={{ marginBottom: '16px' }}>Page not found</h1>
      <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 32px' }}>
        The boarding house or page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}
