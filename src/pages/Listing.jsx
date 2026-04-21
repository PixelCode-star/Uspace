import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SupabaseAPI } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Listing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Review State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);

  const hasPremiumAccess = user && (user.role === 'landlord' || user.hasPaid);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const triggerMobileMoneyPrompt = async () => {
    if (!mobileNumber || mobileNumber.length < 9) {
      window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Invalid Number', message: 'Please enter a valid 10-digit mobile money number (e.g., 096/097/095).' } }));
      return;
    }

    setProcessingPayment(true);

    // ==========================================
    // THIS IS WHERE YOU CONNECT THE SPARCO API LATER
    // For now, we mock the success of the MoMo Push prompt!
    // ==========================================
    
    // Simulate the time it takes for the user to approve the pin on their phone
    setTimeout(async () => {
      try {
        const { error } = await SupabaseAPI.unlockPremium();
        if (error) throw error;
        
        setProcessingPayment(false);
        setShowPaymentFlow(false);
        window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Payment Successful', message: 'K50 Received! Your premium access has been unlocked.' } }));
        setTimeout(() => window.location.reload(), 1500);
      } catch(err) {
        setProcessingPayment(false);
        window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Network Error', message: err.message } }));
      }
    }, 3000); // Exaggerated delay to simulate the USSD push to the user's phone
  };

  const handleUnlockClick = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'login' } }));
      return;
    }
    setShowPaymentFlow(true);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0 || !reviewComment.trim()) {
      window.dispatchEvent(new CustomEvent('show-dialog', { detail: { message: 'Please provide a rating and comment' } }));
      return;
    }
    setSubmittingReview(true);
    try {
      const { error } = await SupabaseAPI.addReview(listing.id, reviewRating, reviewComment.trim());
      if (error) throw error;
      setReviewModalOpen(false);
      setReviewRating(0);
      setReviewComment('');
      // Reload the listing to show new review
      const { data } = await SupabaseAPI.getListingById(id);
      setListing(data);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Error', message: err.message } }));
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data, error } = await SupabaseAPI.getListingById(id);
        if (error) throw error;
        setListing(data);
        
        if (user && data.available_rooms === 0) {
          const { data: waitl } = await SupabaseAPI.checkWaitlistStatus(data.id);
          setIsOnWaitlist(waitl);
        }
      } catch (err) {
        console.error(err);
        setError("Listing not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id, user]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--green)' }}><i className="ph ph-spinner ph-spin" style={{fontSize: '3rem'}}></i></div>;
  }

  if (error || !listing) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <i className="ph ph-warning" style={{ fontSize: '3rem', color: 'var(--text-faint)' }}></i>
        <h2 style={{ margin: '24px 0 16px' }}>{error || 'Listing not found'}</h2>
        <button onClick={() => navigate('/browse')} className="btn btn-outline">Back to Browse</button>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : ['/assets/exterior1.png'];

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '0', marginBottom: '24px', color: 'var(--text-muted)' }}>
        <i className="ph ph-arrow-left" style={{ marginRight: '8px' }}></i> Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '2.5rem' }}>{listing.title}</h1>
            {listing.is_verified && <span className="badge badge-verified" style={{ fontSize: '0.875rem' }}>✓ Verified</span>}
          </div>
          <p className="text-muted" style={{ fontSize: '1.125rem' }}><i className="ph ph-map-pin"></i> {listing.area} • {listing.distance_text}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>
            {listing.room_types && listing.room_types.length > 0 ? "From " : ""}K{listing.price_monthly?.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/month</span>
          </div>
          <div className="text-muted mt-2">
            <i className="ph-fill ph-star" style={{ color: 'var(--green)' }}></i> {listing.rating || 0} ({listing.review_count || 0} reviews)
          </div>
        </div>
      </div>

      {/* Hero Gallery */}
      <div style={{ marginBottom: '40px' }}>
        {/* Main Hero Image */}
        <div 
          style={{ position: 'relative', height: '460px', borderRadius: 'var(--r-xl)', overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-elevated)' }}
          onClick={() => { setCurrentImageIndex(0); setGalleryOpen(true); }}
        >
          <img 
            src={images[0]} 
            alt={listing.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
            className="hover-zoom"
          />
          {/* Dark gradient overlay at bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)', pointerEvents: 'none' }} />

          {/* "View all photos" pill button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(0); setGalleryOpen(true); }}
              style={{
                position: 'absolute', bottom: '20px', right: '20px',
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                borderRadius: '50px', padding: '10px 20px',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,215,96,0.85)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
            >
              <i className="ph ph-images" style={{ fontSize: '1.1rem' }}></i>
              View all {images.length} photos
            </button>
          )}

          {/* Photo count badge top-left */}
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted)',
            borderRadius: '50px', padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <i className="ph ph-camera" style={{ color: 'var(--green)' }}></i>
            {images.length} {images.length === 1 ? 'photo' : 'photos'}
          </div>
        </div>

        {/* Thumbnail Strip (shows if more than 1 photo) */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => { setCurrentImageIndex(i); setGalleryOpen(true); }}
                style={{
                  flexShrink: 0, width: '90px', height: '64px',
                  borderRadius: 'var(--r-md)', overflow: 'hidden',
                  cursor: 'pointer', border: '2px solid transparent',
                  transition: 'border-color 0.2s, transform 0.2s',
                  background: 'var(--bg-elevated)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <img src={img} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== AVAILABLE PLANS ===== */}
      {listing.room_types && listing.room_types.length > 0 && (() => {
        const phone = listing.contact_number || listing.profiles?.phone_number;
        const waBase = phone ? `https://wa.me/${phone.replace(/\D/g,'')}` : null;
        return (
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.75rem' }}>Available Plans</h2>
              <span style={{ background: 'rgba(30,215,96,0.15)', color: 'var(--green)', border: '1px solid rgba(30,215,96,0.3)', borderRadius: '50px', padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
                {listing.room_types.length} option{listing.room_types.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {listing.room_types.map((rt, i) => {
                const isLowest = rt.price === Math.min(...listing.room_types.map(r => Number(r.price)));
                const waMsg = waBase
                  ? `${waBase}?text=${encodeURIComponent(`Hi, I'm interested in the *${rt.name}* plan (K${rt.price}/month) at *${listing.title}*. Is it still available?`)}`
                  : null;
                return (
                  <div key={i} style={{
                    background: isLowest ? 'linear-gradient(135deg, rgba(30,215,96,0.12) 0%, rgba(30,215,96,0.04) 100%)' : 'var(--bg-elevated)',
                    border: isLowest ? '1.5px solid rgba(30,215,96,0.5)' : '1px solid var(--bg-highlight)',
                    borderRadius: 'var(--r-xl)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {isLowest && (
                      <div style={{
                        position: 'absolute', top: '-11px', left: '20px',
                        background: 'var(--green)', color: '#000',
                        fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '50px'
                      }}>Best Value</div>
                    )}
                    {/* Plan name */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{rt.name}</div>
                      {rt.description && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{rt.description}</div>
                      )}
                    </div>
                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: isLowest ? 'var(--green)' : 'var(--white)' }}>K{Number(rt.price).toLocaleString()}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/month</span>
                    </div>
                    {/* Deposit info if any */}
                    {listing.security_deposit > 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="ph ph-info"></i> + K{listing.security_deposit.toLocaleString()} deposit
                      </div>
                    )}
                    {/* CTA */}
                    {hasPremiumAccess && waMsg ? (
                      <a
                        href={waMsg}
                        target="_blank"
                        rel="noreferrer"
                        className={isLowest ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ textAlign: 'center', marginTop: 'auto' }}
                      >
                        <i className="ph ph-whatsapp-logo" style={{ marginRight: '8px', fontSize: '1.1rem' }}></i>
                        Enquire on WhatsApp
                      </a>
                    ) : (
                      <button
                        className={isLowest ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ marginTop: 'auto', background: !hasPremiumAccess ? 'var(--bg-highlight)' : undefined, color: !hasPremiumAccess ? 'var(--text-muted)' : undefined, borderColor: !hasPremiumAccess ? 'transparent' : undefined }}
                        onClick={() => {
                          if (!user) {
                            window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'login' } }));
                            return;
                          }
                          if (!hasPremiumAccess) {
                            handleUnlockClick();
                            return;
                          }
                          SupabaseAPI.requestBooking(listing.id, 'viewing');
                          window.dispatchEvent(new CustomEvent('show-dialog', { detail: { message: 'Viewing request sent! The landlord will contact you.' } }));
                        }}
                      >
                        {hasPremiumAccess ? 'Request Viewing' : <><i className="ph ph-lock-key"></i> Unlock Contact</>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        
        {/* Main Details */}
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>About this space</h3>
          <p className="text-muted" style={{ whiteSpace: 'pre-line', marginBottom: '32px' }}>{listing.description || 'No description provided.'}</p>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Amenities</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            {listing.amenities?.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="ph ph-check" style={{ color: 'var(--green)' }}></i>
                <span>{a}</span>
              </div>
            )) || <span className="text-muted">Not specified</span>}
          </div>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Rules & Details</h3>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)' }}>
            <li style={{ marginBottom: '8px' }}>Security Deposit: {listing.deposit ? `K${listing.deposit.toLocaleString()}` : listing.security_deposit > 0 ? `K${listing.security_deposit.toLocaleString()}` : 'None'}</li>
            <li style={{ marginBottom: '8px' }}>Available Rooms: {listing.available_rooms} / {listing.total_rooms}</li>
          </ul>
        </div>

        {/* Sidebar / CTA */}
        <div>
          <div style={{ background: 'var(--bg-elevated)', padding: '32px', borderRadius: 'var(--r-xl)', border: '1px solid var(--bg-highlight)', position: 'sticky', top: '100px' }}>
             <div style={{ marginBottom: '24px' }}>
               <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                 {listing.room_types && listing.room_types.length > 0 ? 'Starting from' : 'Monthly rent'}
               </div>
               <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>
                 K{listing.room_types && listing.room_types.length > 0
                   ? Math.min(...listing.room_types.map(r => Number(r.price))).toLocaleString()
                   : listing.price_monthly?.toLocaleString()}
                 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / month</span>
               </div>
               {listing.security_deposit > 0 && (
                 <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '6px' }}>
                   <i className="ph ph-lock-key" style={{ marginRight: '4px' }}></i>
                   K{listing.security_deposit.toLocaleString()} security deposit
                 </div>
               )}
               {listing.room_types && listing.room_types.length > 0 && (
                 <div style={{ marginTop: '4px', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
                   {listing.room_types.length} plan{listing.room_types.length !== 1 ? 's' : ''} available — see below
                 </div>
               )}
             </div>
             {listing.available_rooms === 0 ? (
               <button id="waitlistBtn" className="btn w-full" style={{ marginBottom: '16px', background: isOnWaitlist ? 'var(--bg-highlight)' : 'var(--bg-base)', border: '1px solid var(--green)', color: isOnWaitlist ? 'var(--white)' : 'var(--green)' }} onClick={async (e) => {
                 if(!user) {
                   window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'login' } }));
                   return;
                 }
                 if(isOnWaitlist) return; // already in waitlist
                 
                 const btn = e.currentTarget;
                 btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Subscribing...';
                 btn.disabled = true;
                 
                 const { error } = await SupabaseAPI.joinWaitlist(listing.id);
                 if (error && error.code !== '23505') { // 23505 is unique constraint violation
                   window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Error', message: error.message } }));
                   btn.innerHTML = '<i class="ph ph-bell-ringing"></i> Notify Me When Available';
                   btn.disabled = false;
                 } else {
                   setIsOnWaitlist(true);
                   window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Subscribed', message: 'You will receive a notification when a room becomes available!' } }));
                 }
               }}>
                 {isOnWaitlist ? <><i className="ph ph-check-circle"></i> Following for Updates</> : <><i className="ph ph-bell-ringing"></i> Notify Me When Available</>}
               </button>
             ) : (
               <button id="bookBtn" className="btn btn-primary w-full" style={{ marginBottom: '16px' }} onClick={async (e) => {
                 if(!user) {
                   window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'login' } }));
                   return;
                 }
                 const btn = e.currentTarget;
                 btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Sending...';
                 btn.disabled = true;
                 
                 const { error } = await SupabaseAPI.requestBooking(listing.id, 'viewing');
                 if (error) {
                   window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Booking Failed', message: error.message } }));
                   btn.innerHTML = 'Request to Book';
                   btn.disabled = false;
                 } else {
                   btn.innerHTML = '<i class="ph ph-check-circle"></i> Request Sent!';
                   btn.style.background = 'var(--bg-highlight)';
                   btn.style.color = 'var(--white)';
                 }
               }}>
                 Request to Book
               </button>
                        {hasPremiumAccess ? (
               <>
                 {listing.contact_number || listing.profiles?.phone_number ? (
                    <>
                      <a href={`https://wa.me/${(listing.contact_number || listing.profiles.phone_number).replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn btn-outline w-full" style={{ display: 'flex', marginBottom: '12px' }}>
                       <i className="ph ph-whatsapp-logo" style={{ marginRight: '8px', fontSize: '1.2rem', color: 'var(--green)' }}></i> WhatsApp Landlord
                      </a>
                      <div style={{ textAlign: 'center', color: 'var(--white)', fontSize: '1.1rem', fontWeight: 600, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--r-md)', marginBottom: '12px' }}>
                        <i className="ph ph-phone" style={{ marginRight: '8px', color: 'var(--text-muted)' }}></i>
                        {listing.contact_number || listing.profiles.phone_number}
                      </div>
                    </>
                 ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--r-md)', marginBottom: '12px' }}>
                      Phone number not provided
                    </div>
                 )}
                 <a href={`https://www.google.com/maps/dir/?api=1&destination=${(listing.latitude && listing.longitude) ? `${listing.latitude},${listing.longitude}` : encodeURIComponent((listing.area || 'Silverest') + ', Lusaka, Zambia')}&travelmode=walking`} target="_blank" rel="noreferrer" className="btn btn-outline w-full" style={{ display: 'flex' }}>
                   <i className="ph ph-person-simple-walk" style={{ marginRight: '8px', fontSize: '1.2rem', color: 'var(--green)' }}></i> Get Walking Directions
                 </a>
               </>
             ) : (
               <div style={{ background: 'rgba(30,215,96,0.1)', border: '1px solid var(--green)', padding: '20px', borderRadius: 'var(--r-md)', textAlign: 'center', marginTop: '16px' }}>
                 <i className="ph ph-lock-key" style={{ fontSize: '2.5rem', color: 'var(--green)', marginBottom: '12px' }}></i>
                 <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--white)' }}>Unlock Premium Details</div>
                 <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>Pay a one-time fee of <strong>K50</strong> to get direct landlord contact info, WhatsApp links, and exact walking directions.</div>
                 <button id="unlock-btn" className="btn btn-primary w-full" onClick={handleUnlockClick}>Pay K50 to Unlock</button>
               </div>
             )}
             
             {/* NATIVE SPARCO MOBILE MONEY CHECKOUT FLOW */}
             {showPaymentFlow && !hasPremiumAccess && (
               <div style={{ marginTop: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-highlight)', padding: '20px', borderRadius: 'var(--r-md)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                   <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Mobile Money Payment</h4>
                   <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={() => setShowPaymentFlow(false)}>✕</button>
                 </div>
                 <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Enter your MTN or Airtel Mobile Money number. A prompt will be sent instantly to your phone for the <strong>K50</strong> deduction.</p>
                 
                 <div className="form-group" style={{ marginBottom: '16px' }}>
                   <label>Mobile Money Number</label>
                   <div style={{ position: 'relative' }}>
                     <span style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }}>+260</span>
                     <input type="tel" className="form-input" placeholder="97XXXXXXX" maxLength="9" style={{ paddingLeft: '64px' }} value={mobileNumber} onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))} disabled={processingPayment} />
                   </div>
                 </div>
                 
                 <button className="btn btn-primary w-full" style={{ display: 'flex', justifyContent: 'center', background: 'var(--green)', color: '#000' }} onClick={triggerMobileMoneyPrompt} disabled={processingPayment}>
                   {processingPayment ? <><i className="ph ph-spinner ph-spin" style={{ marginRight: '8px' }}></i> Waiting for Phone Approval...</> : 'Send Payment Prompt to Phone'}
                 </button>
               </div>
             )}

             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--bg-highlight)' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                 {listing.profiles?.full_name?.charAt(0) || 'L'}
               </div>
               <div>
                 <div style={{ fontWeight: 600 }}>{listing.profiles?.full_name || 'Landlord'}</div>
                 <div className="text-muted" style={{ fontSize: '0.875rem' }}>Joined 2026</div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--bg-highlight)', paddingTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem' }}>Reviews</h2>
          {user && (
            <button className="btn btn-primary" onClick={() => setReviewModalOpen(true)}>
              Write a Review
            </button>
          )}
        </div>

        {!listing.reviews || listing.reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-xl)' }}>
            <p className="text-muted" style={{ marginBottom: user ? '16px' : 0 }}>No reviews yet. Be the first to review this space!</p>
            {!user && (
              <button className="btn btn-outline" onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'login' } }))}>
                Sign in to review
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {listing.reviews.map((r) => (
              <div key={r.id} style={{ background: 'var(--bg-elevated)', padding: '24px', borderRadius: 'var(--r-xl)', position: 'relative' }}>
                {user?.id === r.student_id && (
                  <button 
                    onClick={async () => {
                      if (window.confirm('Delete your review?')) {
                        const { error } = await SupabaseAPI.deleteReview(r.id);
                        if (error) {
                          window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Delete Failed', message: error.message } }));
                          return;
                        }
                        const { data } = await SupabaseAPI.getListingById(id);
                        setListing(data);
                      }
                    }}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '4px', opacity: 0.8, fontSize: '1.2rem' }}
                    title="Delete Review"
                  >
                    <i className="ph ph-trash"></i>
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {r.profiles?.full_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.profiles?.full_name || 'Student'}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ color: 'var(--green)', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <i key={star} className={star <= r.rating ? "ph-fill ph-star" : "ph ph-star"} style={{ marginRight: '2px' }}></i>
                  ))}
                </div>
                <p style={{ color: 'var(--text-muted)' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '32px', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: '500px', border: '1px solid var(--bg-highlight)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Write a Review</h3>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Rating</label>
              <div style={{ display: 'flex', gap: '8px', fontSize: '2rem', color: 'var(--green)' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <i 
                    key={star} 
                    className={star <= reviewRating ? "ph-fill ph-star" : "ph ph-star"} 
                    style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  ></i>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Your Experience</label>
              <textarea 
                className="form-input" 
                rows="4" 
                placeholder="What was it like living here? Describe the space, landlord, and area."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setReviewModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitReview} disabled={submittingReview}>
                {submittingReview ? <i className="ph ph-spinner ph-spin"></i> : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Gallery Modal */}
      {galleryOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Header */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-muted)' }}>{currentImageIndex + 1} / {images.length}</div>
            <button onClick={() => setGalleryOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }}>×</button>
          </div>
          
          {/* Main Image */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', padding: '20px' }}>
            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1)); }}
                style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className="ph ph-caret-left"></i>
              </button>
            )}
            
            <img src={images[currentImageIndex]} alt={`Gallery ${currentImageIndex}`} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />

            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0)); }}
                style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className="ph ph-caret-right"></i>
              </button>
            )}
          </div>

          {/* Thumbnails Row */}
          <div style={{ padding: '20px', display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '100%', scrollbarWidth: 'none' }}>
            {images.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                alt={`Thumb ${i}`} 
                onClick={() => setCurrentImageIndex(i)}
                style={{ 
                  width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer',
                  border: currentImageIndex === i ? '2px solid var(--green)' : '2px solid transparent',
                  opacity: currentImageIndex === i ? 1 : 0.5,
                  transition: 'all 0.2s'
                }} 
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .hover-zoom:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
