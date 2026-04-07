import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ListingCard({ listing, linkPrefix = '' }) {
  const { isSaved, toggleSave } = useAuth();
  const navigate = useNavigate();
  
  const saved = isSaved(listing.id);
  const cardLink = `${linkPrefix}/listing/${listing.id}`;

  const formatPrice = (p) => "K" + p.toLocaleString();

  const handleSaveClick = (e) => {
    e.stopPropagation();
    // In a real app we'd dispatch auth modal open event here if not logged in
    // For now we just assume auth toggle handles it
    const nowSaved = toggleSave(listing.id);
    const btn = e.currentTarget;
    btn.classList.add('animating');
    btn.addEventListener('animationend', () => btn.classList.remove('animating'), { once: true });
    // TOAST NOTIFICATION logic would go here
  };

  return (
    <div className="listing-card page-enter" onClick={() => navigate(cardLink)}>
      <div className="listing-card__body" style={{ padding: '14px 16px 8px', textAlign: 'center' }}>
        <div className="listing-card__title" style={{ fontSize: '1.05rem', marginBottom: '4px', textTransform: 'capitalize' }}>{listing.title?.toLowerCase()}</div>
        <div className="listing-card__area" style={{ marginBottom: 0 }}>{listing.area}</div>
      </div>
      <div className="listing-card__img-wrap">
        <img className="listing-card__img" src={listing.images?.[0] || '/assets/exterior1.png'} alt={listing.title} loading="lazy" />
        <div className="listing-card__badges">
          {listing.verified && <span className="badge badge-verified">✓ Verified</span>}
          {listing.tag && <span className="badge badge-new">{listing.tag}</span>}
          {listing.availableRooms === 0 && <span className="badge badge-full">Full</span>}
        </div>
        <button 
          className={`listing-card__save ${saved ? 'saved' : ''}`}
          onClick={handleSaveClick}
          title={saved ? 'Remove from saved' : 'Save listing'}
        >
          {saved ? <i className="ph-fill ph-heart"></i> : <i className="ph ph-heart"></i>}
        </button>
      </div>
      <div className="listing-card__body" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <span><i className="ph ph-map-pin"></i> {listing.distance || 'Silverest'}</span>
          <span>
            <i className="ph-fill ph-star" style={{color: 'var(--green)', marginRight: '4px'}}></i> 
            {listing.reviewCount > 0 ? `${listing.rating} (${listing.reviewCount})` : 'New'}
          </span>
        </div>
        <div className="listing-card__footer" style={{ justifyContent: 'center' }}>
          <div className="listing-card__price">{formatPrice(listing.price)} <span>/month</span></div>
          <span className="badge" style={{marginLeft: '12px', background: 'var(--bg-highlight)'}}>{listing.availableRooms} room{listing.availableRooms !== 1 ? 's' : ''} left</span>
        </div>
      </div>
    </div>
  );
}
