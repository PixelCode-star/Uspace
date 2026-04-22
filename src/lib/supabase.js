import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SupabaseAPI = {
  // --- AUTHENTICATION ---
  async signUp(email, password, fullName, role = 'student', phoneNumber = '') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          ...(phoneNumber ? { phone_number: phoneNumber.trim() } : {})
        }
      }
    });
    
    // Also sync role to profiles table for the secure_listings view
    if (!error && data?.user) {
      await supabase
        .from('profiles')
        .update({ role })
        .eq('id', data.user.id);
    }
    
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  // --- LISTINGS ---
  async getFeaturedListings() {
    const { data, error } = await supabase
      .from('secure_listings')
      .select('*, profiles(full_name, phone_number)')
      .eq('is_active', true)
      .order('rating', { ascending: false, nullsFirst: false }) // Prioritize rated properties
      .limit(6);
    return { data, error };
  },

  async searchListings({ search, maxPrice, maxDistance, verified, amenities }) {
    let query = supabase
      .from('secure_listings')
      .select('*, profiles(full_name, phone_number)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Server-side filtering
    if (search) {
      query = query.or(`title.ilike.%${search}%,area.ilike.%${search}%`);
    }
    if (maxPrice && maxPrice < 5000) { // arbitrary high bound from UI
      query = query.lte('price_monthly', maxPrice);
    }
    if (verified) {
      query = query.eq('is_verified', true);
    }
    if (maxDistance && maxDistance < 99999) {
      query = query.lte('distance_meters', maxDistance);
    }
    if (amenities && amenities.length > 0) {
      // Postgres array contains operator: ?
      // Wait, we can use filter in client side for nested JSON arrays if type is JSONB, or we can use .contains('amenities', amenities) if it's a postgres array.
      // We'll just fetch bounded and filter amenities client side to be safe if schema type is unknown.
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getAllListings() {
    const { data, error } = await supabase
      .from('secure_listings')
      .select('*, profiles(full_name, phone_number)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getListingById(id) {
    const { data, error } = await supabase
      .from('secure_listings')
      .select('*, profiles(full_name, phone_number), reviews(*, profiles(full_name, avatar_url))')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // --- ACTIONS ---
  async requestBooking(listingId, type) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { error: { message: "Not logged in" } };
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ listing_id: listingId, student_id: user.user.id, type: type }]);
    return { data, error };
  },

  async addReview(listingId, rating, comment) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { error: { message: "Not logged in" } };
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ listing_id: listingId, student_id: user.user.id, rating, comment }]);
    return { data, error };
  },

  async deleteReview(reviewId) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { error: { message: "Not logged in" } };
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('student_id', user.user.id);
    return { error };
  },

  async getStudentBookings() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: [] };
    const { data, error } = await supabase
      .from('bookings')
      .select('*, listings(title, area, profiles(full_name))')
      .eq('student_id', user.user.id)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getListingsByIds(ids) {
    if (!ids || ids.length === 0) return { data: [] };
    const { data, error } = await supabase
      .from('secure_listings')
      .select('*')
      .in('id', ids);
    return { data, error };
  },

  async joinWaitlist(listingId) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { error: { message: "Not logged in" } };
    const { data, error } = await supabase
      .from('waitlists')
      .insert([{ student_id: user.user.id, listing_id: listingId }]);
    return { data, error };
  },

  async checkWaitlistStatus(listingId) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: false };
    const { data, error } = await supabase
      .from('waitlists')
      .select('id')
      .eq('student_id', user.user.id)
      .eq('listing_id', listingId)
      .single();
    
    // If we find a row, the status is true
    return { data: !!data, error: null };
  },

  // --- LANDLORD ACTIONS ---
  async addListing(listingData) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { error: { message: "Not logged in" } };
    const { data, error } = await supabase.from('listings').insert([{ ...listingData, landlord_id: user.user.id }]).select();
    return { data, error };
  },

  async uploadPhotos(files) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    const urls = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `property-images/${fileName}`;
      
      try {
        const { data, error } = await supabase.storage.from('listings').upload(filePath, file);
        if (error) {
          throw error;
        }
        if (data) {
          const { data: publicUrlData } = supabase.storage.from('listings').getPublicUrl(filePath);
          if (publicUrlData && publicUrlData.publicUrl) {
            urls.push(publicUrlData.publicUrl);
          }
        }
      } catch (e) {
        console.error('Storage upload failed:', e);
        throw new Error('Failed to upload images. Please check if Supabase Storage is configured.');
      }
    }
    return urls;
  },

  async getUserListings() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: [] };
    const { data, error } = await supabase.from('listings').select('*').eq('landlord_id', user.user.id).order('created_at', { ascending: false });
    return { data, error };
  },

  async getLandlordEnquiries() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: [] };
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, phone_number), listings!inner(title, landlord_id)')
      .eq('listings.landlord_id', user.user.id)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async deleteListing(listingId) {
    const { error } = await supabase.from('listings').delete().eq('id', listingId);
    return { error };
  },

  // --- PROFILE ---
  async unlockPremium() {
    // Update auth metadata (for frontend state)
    const { data, error } = await supabase.auth.updateUser({
      data: { has_paid: true }
    });
    if (error) return { data, error };
    
    // ALSO update profiles table (for secure_listings view)
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      await supabase
        .from('profiles')
        .update({ has_paid: true })
        .eq('id', userData.user.id);
    }
    return { data, error };
  },

  async updateProfile(updates) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { error: { message: "Not logged in" } };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.user.id)
      .select();
    return { data, error };
  },

  async updateListing(listingId, updates) {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select();
    return { data, error };
  }
};
