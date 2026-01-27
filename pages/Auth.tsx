
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Sparkles, Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { AppTheme } from '../types';

interface AuthProps {
  theme: AppTheme;
  onToggleTheme: () => void;
}

const Auth: React.FC<AuthProps> = ({ theme, onToggleTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update Firebase Profile
        await updateProfile(user, { displayName: name });
        
        // Initialize User Doc in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error("Auth Error:", err.code);
      setError(mapAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Sync with Firestore if first time
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        lastLogin: new Date().toISOString()
      }, { merge: true });

    } catch (err: any) {
      console.error("Google Auth Error:", err.code);
      if (err.code !== 'auth/cancelled-popup-request') {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const mapAuthError = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use': return "This email is already registered.";
      case 'auth/invalid-credential': return "Invalid email or password.";
      case 'auth/weak-password': return "Password should be at least 6 characters.";
      case 'auth/user-not-found': return "No account found with this email.";
      default: return "Authentication failed. Please check your connection.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-carddark p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center gap-4 mb-12 text-center">
          <div className="bg-brand p-3 rounded-2xl shadow-xl shadow-brand/20">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">IMAGIFY AI</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Universal Creative Access</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand transition-all"
            />
          </div>
          
          <button 
            type="submit" disabled={loading || googleLoading}
            className="w-full bg-brand hover:bg-brand/90 text-white rounded-2xl py-4 font-black transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>{isLogin ? 'Log In to Studio' : 'Create Free Account'} <ArrowRight size={20}/></>}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400"><span className="bg-white dark:bg-carddark px-4">Or continue with</span></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold text-sm active:scale-95 disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </>
          )}
        </button>

        <p className="mt-10 text-center text-xs font-bold text-slate-500 uppercase tracking-tighter">
          {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-brand font-black hover:underline">{isLogin ? 'Sign up' : 'Log in'}</button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
