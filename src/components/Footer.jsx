import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--bg-highlight)', padding: '56px 0 28px' }}>
      <div className="container">

        {/* Top grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '40px 32px',
          marginBottom: '48px',
          alignItems: 'start',
        }}>

          {/* Brand col — spans 2 cols on wide screens via a nested wrapper */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
              U<span style={{ color: 'var(--green)' }}>·</span>space
            </div>
            <p className="text-muted" style={{ maxWidth: '300px', lineHeight: '1.7', marginBottom: '20px', fontSize: '0.9rem' }}>
              The student housing marketplace built by Unilus students, for Unilus students. Silverest, Lusaka, Zambia.
            </p>
            {/* Social */}
            <a
              href="https://instagram.com/uspacehousing"
              target="_blank"
              rel="noreferrer"
              title="Follow us on Instagram"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--bg-highlight)',
                color: 'var(--text-muted)', fontSize: '1.2rem',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-highlight)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <i className="ph ph-instagram-logo"></i>
            </a>
          </div>

          {/* Explore */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ marginBottom: '4px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Explore</h4>
            <Link to="/browse" className="text-muted footer-link">Browse Spaces</Link>
            <Link to="/browse?verified=true" className="text-muted footer-link">Verified Listings</Link>
            <Link to="/browse?maxPrice=1200" className="text-muted footer-link">Budget Picks</Link>
          </div>

          {/* Landlords */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ marginBottom: '4px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Landlords</h4>
            <Link to="/landlord" className="text-muted footer-link">List Your Space</Link>
            <Link to="/landlord" className="text-muted footer-link">Manage Listings</Link>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Pricing (Free!)</span>
          </div>

          {/* Connect */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ marginBottom: '4px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Connect</h4>
            <a href="https://instagram.com/uspacehousing" target="_blank" rel="noreferrer" className="text-muted footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ph ph-instagram-logo" style={{ color: 'var(--green)' }}></i> @uspacehousing
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '24px',
          borderTop: '1px solid var(--bg-highlight)',
          color: 'var(--text-faint)',
          fontSize: '0.8rem',
        }}>
          <span>© 2026 Uspace · Silverest, Zambia</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', textAlign: 'right' }}>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>Find your next boarding house ✨</span>
            <span style={{ opacity: 0.6, fontSize: '0.7rem' }} title="From package.json — bump after release.">
              Build v{__APP_VERSION__}
            </span>
          </div>
        </div>

      </div>

      <style>{`
        .footer-link {
          font-size: 0.875rem;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--white) !important;
        }
        @media (max-width: 600px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
          footer .container > div:first-child > div:first-child {
            grid-column: 1 / -1 !important;
          }
        }
      `}</style>
    </footer>
  );
}
