import { useState, useEffect } from 'react';
import { SupabaseAPI } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'signup' }) {
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setTab(initialTab);
    setError(null);
  }, [isOpen, initialTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (tab === 'signup') {
        if (!name || !email || !password || !phone.trim()) throw new Error('Please fill all fields, including your phone number');
        const { data, error } = await SupabaseAPI.signUp(email, password, name, 'student', phone);
        if (error) throw error;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
           throw new Error('Email already in use.');
        }
        window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Success', message: 'Signup successful! Check your email or sign in directly.' } }));
        setTab('login');
      } else {
        if (!email || !password) throw new Error('Please fill all fields');
        const { error } = await SupabaseAPI.signIn(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-elevated)', borderRadius: 'var(--r-2xl)', padding: '40px',
        width: '100%', maxWidth: '440px', position: 'relative', border: '1px solid var(--bg-highlight)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)', fontSize: '1.5rem'
        }}>×</button>
        
        <div style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>U<span style={{color: 'var(--green)'}}>·</span>space</div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>Find your next boarding house ✨</p>
        
        <div style={{ display: 'flex', borderBottom: '1px solid var(--bg-highlight)', marginBottom: '24px' }}>
          <button 
            onClick={() => setTab('signup')}
            style={{ flex: 1, padding: '12px', borderBottom: tab === 'signup' ? '2px solid var(--green)' : 'none', color: tab === 'signup' ? 'var(--white)' : 'var(--text-muted)' }}
          >Sign Up Free</button>
          <button 
            onClick={() => setTab('login')}
            style={{ flex: 1, padding: '12px', borderBottom: tab === 'login' ? '2px solid var(--green)' : 'none', color: tab === 'login' ? 'var(--white)' : 'var(--text-muted)' }}
          >Sign In</button>
        </div>

        {error && <div style={{ padding: '12px', background: 'rgba(255,0,0,0.1)', color: '#ff4444', borderRadius: 'var(--r-sm)', marginBottom: '16px', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} className="form-input" placeholder="e.g. Thandiwe Mwansa" />
            </div>
          )}
          <div className="form-group">
            <label>Phone / WhatsApp</label>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="form-input" placeholder="+260..." required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="form-input" placeholder="student@unilus.ac.zm" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="form-input" placeholder="At least 6 characters" />
          </div>
          
          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4" style={{ display: 'block', width: '100%' }}>
            {loading ? 'Wait...' : (tab === 'signup' ? 'Create My Account →' : 'Sign In →')}
          </button>
        </form>
      </div>
    </div>
  );
}
