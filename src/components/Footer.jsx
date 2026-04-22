import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--bg-highlight)', padding: '56px 0 28px' }}>
      <div className="container">

        {/* Top section */}
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
              U<span style={{ color: 'var(--green)' }}>·</span>space
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.7', marginBottom: '20px', maxWidth: '300px' }}>
              The student housing marketplace built by Unilus students, for Unilus students. Silverest, Lusaka, Zambia.
            </p>
            <a
              href="https://instagram.com/uspacehousing"
              target="_blank"
              rel="noreferrer"
              title="Follow us on Instagram"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--bg-highlight)',
                color: 'var(--text-muted)', fontSize: '1.2rem',
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
          <div>
            <div className="footer-col-heading">Explore</div>
            <div className="footer-col-links">
              <Link to="/browse" className="footer-link">Browse Spaces</Link>
              <Link to="/browse?verified=true" className="footer-link">Verified Listings</Link>
              <Link to="/browse?maxPrice=1200" className="footer-link">Budget Picks</Link>
            </div>
          </div>

          {/* Landlords */}
          <div>
            <div className="footer-col-heading">Landlords</div>
            <div className="footer-col-links">
              <Link to="/landlord" className="footer-link">List Your Space</Link>
              <Link to="/landlord" className="footer-link">Manage Listings</Link>
              <span className="footer-link" style={{ cursor: 'default' }}>Pricing (Free!)</span>
            </div>
          </div>

          {/* Connect */}
          <div>
            <div className="footer-col-heading">Connect</div>
            <div className="footer-col-links">
              <a href="https://instagram.com/uspacehousing" target="_blank" rel="noreferrer" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ph ph-instagram-logo" style={{ color: 'var(--green)' }}></i>
                @uspacehousing
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>© 2026 Uspace · Silverest, Zambia</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>Find your next boarding house ✨</span>
            <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>Build v{__APP_VERSION__}</span>
          </div>
        </div>

      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px 32px;
          margin-bottom: 48px;
        }
        .footer-brand {
          grid-column: 1 / -1;
        }
        @media (min-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
          .footer-brand {
            grid-column: 1 / -1;
          }
        }
        @media (min-width: 900px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr;
          }
          .footer-brand {
            grid-column: auto;
          }
        }
        .footer-col-heading {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--text-muted);
          margin-bottom: 14px;
        }
        .footer-col-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-link {
          font-size: 0.875rem;
          color: var(--text-muted);
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-link:hover {
          color: var(--white);
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid var(--bg-highlight);
          color: var(--text-faint);
          font-size: 0.8rem;
        }
      `}</style>
    </footer>
  );
}
