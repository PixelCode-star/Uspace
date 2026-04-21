import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SupabaseAPI } from '../lib/supabase';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleHowItWorks = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSignOut = async () => {
    window.dispatchEvent(new CustomEvent('show-dialog', {
      detail: {
        type: 'confirm',
        title: 'Sign Out',
        message: 'Are you sure you want to sign out of Uspace?',
        confirmText: 'Sign Out',
        onConfirm: async () => {
          await SupabaseAPI.signOut();
          window.location.reload();
        }
      }
    }));
  };

  const dashboardLink = user?.role === 'landlord' ? '/landlord' : '/dashboard';

  return (
    <>
      <nav className="navbar" role="navigation">
        <div className="container navbar__inner">
          <Link to="/" className="navbar__logo" aria-label="Uspace, go to home">
            <img src="/logo-nobg.png" alt="" className="navbar__logo-img" width={44} height={44} decoding="async" />
            <span className="navbar__logo-text">
              U<span className="navbar__logo-dot">·</span>space
            </span>
          </Link>
          
          <div className="navbar__nav">
            <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
            {(!user || user.role !== 'landlord') && (
              <>
                <Link to="/browse" className={isActive('/browse') ? 'active' : ''}>Browse</Link>
                <a href="/#how-it-works" onClick={handleHowItWorks} style={{ cursor: 'pointer' }}>How it Works</a>
              </>
            )}
            {user?.role === 'landlord' && (
              <Link to="/landlord" className={isActive('/landlord') ? 'active' : ''}>Landlord Hub</Link>
            )}
            {!user && (
              <Link to="/landlord" className={isActive('/landlord') ? 'active' : ''}>For Landlords</Link>
            )}
          </div>

          <div className="navbar__actions">
            {user ? (
              <>
                <Link to={dashboardLink} className="btn btn-ghost btn-sm mobile-hide">My Space</Link>
                
                <button className="navbar__user-btn" onClick={() => setDropdownOpen(!dropdownOpen)} title="Profile Menu">
                  <div className="navbar__avatar">{user.initials}</div>
                  <span style={{ fontWeight: 600, fontSize: '.9rem' }} className="mobile-hide">{user.name}</span>
                </button>
                
                {dropdownOpen && (
                  <div className="navbar__dropdown" style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '12px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--bg-highlight)', 
                    borderRadius: 'var(--r-lg)', padding: '8px', zIndex: 100, minWidth: '180px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}>
                    <Link to={dashboardLink} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: 'var(--white)', borderRadius: '6px', textDecoration: 'none' }} className="dropdown-item">
                       <i className="ph ph-user"></i> My Dashboard
                    </Link>
                     <div style={{ height: '1px', background: 'var(--bg-highlight)', margin: '4px 0' }}></div>
                    <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#ff4444', background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', fontSize: '1rem' }} className="dropdown-item">
                       <i className="ph ph-sign-out"></i> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'login' } }))}>Sign In</button>
                <button type="button" className="btn btn-primary btn-sm navbar__btn-signup" onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'signup' } }))}>
                  <span className="navbar__signup-long">Sign Up Free</span>
                  <span className="navbar__signup-short">Join</span>
                </button>
              </>
            )}
            
            <button
              type="button"
              className="btn btn-ghost btn-sm navbar__menu-toggle"
              style={{ padding: '4px' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <i className="ph ph-x" style={{fontSize: '24px'}}></i> : <i className="ph ph-list" style={{fontSize: '24px'}}></i>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="navbar__mobile-menu" style={{
          position: 'fixed', top: '72px', left: 0, width: '100%',
          background: 'var(--bg-elevated)', borderBottom: '1px solid var(--bg-highlight)',
          padding: '20px', zIndex: 99, display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ph ph-house" style={{fontSize: '20px'}}></i> Home
          </Link>
          {(!user || user.role !== 'landlord') && (
            <Link to="/browse" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="ph ph-magnifying-glass" style={{fontSize: '20px'}}></i> Browse Spaces
            </Link>
          )}
          {user?.role === 'landlord' && (
            <Link to="/landlord" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="ph ph-briefcase" style={{fontSize: '20px'}}></i> Landlord Hub
            </Link>
          )}
          {!user && (
            <Link to="/landlord" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="ph ph-clipboard-text" style={{fontSize: '20px'}}></i> For Landlords
            </Link>
          )}
          {user ? (
            <Link to={dashboardLink} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="ph ph-user" style={{fontSize: '20px'}}></i> My Dashboard
            </Link>
          ) : (
            <>
              <button type="button" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setMobileMenuOpen(false); window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'login' } })); }}>
                Sign In
              </button>
              <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setMobileMenuOpen(false); window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'signup' } })); }}>
                Sign Up Free
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
