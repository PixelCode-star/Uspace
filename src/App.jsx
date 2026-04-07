import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Pages (to be implemented)
import Home from './pages/Home';
import Browse from './pages/Browse';
import Listing from './pages/Listing';
import Landlord from './pages/Landlord';
import Dashboard from './pages/Dashboard';

import NotFound from './pages/NotFound';

function App() {
  useEffect(() => {
    let listener = null;
    
    const registerListener = async () => {
      try {
        listener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            CapacitorApp.exitApp();
          }
        });
      } catch (err) {
        // Ignored on web
      }
    };
    
    registerListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="browse" element={<Browse />} />
            <Route path="listing/:id" element={<Listing />} />
            <Route path="landlord" element={<Landlord />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
