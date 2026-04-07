import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--bg-highlight)', padding: '64px 0 32px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) repeat(auto-fit, minmax(150px, 1fr))', gap: '40px', marginBottom: '64px' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px' }}>U<span style={{color: 'var(--green)'}}>·</span>space</div>
            <p className="text-muted" style={{ maxWidth: '280px', marginBottom: '24px' }}>
              The student housing marketplace built by Unilus students, for Unilus students. Silverest, Lusaka, Zambia.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ marginBottom: '8px' }}>Explore</h4>
            <Link to="/browse" className="text-muted" style={{ transition: 'color 0.2s' }}>Browse Spaces</Link>
            <Link to="/browse?verified=true" className="text-muted">Verified Listings</Link>
            <Link to="/browse?maxPrice=1200" className="text-muted">Budget Picks</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ marginBottom: '8px' }}>Landlords</h4>
            <Link to="/landlord" className="text-muted">List Your Space</Link>
            <Link to="/landlord" className="text-muted">Manage Listings</Link>
            <span className="text-muted">Pricing (Free!)</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '32px', borderTop: '1px solid var(--bg-highlight)', color: 'var(--text-faint)' }}>
          <span>© 2026 Uspace. Student built · Silverest, Zambia</span>
          <span style={{ color: 'var(--green)' }}>Find your next boarding house ✨</span>
        </div>
      </div>
    </footer>
  );
}
