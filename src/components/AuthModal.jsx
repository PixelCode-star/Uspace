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
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);

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
        if (!name || !email || !password || !phone.trim() || !role) throw new Error('Please fill all fields, including your phone number and role');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        const { data, error } = await SupabaseAPI.signUp(email, password, name, role, phone);
        if (error) throw error;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
           throw new Error('Email already in use.');
        }
        window.dispatchEvent(new CustomEvent('show-dialog', { detail: { title: 'Success', message: 'Signup successful! Check your email or sign in directly.' } }));
        setTab('login');
      } else {
        if (!email || !password) throw new Error('Please enter your email and password');
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
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '20px'
    }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-elevated)', borderRadius: 'var(--r-2xl)', padding: '40px',
        width: '100%', maxWidth: '440px', position: 'relative', border: '1px solid var(--bg-highlight)',
        animation: 'fadeInUp 0.3s ease'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)', fontSize: '1.5rem',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px',
          transition: 'color 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>×</button>
        
        <div style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>U<span style={{color: 'var(--green)'}}>·</span>space</div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
          {tab === 'signup' ? 'Create your account to get started ✨' : 'Welcome back! Sign in to continue 👋'}
        </p>
        
        <div style={{ display: 'flex', borderBottom: '1px solid var(--bg-highlight)', marginBottom: '24px' }}>
          <button 
            onClick={() => { setTab('signup'); setError(null); }}
            style={{ flex: 1, padding: '12px', borderBottom: tab === 'signup' ? '2px solid var(--green)' : 'none', color: tab === 'signup' ? 'var(--white)' : 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }}
          >Sign Up Free</button>
          <button 
            onClick={() => { setTab('login'); setError(null); }}
            style={{ flex: 1, padding: '12px', borderBottom: tab === 'login' ? '2px solid var(--green)' : 'none', color: tab === 'login' ? 'var(--white)' : 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }}
          >Sign In</button>
        </div>

        {error && <div style={{ padding: '12px', background: 'rgba(255,0,0,0.1)', color: '#ff4444', borderRadius: 'var(--r-sm)', marginBottom: '16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="ph ph-warning-circle"></i>{error}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <>
              <div className="form-group">
                <label>I am a...</label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setRole('student')}
                    style={{ flex: 1, padding: '12px', borderRadius: 'var(--r-md)', border: role === 'student' ? '2px solid var(--green)' : '1px solid var(--bg-highlight)', background: role === 'student' ? 'rgba(30,215,96,0.1)' : 'var(--bg-base)', color: role === 'student' ? 'var(--green)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                  >
                    <i className="ph ph-student" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> Student
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole('landlord')}
                    style={{ flex: 1, padding: '12px', borderRadius: 'var(--r-md)', border: role === 'landlord' ? '2px solid var(--green)' : '1px solid var(--bg-highlight)', background: role === 'landlord' ? 'rgba(30,215,96,0.1)' : 'var(--bg-base)', color: role === 'landlord' ? 'var(--green)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                  >
                    <i className="ph ph-house" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> Landlord
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} className="form-input" placeholder="e.g. Thandiwe Mwansa" />
              </div>
              <div className="form-group">
                <label>Phone / WhatsApp</label>
                <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="form-input" placeholder="+260..." />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="form-input" placeholder="student@unilus.ac.zm" />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} className="form-input" placeholder={tab === 'signup' ? 'At least 6 characters' : 'Enter your password'} style={{ paddingRight: '44px' }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
              position: 'absolute', right: '12px', bottom: '10px',
              background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
              fontSize: '1.1rem'
            }}>
              <i className={showPassword ? 'ph ph-eye-slash' : 'ph ph-eye'}></i>
            </button>
          </div>
          
          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4" style={{ display: 'block', width: '100%', padding: '14px', fontSize: '1rem' }}>
            {loading ? (
              <><i className="ph ph-spinner ph-spin" style={{ marginRight: '8px' }}></i> Please wait...</>
            ) : (tab === 'signup' ? 'Create My Account →' : 'Sign In →')}
          </button>

          {tab === 'login' && (
            <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Don't have an account? <button type="button" onClick={() => { setTab('signup'); setError(null); }} style={{ color: 'var(--green)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>Sign Up Free</button>
            </p>
          )}

          {tab === 'signup' && (
            <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Already have an account? <button type="button" onClick={() => { setTab('login'); setError(null); }} style={{ color: 'var(--green)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>Sign In</button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
