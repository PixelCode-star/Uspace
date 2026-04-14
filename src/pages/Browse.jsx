import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SupabaseAPI } from '../lib/supabase';
import ListingCard from '../components/ListingCard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const UNILUS_COORDS = { lat: -15.3560, lng: 28.4702 };

const CATEGORIES = [
  { icon: "ph ph-house", label: "Near Campus", filter: "distance", value: "300" },
  { icon: "ph ph-gender-female", label: "Female Only", filter: "amenity", value: "Female Only" },
  { icon: "ph ph-bus", label: "Transport Included", filter: "amenity", value: "Transport Included" },
  { icon: "ph ph-wifi-high", label: "WiFi Included", filter: "amenity", value: "WiFi" },
  { icon: "ph ph-currency-circle-dollar", label: "Budget Picks", filter: "maxPrice", value: "1200" },
  { icon: "ph-fill ph-check-circle", label: "Verified Only", filter: "verified", value: "true" }
];

export default function Browse() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Filters State
  const initialSearch = searchParams.get('search') || '';
  const initialMaxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice'), 10) : 3500;
  const initialVerified = searchParams.get('verified') === 'true';
  const initialDistance = searchParams.get('filter') === 'distance' ? parseInt(searchParams.get('value'), 10) : 99999;
  const initialAmenity = searchParams.get('filter') === 'amenity' ? [searchParams.get('value')] : [];

  const [search, setSearch] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [maxDistance, setMaxDistance] = useState(initialDistance);
  const [verified, setVerified] = useState(initialVerified);
  const [amenities, setAmenities] = useState(initialAmenity);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const { data } = await SupabaseAPI.searchListings({ search, maxPrice, maxDistance, verified, amenities });
        if (data) {
          const mapped = data.map(l => ({
            id: l.id,
            title: l.title,
            area: l.area,
            price: l.price_monthly,
            images: l.images && l.images.length > 0 ? l.images : ['/assets/exterior1.png'],
            distance: l.distance_text,
            distanceRaw: l.distance_meters,
            availableRooms: l.available_rooms,
            totalRooms: l.total_rooms,
            rating: l.rating,
            reviewCount: l.review_count,
            verified: l.is_verified,
            amenities: l.amenities || [],
            latitude: l.latitude,
            longitude: l.longitude,
            isFeatured: false
          }));
          setListings(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Add a small debounce for text search
    const timer = setTimeout(() => {
      fetchListings();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [search, maxPrice, maxDistance, verified, amenities]); // Re-fetch on filter change

  // Update URL Search Params slightly when core text search changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (search) newParams.set('search', search); else newParams.delete('search');
    setSearchParams(newParams, { replace: true });
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredListings = useMemo(() => {
    let result = [...listings]; // Make a copy for sorting

    if (sortBy === "price-asc")  result.sort((a,b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a,b) => b.price - a.price);
    else if (sortBy === "rating")     result.sort((a,b) => b.rating - a.rating);
    else if (sortBy === "distance")   result.sort((a,b) => a.distanceRaw - b.distanceRaw);

    return result;
  }, [listings, sortBy]);

  const toggleAmenity = (a) => {
    if (amenities.includes(a)) setAmenities(amenities.filter(x => x !== a));
    else setAmenities([...amenities, a]);
  };

  const clearFilters = () => {
    setSearch('');
    setMaxPrice(3500);
    setMaxDistance(99999);
    setVerified(false);
    setAmenities([]);
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Pills Banner */}
      <div className="browse-pills-strip">
        {CATEGORIES.map(cat => {
          let isActive = false;
          if (cat.filter === 'amenity' && amenities.includes(cat.value)) isActive = true;
          if (cat.filter === 'maxPrice' && maxPrice <= parseInt(cat.value)) isActive = true;
          if (cat.filter === 'verified' && verified) isActive = true;
          if (cat.filter === 'distance' && maxDistance <= parseInt(cat.value)) isActive = true;

          return (
            <button 
              key={cat.label} 
              className="badge" 
              style={{
                padding: '10px 20px', fontSize: '0.9rem', whiteSpace: 'nowrap', cursor: 'pointer',
                background: isActive ? 'var(--green)' : 'var(--bg-elevated)', 
                color: isActive ? '#000' : 'var(--white)',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                if (isActive) {
                   if (cat.filter === 'amenity') setAmenities(amenities.filter(a => a !== cat.value));
                   if (cat.filter === 'maxPrice') setMaxPrice(3500);
                   if (cat.filter === 'verified') setVerified(false);
                   if (cat.filter === 'distance') setMaxDistance(99999);
                } else {
                   if (cat.filter === 'amenity') setAmenities([...amenities, cat.value]);
                   if (cat.filter === 'maxPrice') setMaxPrice(parseInt(cat.value));
                   if (cat.filter === 'verified') setVerified(true);
                   if (cat.filter === 'distance') setMaxDistance(parseInt(cat.value));
                }
              }}
            >
              <i className={cat.icon} style={{marginRight: '8px'}}></i> {cat.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        
        {/* FILTERS SIDEBAR */}
        <aside style={{ width: '280px', flexShrink: 0, display: filtersOpen ? 'block' : 'none' }} className="filters-sidebar">
          <div style={{ background: 'var(--bg-elevated)', padding: '24px', borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Filters</h3>
              <button className="text-muted" onClick={clearFilters} style={{ fontSize: '0.875rem' }}>Clear all</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '16px' }}>Max Price: K{maxPrice.toLocaleString()}</h4>
              <input type="range" min="500" max="3500" step="100" value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--green)' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '16px' }}>Distance: {maxDistance < 99999 ? `${maxDistance}m` : 'Any'}</h4>
              <input type="range" min="100" max="3000" step="100" value={maxDistance > 3000 ? 3000 : maxDistance} onChange={e => setMaxDistance(parseInt(e.target.value) >= 3000 ? 99999 : parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--green)' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--green)' }} />
                <span>Verified Only <i className="ph-fill ph-check-circle" style={{color: 'var(--green)'}}></i></span>
              </label>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '16px' }}>Amenities & Rules</h4>
              {['WiFi', 'Female Only', 'Male Only', 'Transport Included', 'Meals Provided', 'Solar Backup', 'Borehole Water', '24/7 Security', 'Study Room', 'Shared Kitchen'].map(a => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} style={{ width: '18px', height: '18px', accentColor: 'var(--green)' }} />
                  <span className="text-muted">{a}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN RESULTS FEED */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div className="browse-toolbar__search-row">
              <div className="browse-toolbar__field-wrap" style={{ position: 'relative' }}>
                <i className="ph ph-magnifying-glass" style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }}></i>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search boarding names or areas..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '44px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <button type="button" className="btn btn-outline browse-toolbar__filters-btn" onClick={() => setFiltersOpen(!filtersOpen)} style={{ padding: '0 20px' }}>
                 <i className="ph ph-sliders-horizontal" style={{ marginRight: '8px' }}></i> Filters
              </button>
            </div>

            <div className="browse-toolbar__meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-muted" style={{ marginRight: 'auto' }}>{filteredListings.length} space{filteredListings.length !== 1 ? 's' : ''} found</span>
              
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: 'var(--r-md)' }}>
                <button type="button" className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'} btn-sm`} style={{ padding: '6px 12px' }} onClick={() => setViewMode('list')}>
                  <i className="ph ph-list-dashes"></i> List
                </button>
                <button type="button" className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-ghost'} btn-sm`} style={{ padding: '6px 12px' }} onClick={() => setViewMode('map')}>
                  <i className="ph ph-map-trifold"></i> Map
                </button>
              </div>

              <div className="browse-toolbar__sort">
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>Sort by:</span>
                <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '8px 28px 8px 16px', maxWidth: 'min(100%, 280px)' }}>
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="rating">Top Rated</option>
                  <option value="distance">Closest to Campus</option>
                </select>
              </div>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div style={{ height: '70vh', width: '100%', borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1px solid var(--bg-highlight)' }}>
              <MapContainer center={UNILUS_COORDS} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={UNILUS_COORDS} zIndexOffset={1000}>
                  <Popup>
                    <div style={{ fontWeight: 800, color: 'var(--green)' }}>Universiy of Lusaka</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Silverest Campus</div>
                  </Popup>
                </Marker>
                {filteredListings.map(listing => {
                  if (!listing.latitude || !listing.longitude) return null;
                  return (
                    <Marker key={listing.id} position={{ lat: listing.latitude, lng: listing.longitude }}>
                      <Popup className="listing-popup">
                        <div style={{ width: '200px', cursor: 'pointer' }} onClick={() => navigate(`/listing/${listing.id}`)}>
                          <img src={listing.images[0]} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px 8px 0 0', display: 'block' }} />
                          <div style={{ padding: '8px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{listing.title}</div>
                            <div style={{ color: 'var(--green)', fontWeight: 800 }}>K{listing.price.toLocaleString()}/mo</div>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>{listing.distance}</div>
                            <button className="btn btn-primary btn-sm mt-2 w-full" style={{ padding: '4px' }}>View Details</button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          ) : (
            <div className="listing-grid">
              {loading ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'var(--green)' }}>
                  <i className="ph ph-spinner ph-spin" style={{ fontSize: '2.5rem' }}></i>
                </div>
              ) : filteredListings.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)' }}>
                   <i className="ph ph-house" style={{ fontSize: '3rem', color: 'var(--text-faint)', marginBottom: '16px' }}></i>
                   <h3>No listings match your filters</h3>
                   <p className="text-muted mt-4 mb-6">Try adjusting your search or removing some filters.</p>
                   <button className="btn btn-outline" style={{ marginTop: '24px' }} onClick={clearFilters}>Clear All Filters</button>
                </div>
              ) : (
                filteredListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              )}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @media (min-width: 900px) {
          .filters-sidebar { display: block !important; }
        }
      `}</style>
    </div>
  );
}
