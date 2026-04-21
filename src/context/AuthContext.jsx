import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Saved listings array (IDs)
  const [savedListings, setSavedListings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uspace_saved')) || [];
    } catch {
      return [];
    }
  });

  const isSaved = (id) => savedListings.includes(id);

  const toggleSave = (id) => {
    let newSaved;
    if (savedListings.includes(id)) {
      newSaved = savedListings.filter((savedId) => savedId !== id);
    } else {
      newSaved = [...savedListings, id];
    }
    setSavedListings(newSaved);
    localStorage.setItem('uspace_saved', JSON.stringify(newSaved));
    return newSaved.includes(id);
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        processUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        processUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const processUser = (authUser) => {
    const fullName = authUser.user_metadata?.full_name || authUser.email.split('@')[0];
    const firstName = fullName.split(' ')[0];
    setUser({
      id: authUser.id,
      email: authUser.email,
      fullName,
      name: firstName,
      initials: firstName.slice(0, 2).toUpperCase(),
      role: authUser.user_metadata?.role || 'student',
      hasPaid: authUser.user_metadata?.has_paid || false
    });

    const rawPhone = authUser.user_metadata?.phone_number;
    const metaPhone = typeof rawPhone === 'string' ? rawPhone.trim() : '';
    if (metaPhone) {
      supabase
        .from('profiles')
        .update({ phone_number: metaPhone })
        .eq('id', authUser.id)
        .then(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, savedListings, isSaved, toggleSave }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
