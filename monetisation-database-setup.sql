-- ==========================================
-- USPACE MONETISATION SCHEMA UPDATES
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Add `has_paid` to your physical profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT false;

-- 2. Create a secure view to protect the raw contact numbers and GPS coordinates
-- This ensures that even if a student inspects the network tab, the data physically isn't there unless paid.
CREATE OR REPLACE VIEW public.secure_listings AS 
SELECT 
  l.id,
  l.landlord_id,
  l.title,
  l.description,
  l.price_monthly,
  l.security_deposit,
  l.area,
  l.distance_meters,
  l.distance_text,
  l.total_rooms,
  l.available_rooms,
  l.amenities,
  l.images,
  l.room_types,
  l.rating,
  l.review_count,
  l.is_verified,
  l.is_active,
  l.created_at,
  -- Secure Columns below:
  CASE 
    WHEN auth.uid() = l.landlord_id THEN l.contact_number 
    WHEN (SELECT has_paid FROM public.profiles WHERE id = auth.uid()) = true THEN l.contact_number 
    ELSE NULL 
  END as contact_number,
  
  CASE 
    WHEN auth.uid() = l.landlord_id THEN l.latitude 
    WHEN (SELECT has_paid FROM public.profiles WHERE id = auth.uid()) = true THEN l.latitude 
    ELSE NULL 
  END as latitude,
  
  CASE 
    WHEN auth.uid() = l.landlord_id THEN l.longitude 
    WHEN (SELECT has_paid FROM public.profiles WHERE id = auth.uid()) = true THEN l.longitude 
    ELSE NULL 
  END as longitude
FROM public.listings l;

-- 3. Grant public read access to our new secure view
GRANT SELECT ON public.secure_listings TO authenticated, anon;

-- 4. Create an RPC Function for your Webhook
-- Your Flutterwave/Paystack Edge Function will simply call this SQL function.
-- It securely updates the database AND the auth.users metadata together.
CREATE OR REPLACE FUNCTION public.mark_user_paid(student_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Sync physical profile
  UPDATE public.profiles
  SET has_paid = true
  WHERE id = student_uuid;
  
  -- Sync Auth context variable so the UI sees it instantly on next load
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{has_paid}', 'true')
  WHERE id = student_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
