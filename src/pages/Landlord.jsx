import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SupabaseAPI } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const UNILUS_COORDS = { lat: -15.3522, lng: 28.4552 };

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  var R = 6371; 
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return Math.round(R * c * 1000); 
}

function deg2rad(deg) { return deg * (Math.PI/180); }

const AMENITIES_LIST = [
  { id: 'WiFi', icon: 'ph ph-wifi-high' },
  { id: 'Borehole Water', icon: 'ph ph-drop' },
  { id: 'Solar Backup', icon: 'ph ph-sun' },
  { id: '24/7 Security', icon: 'ph ph-lock-key' },
  { id: 'CCTV', icon: 'ph ph-camera' },
  { id: 'Shared Kitchen', icon: 'ph ph-cooking-pot' },
  { id: 'Study Room', icon: 'ph ph-books' },
  { id: 'Gym', icon: 'ph ph-barbell' },
  { id: 'Parking', icon: 'ph ph-car-profile' }
];

export default function Landlord() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('listings');
  
  // Data States
  const [listings, setListings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', price: '', area: '', distance: '', rooms: '', avail: '', desc: '', phone: '', deposit: '', roomTypes: []
  });
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [photos, setPhotos] = useState([]); // Array of { id, type: 'existing' | 'new', url, file? }
  
  // Map State
  const [mapPosition, setMapPosition] = useState(UNILUS_COORDS);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [geoLocating, setGeoLocating] = useState(false);

  const updateMapPin = (lat, lng) => {
    setMapPosition({ lat, lng });
    const dist = getDistanceFromLatLonInM(UNILUS_COORDS.lat, UNILUS_COORDS.lng, lat, lng);
    setDistanceMeters(dist);
    setFormData(prev => ({...prev, distance: dist < 1000 ? `${dist}m from Unilus` : `${(dist/1000).toFixed(1)}km from Unilus`}));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      window.dispatchEvent(new CustomEvent('show-dialog', { detail: { message: 'Geolocation is not supported by your browser.' } }));
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMapPin(latitude, longitude);
        setGeoLocating(false);
      },
      (error) => {
        setGeoLocating(false);
        let msg = 'Unable to retrieve your location.';
        if (error.code === 1) msg = 'Location permission denied. Please enable location access in your browser/device settings.';
        if (error.code === 2) msg = 'Location unavailable. Make sure GPS is enabled.';
        if (error.code === 3) msg = 'Location request timed out. Please try again.';
        window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Location Error', message: msg } }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  function MapUpdater({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
      if (center) map.flyTo(center, 14);
    }, [center, map]);
    return null;
  }

  function LocationMarker() {
    useMapEvents({
      click(e) {
        updateMapPin(e.latlng.lat, e.latlng.lng);
      },
    })
    return mapPosition === null ? null : <Marker position={mapPosition}></Marker>
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [listingsRes, enquiriesRes] = await Promise.all([
        SupabaseAPI.getUserListings(),
        SupabaseAPI.getLandlordEnquiries()
      ]);
      setListings(listingsRes.data || []);
      setEnquiries(enquiriesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const toggleAmenity = (val) => {
    if (selectedAmenities.includes(val)) {
      setSelectedAmenities(prev => prev.filter(a => a !== val));
    } else {
      setSelectedAmenities(prev => [...prev, val]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(f => ({
      id: Math.random().toString(),
      type: 'new',
      file: f,
      url: URL.createObjectURL(f)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const setAsCover = (index) => {
    if (index === 0) return;
    const newPhotos = [...photos];
    const [movedItem] = newPhotos.splice(index, 1);
    newPhotos.unshift(movedItem);
    setPhotos(newPhotos);
  };

  const submitListing = async () => {
    if (!formData.title || !formData.price || !formData.area || !formData.rooms) {
      window.dispatchEvent(new CustomEvent('show-dialog', { detail: { message: 'Please fill all required fields' } }));
      return;
    }
    
    setSubmitting(true);
    try {
      // Upload new files and build final array preserving order
      let FinalImageUrls = [];
      const newFilesToUpload = photos.filter(p => p.type === 'new').map(p => p.file);
      let uploadedNewUrls = [];
      
      if (newFilesToUpload.length > 0) {
        uploadedNewUrls = await SupabaseAPI.uploadPhotos(newFilesToUpload);
      }

      let newUploadIndex = 0;
      for (const p of photos) {
        if (p.type === 'existing') {
          FinalImageUrls.push(p.url);
        } else {
          if (uploadedNewUrls[newUploadIndex]) {
             FinalImageUrls.push(uploadedNewUrls[newUploadIndex]);
             newUploadIndex++;
          }
        }
      }

      if (FinalImageUrls.length === 0) FinalImageUrls.push('/assets/exterior1.png');

      let derivedPrice = parseInt(formData.price) || 0;
      if (formData.roomTypes && formData.roomTypes.length > 0) {
         let allPrices = formData.roomTypes.map(rt => parseInt(rt.price)).filter(p => !isNaN(p));
         if(parseInt(formData.price)) allPrices.push(parseInt(formData.price));
         if (allPrices.length > 0) derivedPrice = Math.min(...allPrices);
      }

      const payload = {
        title: formData.title,
        price_monthly: derivedPrice,
        security_deposit: parseInt(formData.deposit) || 0,
        area: formData.area,
        total_rooms: parseInt(formData.rooms),
        available_rooms: parseInt(formData.avail || 0),
        description: formData.desc,
        distance_text: formData.distance,
        distance_meters: distanceMeters || parseInt(formData.distance) || 0,
        amenities: selectedAmenities,
        images: FinalImageUrls,
        contact_number: formData.phone || null,
        room_types: formData.roomTypes || [],
        is_active: true
      };

      if (editingId) {
        const { error } = await SupabaseAPI.updateListing(editingId, payload);
        if (error) throw error;
      } else {
        payload.rating = 0; payload.review_count = 0;
        const { error } = await SupabaseAPI.addListing(payload);
        if (error) throw error;
      }

      window.dispatchEvent(new CustomEvent('show-dialog', { 
        detail: { title: 'Success', message: `Listing ${editingId ? 'updated' : 'created'} successfully!` } 
      }));

      // Reset and reload
      resetForm();
      fetchDashboardData();
      setActiveTab('listings');
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Error saving', message: err.message } }));
    } finally {
      setSubmitting(false);
    }
  };

  const editListing = (listing) => {
    setEditingId(listing.id);
    setFormData({
      title: listing.title || '', price: listing.price_monthly || '', area: listing.area || '', 
      distance: listing.distance_text || '', rooms: listing.total_rooms || '', avail: listing.available_rooms || '', 
      desc: listing.description || '', phone: listing.contact_number || '', deposit: listing.security_deposit || '',
      roomTypes: listing.room_types || []
    });
    setSelectedAmenities(listing.amenities || []);
    
    // Map existing images
    const existingPhotos = (listing.images || []).map(url => ({
       id: url, type: 'existing', url: url
    }));
    setPhotos(existingPhotos);
    
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteListing = async (id) => {
    window.dispatchEvent(new CustomEvent('show-dialog', {
      detail: {
        type: 'confirm',
        title: 'Delete Listing',
        message: 'Are you sure you want to permanently delete this listing?',
        confirmText: 'Delete',
        onConfirm: async () => {
          await SupabaseAPI.deleteListing(id);
          fetchDashboardData();
        }
      }
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', price: '', area: '', distance: '', rooms: '', avail: '', desc: '', phone: '', deposit: '', roomTypes: [] });
    setSelectedAmenities([]);
    setPhotos([]);
  };

  // ----- RENDERING -----

  if (authLoading) return <div style={{ padding: '100px', textAlign: 'center' }}><i className="ph ph-spinner ph-spin" style={{ fontSize: '2rem', color: 'var(--green)' }}></i></div>;

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>List your space directly to Unilus students</h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '40px' }}>Zero joining fees. Handled completely by you.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'signup' } }))}>Get Started Free</button>
          <button className="btn btn-outline btn-lg" onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { action: 'login' } }))}>Sign In</button>
        </div>
      </div>
    );
  }

  // Analytics derived data
  const totalRooms = listings.reduce((sum, l) => sum + (l.total_rooms || 0), 0);
  const availRooms = listings.reduce((sum, l) => sum + (l.available_rooms || 0), 0);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        
        {/* SIDEBAR */}
        <aside style={{ width: '250px', flexShrink: 0 }}>
          <div style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)', marginBottom: '16px' }}>
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px' }}>
               {user.initials}
             </div>
             <h3 style={{ marginBottom: '4px' }}>Landlord Portal</h3>
             <p className="text-muted" style={{ fontSize: '0.875rem' }}>{user.email}</p>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => {resetForm(); setActiveTab('add');}} className={`btn ${activeTab === 'add' ? 'btn-primary' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }}><i className="ph ph-plus" style={{ marginRight: '8px' }}></i> Add New Listing</button>
            <button onClick={() => setActiveTab('listings')} className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }}><i className="ph ph-clipboard-text" style={{ marginRight: '8px' }}></i> My Listings</button>
            <button onClick={() => setActiveTab('enquiries')} className={`btn ${activeTab === 'enquiries' ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }}><i className="ph ph-chat-circle-text" style={{ marginRight: '8px' }}></i> Enquiries</button>
            <button onClick={() => setActiveTab('analytics')} className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }}><i className="ph ph-chart-line-up" style={{ marginRight: '8px' }}></i> Analytics</button>
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, minWidth: 0 }}>

            {activeTab === 'add' && (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-highlight)', borderRadius: 'var(--r-xl)', padding: '32px' }}>
                 <h2 style={{ marginBottom: '24px' }}>{editingId ? 'Edit Listing' : 'Add New Listing'}</h2>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                   <div className="form-group"><label>Boarding House Name *</label><input id="title" value={formData.title} onChange={handleInputChange} className="form-input" /></div>
                   <div className="form-group"><label>Monthly Rent (K) *</label><input type="number" id="price" value={formData.price} onChange={handleInputChange} className="form-input" /></div>
                   <div className="form-group"><label>Security Deposit (K)</label><input type="number" id="deposit" value={formData.deposit} onChange={handleInputChange} className="form-input" placeholder="e.g. 500" /></div>
                   <div className="form-group"><label>Area / Street Name *</label><input id="area" value={formData.area} onChange={handleInputChange} className="form-input" /></div>
                   <div className="form-group"><label>Total Rooms *</label><input type="number" id="rooms" value={formData.rooms} onChange={handleInputChange} className="form-input" /></div>
                   <div className="form-group"><label>Available Rooms</label><input type="number" id="avail" value={formData.avail} onChange={handleInputChange} className="form-input" /></div>
                   <div className="form-group"><label>WhatsApp Number (Defaults to Profile if empty)</label><input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className="form-input" placeholder="+260..." /></div>
                   
                   <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                     <label>Alternative Room Options (Optional, e.g. Room for 3 at 1500)</label>
                     <div style={{ display: 'grid', gap: '8px', marginBottom: '8px' }}>
                       {formData.roomTypes && formData.roomTypes.map((rt, i) => (
                         <div key={i} style={{ display: 'flex', gap: '8px' }}>
                           <input type="text" placeholder="e.g. Room for 3" value={rt.name} onChange={e => {
                             const newRt = [...formData.roomTypes]; newRt[i].name = e.target.value; setFormData(prev => ({...prev, roomTypes: newRt}));
                           }} className="form-input" style={{flex: 1}} />
                           <input type="number" placeholder="Price (K)" value={rt.price} onChange={e => {
                             const newRt = [...formData.roomTypes]; newRt[i].price = e.target.value; setFormData(prev => ({...prev, roomTypes: newRt}));
                           }} className="form-input" style={{width: '120px'}} />
                           <button type="button" className="btn btn-outline" onClick={() => {
                             const newRt = formData.roomTypes.filter((_, idx) => idx !== i);
                             setFormData(prev => ({...prev, roomTypes: newRt}));
                           }} style={{color: '#ff4444', borderColor: 'rgba(255,0,0,0.3)', padding: '0 12px'}}><i className="ph ph-trash"></i></button>
                         </div>
                       ))}
                     </div>
                     <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormData(prev => ({...prev, roomTypes: [...(prev.roomTypes || []), {name: '', price: ''}]}))}>
                       + Add Another Room Option
                     </button>
                   </div>

                   <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                     <label>Location (Search or click on the map to set pin and auto-calculate distance)</label>
                     <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '8px'}}>{formData.distance || 'Please drop a pin on the map to set the distance from Unilus.'}</p>
                     
                     <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                       <input type="text" id="mapSearch" className="form-input" placeholder="Search for nearby places..." style={{ flex: 1, minWidth: '180px' }} onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById('mapSearchBtn').click();
                         }
                       }} />
                       <button type="button" id="mapSearchBtn" className="btn btn-outline" onClick={() => {
                          const val = document.getElementById('mapSearch').value;
                          if(val) {
                            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}`)
                              .then(r => r.json())
                              .then(data => {
                                if (data && data.length > 0) {
                                  const { lat, lon } = data[0];
                                  updateMapPin(parseFloat(lat), parseFloat(lon));
                                } else {
                                  window.dispatchEvent(new CustomEvent('show-dialog', { detail: { message: 'Place not found on map' } }));
                                }
                              });
                          }
                       }}>Search</button>
                       <button
                          type="button"
                          className="btn btn-primary"
                          disabled={geoLocating}
                          onClick={useCurrentLocation}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                        >
                          {geoLocating
                            ? <><i className="ph ph-spinner ph-spin"></i> Locating...</>
                            : <><i className="ph ph-crosshair"></i> Use Current Location</>
                          }
                        </button>
                     </div>

                     <div style={{ height: '240px', width: '100%', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--bg-highlight)' }}>
                       <MapContainer center={UNILUS_COORDS} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                         <MapUpdater center={mapPosition} />
                         <LocationMarker />
                       </MapContainer>
                     </div>
                   </div>
                 </div>
                 <div className="form-group" style={{ marginBottom: '32px' }}>
                   <label>Description *</label>
                   <textarea id="desc" rows="4" value={formData.desc} onChange={handleInputChange} className="form-input"></textarea>
                 </div>

                 <h3 style={{ marginBottom: '16px' }}>Amenities</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                   {AMENITIES_LIST.map(a => (
                     <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                       <input type="checkbox" checked={selectedAmenities.includes(a.id)} onChange={() => toggleAmenity(a.id)} style={{ accentColor: 'var(--green)', width: '18px', height: '18px' }} />
                       <i className={a.icon} style={{ color: 'var(--text-faint)' }}></i> {a.id}
                     </label>
                   ))}
                 </div>

                 <h3 style={{ marginBottom: '16px' }}>Photos (First photo is the cover)</h3>
                 <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                   {photos.map((p, i) => (
                     <div key={p.id} style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: i === 0 ? '2px solid var(--green)' : '1px solid var(--bg-highlight)' }}>
                       {i === 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--green)', color: '#000', fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', padding: '2px', zIndex: 1 }}>COVER</div>}
                       <img src={p.url} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       
                       {/* Overlay Actions */}
                       <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', ":hover": { opacity: 1 } }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                         {i !== 0 && (
                           <button onClick={(e) => { e.preventDefault(); setAsCover(i); }} style={{ background: 'var(--bg-elevated)', border: 'none', color: '#fff', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                             Set Cover
                           </button>
                         )}
                         <button onClick={(e) => { e.preventDefault(); removePhoto(i); }} style={{ background: '#ff4444', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                           <i className="ph ph-trash"></i>
                         </button>
                       </div>
                     </div>
                   ))}
                   <label style={{ width: '120px', height: '120px', borderRadius: '8px', border: '2px dashed var(--bg-highlight)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-faint)' }}>
                     <i className="ph ph-plus" style={{ fontSize: '1.5rem' }}></i>
                     <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Add Photo</span>
                     <input type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                   </label>
                 </div>

                 <button className="btn btn-primary btn-lg" onClick={submitListing} disabled={submitting}>
                   {submitting ? <i className="ph ph-spinner ph-spin"></i> : <i className="ph ph-check"></i>} 
                   {submitting ? ' Saving...' : (editingId ? ' Update Listing' : ' Publish Listing')}
                 </button>
              </div>
            )}

            {activeTab === 'listings' && (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-highlight)', borderRadius: 'var(--r-xl)', padding: '32px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                   <h2>My Listings</h2>
                   <button className="btn btn-primary" onClick={() => {resetForm(); setActiveTab('add');}}>+ Add New</button>
                 </div>
                 
                 {loadingData ? <div style={{ padding: '40px', textAlign: 'center' }}><i className="ph ph-spinner ph-spin" style={{ fontSize: '1.5rem', color: 'var(--green)' }}></i></div> :
                  listings.length === 0 ? <p className="text-muted">You have no active listings.</p> :
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {listings.map(l => (
                      <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-base)', border: '1px solid var(--bg-highlight)', borderRadius: 'var(--r-md)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                           <img src={l.images?.[0] || '/assets/exterior1.png'} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} alt="pic" />
                           <div>
                             <h4 style={{ margin: 0 }}>{l.title}</h4>
                             <p className="text-muted" style={{ fontSize: '0.875rem', margin: '4px 0 0' }}>K{l.price_monthly} • {l.available_rooms} rooms left</p>
                           </div>
                         </div>
                         <div style={{ display: 'flex', gap: '8px' }}>
                           <button className="btn btn-outline" onClick={() => editListing(l)}>Edit</button>
                           <button className="btn btn-outline" style={{ color: '#ff4444', borderColor: 'rgba(255,0,0,0.3)' }} onClick={() => deleteListing(l.id)}>Delete</button>
                         </div>
                      </div>
                    ))}
                  </div>
                 }
              </div>
            )}

            {activeTab === 'enquiries' && (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-highlight)', borderRadius: 'var(--r-xl)', padding: '32px' }}>
                 <h2 style={{ marginBottom: '24px' }}>Enquiries</h2>
                 {loadingData ? <div style={{ padding: '40px', textAlign: 'center' }}><i className="ph ph-spinner ph-spin" style={{ fontSize: '1.5rem', color: 'var(--green)' }}></i></div> :
                  enquiries.length === 0 ? <p className="text-muted">No student enquiries yet.</p> :
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--bg-highlight)' }}>
                        <th style={{ padding: '12px 0' }}>Student</th>
                        <th>Listing</th>
                        <th>Date</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enquiries.map(e => (
                        <tr key={e.id} style={{ borderBottom: '1px solid var(--bg-highlight)' }}>
                          <td style={{ padding: '16px 0', fontWeight: 600 }}>{e.profiles?.full_name || 'Anonymous'}</td>
                          <td>{e.listings?.title}</td>
                          <td className="text-muted">{new Date(e.created_at).toLocaleDateString()}</td>
                          <td>
                            {e.profiles?.phone_number ? (
                              <a href={`https://wa.me/${e.profiles.phone_number.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ color: 'var(--green)', borderColor: 'var(--green)' }}>
                                <i className="ph ph-whatsapp-logo" style={{ marginRight: '8px' }}></i> Message
                              </a>
                            ) : <span className="text-muted">No phone</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                 }
              </div>
            )}

            {activeTab === 'analytics' && (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-highlight)', borderRadius: 'var(--r-xl)', padding: '32px' }}>
                 <h2 style={{ marginBottom: '24px' }}>Analytics</h2>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
                   <div style={{ background: 'var(--bg-base)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                     <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--green)' }}>{listings.length}</div>
                     <div className="text-muted">Active Listings</div>
                   </div>
                   <div style={{ background: 'var(--bg-base)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                     <div style={{ fontSize: '3rem', fontWeight: 800, color: '#3b82f6' }}>{enquiries.length}</div>
                     <div className="text-muted">Total Enquiries</div>
                   </div>
                   <div style={{ background: 'var(--bg-base)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                     <div style={{ fontSize: '3rem', fontWeight: 800, color: '#eab308' }}>{totalRooms}</div>
                     <div className="text-muted">Total Rooms</div>
                   </div>
                   <div style={{ background: 'var(--bg-base)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                     <div style={{ fontSize: '3rem', fontWeight: 800, color: '#ec4899' }}>{availRooms}</div>
                     <div className="text-muted">Available Rooms</div>
                   </div>
                 </div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}
