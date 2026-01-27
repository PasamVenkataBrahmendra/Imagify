
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { Loader2 } from 'lucide-react';
import { AppTheme } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('theme') as AppTheme) || 'light';
  });

  useEffect(() => {
    // Modular Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-darkbg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Identity...</p>
        </div>
      </div>
    );
  }

  // Route Guard: Redirect to Auth if no user session found
  if (!user) {
    return <Auth theme={theme} onToggleTheme={toggleTheme} />;
  }

  // Securely provide user context to Dashboard
  return <Dashboard theme={theme} onToggleTheme={toggleTheme} />;
};

export default App;
