
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Sparkles, Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { AppTheme } from '../types';

interface SignupProps {
  onSwitch: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitch, theme, onToggleTheme }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        createdAt: Date.now()
      });
    } catch (err: any) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg p-6 theme-transition">
      <div className="absolute top-6 right-6">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 page-fade">
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">IMAGIFY AI</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">New Identity</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors text-sm font-medium"
                placeholder="John Doe"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors text-sm font-medium"
                placeholder="you@domain.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors text-sm font-medium"
                placeholder="Min. 6 chars"
                minLength={6}
              />
            </div>
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl py-4 font-black transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Join Now <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Already have an account?{' '}
            <button onClick={onSwitch} className="text-blue-600 dark:text-blue-400 font-black hover:underline">Log in</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
