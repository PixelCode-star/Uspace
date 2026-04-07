import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SupabaseAPI } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';

export default function Dashboard() {
  const { user, loading: authLoading, savedListings } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('saved');
  const [savedData, setSavedData] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingContent(true);
      try {
        if (activeTab === 'saved') {
          if (savedListings.length > 0) {
            const { data } = await SupabaseAPI.getListingsByIds(savedListings);
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
              setSavedData(mapped);
            } else {
              setSavedData([]);
            }
          } else {
            setSavedData([]);
          }
        } else if (activeTab === 'bookings') {
          const { data } = await SupabaseAPI.getStudentBookings();
          setBookings(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchData();
  }, [user, activeTab, savedListings]); // Re-fetch saved when array changes

  if (authLoading || !user) return <div style={{ padding: '100px', textAlign: 'center' }}><i className="ph ph-spinner ph-spin" style={{ fontSize: '2rem', color: 'var(--green)' }}></i></div>;

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--green)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800 }}>
          {user.initials}
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Welcome, {user.name}</h1>
          <p className="text-muted">{user.email}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--bg-highlight)', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('saved')}
          style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 600, borderBottom: activeTab === 'saved' ? '2px solid var(--green)' : '2px solid transparent', color: activeTab === 'saved' ? 'var(--white)' : 'var(--text-muted)' }}
        >Saved Spaces ({savedListings.length})</button>
        <button 
          onClick={() => setActiveTab('bookings')}
          style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 600, borderBottom: activeTab === 'bookings' ? '2px solid var(--green)' : '2px solid transparent', color: activeTab === 'bookings' ? 'var(--white)' : 'var(--text-muted)' }}
        >My Bookings</button>
      </div>

      {loadingContent ? (
         <div style={{ padding: '60px', textAlign: 'center' }}><i className="ph ph-spinner ph-spin" style={{ fontSize: '2rem', color: 'var(--green)' }}></i></div>
      ) : activeTab === 'saved' ? (
         savedData.length === 0 ? (
           <div style={{ background: 'var(--bg-elevated)', padding: '60px 20px', textAlign: 'center', borderRadius: 'var(--r-xl)' }}>
             <i className="ph ph-heart" style={{ fontSize: '3rem', color: 'var(--text-faint)', marginBottom: '16px' }}></i>
             <h3>No saved spaces yet</h3>
             <p className="text-muted mt-4 mb-6">Explore listings and click the heart icon to save them here.</p>
             <button onClick={() => navigate('/browse')} className="btn btn-primary mt-4">Browse Spaces</button>
           </div>
         ) : (
           <div className="listing-grid">
             {savedData.map(l => <ListingCard key={l.id} listing={l} />)}
           </div>
         )
      ) : (
         bookings.length === 0 ? (
           <div style={{ background: 'var(--bg-elevated)', padding: '60px 20px', textAlign: 'center', borderRadius: 'var(--r-xl)' }}>
             <i className="ph ph-calendar-blank" style={{ fontSize: '3rem', color: 'var(--text-faint)', marginBottom: '16px' }}></i>
             <h3>No booking requests</h3>
             <p className="text-muted mt-4">When you request a viewing, it will appear here.</p>
           </div>
         ) : (
           <div style={{ display: 'grid', gap: '16px' }}>
             {bookings.map(book => (
               <div key={book.id} style={{ background: 'var(--bg-elevated)', padding: '24px', borderRadius: 'var(--r-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <div style={{ display: 'inline-block', background: 'var(--bg-highlight)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '8px', color: 'var(--green)' }}>{book.status?.toUpperCase() || 'PENDING'}</div>
                   <h4 style={{ fontSize: '1.125rem' }}>{book.listings?.title}</h4>
                   <p className="text-muted" style={{ fontSize: '0.875rem' }}>{book.listings?.area}</p>
                 </div>
                 <div className="text-muted" style={{ fontSize: '0.875rem', textAlign: 'right' }}>
                   Requested on<br/>
                   {new Date(book.created_at).toLocaleDateString()}
                 </div>
               </div>
             ))}
           </div>
         )
      )}
    </div>
  );
}
