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
            {/* Social Links */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <a 
                href="https://instagram.com/uspacehousing" 
                target="_blank" 
                rel="noreferrer" 
                title="Follow us on Instagram"
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--bg-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', fontSize: '1.2rem', transition: 'all 0.25s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-highlight)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <i className="ph ph-instagram-logo"></i>
              </a>
            </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ marginBottom: '8px' }}>Connect</h4>
            <a href="https://instagram.com/uspacehousing" target="_blank" rel="noreferrer" className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}>
              <i className="ph ph-instagram-logo" style={{ color: 'var(--green)' }}></i> @uspacehousing
            </a>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '32px', borderTop: '1px solid var(--bg-highlight)', color: 'var(--text-faint)' }}>
          <span>© 2026 Uspace. Student built · Silverest, Zambia</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', textAlign: 'right' }}>
            <span style={{ color: 'var(--green)' }}>Find your next boarding house ✨</span>
            <span className="text-muted" style={{ fontSize: '0.7rem', opacity: 0.85 }} title="From package.json — bump after release. Android needs npm run build + cap sync to see new code.">
              Build v{__APP_VERSION__}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
