import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupabaseAPI } from '../lib/supabase';
import ListingCard from '../components/ListingCard';



export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await SupabaseAPI.getFeaturedListings();
        if (data && data.length > 0) {
          const mapped = data.map(l => ({
            id: l.id,
            title: l.title,
            area: l.area,
            price: l.price_monthly,
            images: l.images && l.images.length > 0 ? l.images : ['/assets/exterior1.png'],
            distance: l.distance_text,
            availableRooms: l.available_rooms,
            totalRooms: l.total_rooms,
            rating: l.rating,
            reviewCount: l.review_count,
            verified: l.is_verified
          }));
          setFeatured(mapped);
        } else {
          setFeatured([]);
        }
      } catch (err) {
        console.error(err);
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
    
    // Simple intersection observer for reveal animations
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    
    return () => obs.disconnect();
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (maxPrice) params.set('maxPrice', maxPrice);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <>
      {/* ========== HERO ========== */}
      <section className="hero" style={{ 
        position: 'relative', 
        padding: '140px 0 120px', 
        textAlign: 'center',
        background: 'url(/assets/hero-bg.png) center/cover no-repeat',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, rgba(8,8,8,0.7) 0%, var(--bg-base) 100%)',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(30,215,96,0.3) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.875rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--green)', borderRadius: '50%', margin: '0 8px 1px 0' }}></span>
            Student built · for students · Silverest, Lusaka
          </div>
          <h1 style={{ marginBottom: '24px', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', maxWidth: '900px', margin: '0 auto' }}>
            Find your next<br/><em style={{fontStyle: 'normal', color: 'var(--green)'}}>boarding house</em>
          </h1>
          <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '24px auto 40px' }}>
            Browse verified boarding houses near Unilus School of Medicine. Real photos, real reviews, no WhatsApp chaos.
          </p>
          
          {/* Search bar */}
          <form
            className="search-bar search-bar--hero"
            onSubmit={handleSearch}
            style={{
              background: 'var(--bg-elevated)',
              marginBottom: '40px',
              border: '1px solid var(--bg-highlight)',
            }}
          >
            <div className="search-bar__row search-bar__row--query">
              <span className="search-bar__icon" aria-hidden>
                <i className="ph ph-magnifying-glass"></i>
              </span>
              <input
                className="search-bar__field"
                type="search"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area or boarding name..."
                autoComplete="off"
              />
            </div>
            <div className="search-bar__row search-bar__row--actions">
              <label className="search-bar__price-label">
                <span className="visually-hidden">Max monthly price</span>
                <select
                  className="search-bar__select"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                >
                  <option value="">Any Price</option>
                  <option value="1000">Under K1,000</option>
                  <option value="1500">Under K1,500</option>
                  <option value="2000">Under K2,000</option>
                  <option value="2500">Under K2,500</option>
                  <option value="3500">Under K3,500</option>
                </select>
              </label>
              <button type="submit" className="btn btn-primary search-bar__submit">
                Search
              </button>
            </div>
          </form>

          {/* Category pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            <a href="/browse?filter=distance&value=300" className="badge" style={{padding: '8px 16px', fontSize: '0.9rem'}}><i className="ph ph-house" style={{color: 'var(--green)', marginRight: '6px'}}></i> Near Campus</a>
            <a href="/browse?filter=amenity&value=WiFi" className="badge" style={{padding: '8px 16px', fontSize: '0.9rem'}}><i className="ph ph-wifi-high" style={{color: 'var(--green)', marginRight: '6px'}}></i> WiFi Included</a>
            <a href="/browse?filter=amenity&value=Borehole+Water" className="badge" style={{padding: '8px 16px', fontSize: '0.9rem'}}><i className="ph ph-drop" style={{color: 'var(--green)', marginRight: '6px'}}></i> Borehole Water</a>
            <a href="/browse?maxPrice=1200" className="badge" style={{padding: '8px 16px', fontSize: '0.9rem'}}><i className="ph ph-currency-circle-dollar" style={{color: 'var(--green)', marginRight: '6px'}}></i> Budget Picks</a>
            <a href="/browse?verified=true" className="badge" style={{padding: '8px 16px', fontSize: '0.9rem'}}><i className="ph-fill ph-check-circle" style={{color: 'var(--green)', marginRight: '6px'}}></i> Verified Only</a>
          </div>
        </div>
      </section>

      {/* ========== FEATURED LISTINGS ========== */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--bg-highlight)' }}>
        <div className="container">
          <div className="section-header reveal" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem' }}>Featured Spaces</h2>
            <p className="text-muted mt-4" style={{ maxWidth: '520px', margin: '0 auto' }}>Hand-picked, verified spaces loved by your fellow students. All within walking distance of campus.</p>
          </div>
          
          <div className="listing-grid">
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--green)' }}>
                <i className="ph ph-spinner ph-spin" style={{ fontSize: '2rem' }}></i>
              </div>
            ) : featured.length === 0 ? (
              <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)' }}>No featured spaces available right now.</div>
            ) : (
              featured.map((listing, i) => (
                <div key={listing.id} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <ListingCard listing={listing} />
                </div>
              ))
            )}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button onClick={() => navigate('/browse')} className="btn btn-outline btn-lg">Browse All Spaces →</button>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section style={{ padding: '80px 0', background: 'var(--bg-elevated)', borderTop: '1px solid var(--bg-highlight)' }} id="how-it-works">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem' }}>Finding a room shouldn't be hard</h2>
            <p className="text-muted mt-4">No more scrolling Facebook groups. No more getting scammed. Just Uspace.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            <div className="reveal" style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-base)', borderRadius: 'var(--r-2xl)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--bg-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--green)', fontSize: '2rem' }}><i className="ph ph-magnifying-glass"></i></div>
              <h3>Browse & Filter</h3>
              <p className="text-muted mt-4">Search by price, distance from campus, amenities — or just scroll the feed like Instagram. No login needed.</p>
            </div>
            <div className="reveal" style={{ transitionDelay: '0.1s', textAlign: 'center', padding: '32px', background: 'var(--bg-base)', borderRadius: 'var(--r-2xl)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--bg-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--green)', fontSize: '2rem' }}><i className="ph ph-calendar-blank"></i></div>
              <h3>Book a Viewing</h3>
              <p className="text-muted mt-4">Found something you like? Book a free viewing or WhatsApp the landlord directly. Quick, easy, no middleman.</p>
            </div>
            <div className="reveal" style={{ transitionDelay: '0.2s', textAlign: 'center', padding: '32px', background: 'var(--bg-base)', borderRadius: 'var(--r-2xl)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--bg-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--green)', fontSize: '2rem' }}><i className="ph ph-house"></i></div>
              <h3>Move In & Review</h3>
              <p className="text-muted mt-4">Move in, settle in, then leave an honest review to help your fellow students make the right choice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TRUST SECTION ========== */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--bg-highlight)' }}>
        <div className="container">
          <div className="section-header text-center reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem' }}>Built on trust. Built by students.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            <div className="reveal" style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-2xl)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--bg-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--green)', fontSize: '2rem' }}><i className="ph-fill ph-check-circle"></i></div>
              <h3>Verified Landlords</h3>
              <p className="text-muted mt-4">Every landlord with the ✓ badge has been checked by our team. No scams, no fake listings — just honest spaces.</p>
            </div>
            <div className="reveal" style={{ transitionDelay: '0.1s', textAlign: 'center', padding: '32px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-2xl)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--bg-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--green)', fontSize: '2rem' }}><i className="ph-fill ph-star"></i></div>
              <h3>Student Reviews</h3>
              <p className="text-muted mt-4">Real ratings from real Unilus students who actually lived there. Read their experience before you sign anything.</p>
            </div>
            <div className="reveal" style={{ transitionDelay: '0.2s', textAlign: 'center', padding: '32px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-2xl)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--bg-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--green)', fontSize: '2rem' }}><i className="ph ph-confetti"></i></div>
              <h3>Free to List — Always</h3>
              <p className="text-muted mt-4">Landlords can list their spaces for free during our Early Access phase. Help students find you, at zero cost.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div className="reveal" style={{ 
            background: 'linear-gradient(135deg, rgba(30,215,96,0.2) 0%, rgba(30,215,96,0.05) 100%)', 
            border: '1px solid var(--green)',
            borderRadius: 'var(--r-2xl)', 
            padding: '56px 48px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: '32px', 
            flexWrap: 'wrap' 
          }}>
            <div>
              <h2 style={{ color: 'white', marginBottom: '10px' }}>Are you a landlord?</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '460px' }}>List your boarding house on Uspace for <strong style={{ color: 'var(--white)' }}>FREE</strong> during Early Access. Reach thousands of Unilus students without lifting a finger.</p>
            </div>
            <button onClick={() => navigate('/landlord')} className="btn btn-primary btn-lg" style={{ flexShrink: 0 }}>List Your Space Free →</button>
          </div>
        </div>
      </section>
    </>
  );
}
