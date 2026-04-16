import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    
    // Handle Steam OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('steamConnected') === 'true') {
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
      // Reload user data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-3 border-[#333333] border-t-[#5a7fa3] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;