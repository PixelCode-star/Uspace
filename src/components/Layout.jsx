import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from './AuthModal';
import GlobalDialog from './GlobalDialog';

export default function Layout() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('signup');

  useEffect(() => {
    const handleAuthEvent = (e) => {
      setAuthTab(e.detail?.action || 'signup');
      setAuthModalOpen(true);
    };
    window.addEventListener('open-auth', handleAuthEvent);
    return () => window.removeEventListener('open-auth', handleAuthEvent);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialTab={authTab} />
      <GlobalDialog />
    </div>
  );
}
