
import React, { useState } from 'react';
import { 
  Sparkles, Palette, Share2, Shirt, LogOut, Loader2, Download, AlertCircle, 
  Image as ImageIcon, CheckCircle2, User, Zap, Heart, ShieldCheck, 
  X, Calendar, Mail, Info
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import ImageUpload from '../components/ImageUpload';
import ThemeToggle from '../components/ThemeToggle';
import { DashboardTab, AppTheme } from '../types';
import { 
  generateImageFromText, 
  styleTransform, 
  fuseImages, 
  runFitCheck 
} from '../services/geminiService';

interface DashboardProps {
  theme: AppTheme;
  onToggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ theme, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.TextToImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Inputs
  const [prompt, setPrompt] = useState('');
  const [imgStyle, setImgStyle] = useState('Realistic Photo');
  const [imgSize, setImgSize] = useState('1:1');
  
  const [singleImg, setSingleImg] = useState<string | null>(null);
  const [transformStyle, setTransformStyle] = useState('Anime');
  const [styleRefinePrompt, setStyleRefinePrompt] = useState('');
  
  const [fuseA, setFuseA] = useState<string | null>(null);
  const [fuseB, setFuseB] = useState<string | null>(null);
  
  const [fitPerson, setFitPerson] = useState<string | null>(null);
  const [fitOutfit, setFitOutfit] = useState<string | null>(null);

  const tabs = [
    { id: DashboardTab.TextToImage, label: 'Create from Text', icon: ImageIcon, mobileLabel: 'Create' },
    { id: DashboardTab.StyleTransform, label: 'Photo Stylist', icon: Palette, mobileLabel: 'Stylist' },
    { id: DashboardTab.ImageFusion, label: 'Combine Images', icon: Share2, mobileLabel: 'Combine' },
    { id: DashboardTab.FitCheck, label: 'Virtual Fit Check', icon: Shirt, mobileLabel: 'Fit' },
  ];

  const handleAction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let res;
      if (activeTab === DashboardTab.TextToImage) {
        if (!prompt) throw new Error("Please describe what you want to create.");
        res = await generateImageFromText(prompt, imgStyle, imgSize);
        setResult({ imageUrl: res });
      } else if (activeTab === DashboardTab.StyleTransform) {
        if (!singleImg) throw new Error("Please upload a photo to style.");
        res = await styleTransform(singleImg, transformStyle, styleRefinePrompt);
        setResult({ imageUrl: res });
      } else if (activeTab === DashboardTab.ImageFusion) {
        if (!fuseA || !fuseB) throw new Error("Both images are required to combine them.");
        res = await fuseImages(fuseA, fuseB);
        setResult({ imageUrl: res });
      } else if (activeTab === DashboardTab.FitCheck) {
        if (!fitPerson || !fitOutfit) throw new Error("Both your photo and an outfit photo are required.");
        const { imageUrl, analysis } = await runFitCheck(fitPerson, fitOutfit);
        setResult({ imageUrl, analysis });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const user = auth.currentUser;
  const joinDate = user?.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen flex flex-col">
      {/* DESKTOP TOP NAV */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white/80 dark:bg-softdark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="bg-brand p-1.5 rounded-lg shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter">IMAGIFY AI</span>
          </div>

          <nav className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setResult(null); setError(null); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button 
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-xl"
            >
               <User size={16} className="text-slate-400" />
               <span className="text-[10px] font-black uppercase text-slate-500 truncate max-w-[80px]">
                 {user?.displayName || 'My Account'}
               </span>
            </button>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors ml-2" title="Log Out">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white dark:bg-carddark rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 flex justify-end">
              <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="px-8 pb-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-brand/10 text-brand flex items-center justify-center mb-6 shadow-inner">
                <User size={40} />
              </div>
              <h2 className="text-xl font-black mb-1 text-center">{user?.displayName || 'Studio Member'}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Creative Professional</p>
              
              <div className="w-full space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Mail className="text-brand w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Email</span>
                    <span className="text-xs font-bold truncate">{user?.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Calendar className="text-brand w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Member Since</span>
                    <span className="text-xs font-bold">{joinDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Info className="text-brand w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Account Status</span>
                    <span className="text-xs font-bold">Active Professional</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="mt-8 w-full py-3 bg-red-500/10 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE HEADER */}
      <header className="fixed top-0 inset-x-0 h-14 bg-white/80 dark:bg-softdark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 md:hidden z-50 flex items-center justify-between px-4">
        <span className="text-lg font-black tracking-tighter text-brand">IMAGIFY AI</span>
        <div className="flex items-center gap-2">
           <ThemeToggle theme={theme} onToggle={onToggleTheme} />
           <button onClick={() => setShowProfile(true)} className="p-2 text-slate-400"><User size={20} /></button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-20 pb-32 md:pt-28 md:pb-12 px-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* STUDIO CONTROLS */}
          <div className="lg:col-span-7 space-y-8 feature-fade-in">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                {activeTab === DashboardTab.TextToImage && "Describe your vision and our AI will bring it to life instantly."}
                {activeTab === DashboardTab.StyleTransform && "Apply stunning artistic effects to your photos while preserving details."}
                {activeTab === DashboardTab.ImageFusion && "Blend two images together into one professional visual piece."}
                {activeTab === DashboardTab.FitCheck && "See how any outfit looks on you with our advanced body mapping."}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-carddark/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-8">
              {activeTab === DashboardTab.TextToImage && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Describe your image</label>
                    <textarea 
                      value={prompt} onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. A futuristic city with flying cars at sunset..."
                      className="w-full h-32 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-brand transition-all text-sm leading-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Choose Style</label>
                      <select value={imgStyle} onChange={e => setImgStyle(e.target.value)} className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none cursor-pointer">
                        <option>Realistic Photo</option>
                        <option>3D Render</option>
                        <option>Digital Art</option>
                        <option>Watercolor Painting</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aspect Ratio</label>
                      <select value={imgSize} onChange={e => setImgSize(e.target.value)} className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none cursor-pointer">
                        <option>1:1 (Square)</option>
                        <option>16:9 (Wide)</option>
                        <option>9:16 (Tall)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === DashboardTab.StyleTransform && (
                <div className="space-y-6">
                  <ImageUpload id="st" label="Your Photo" onImageSelect={setSingleImg} />
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Refine Style Details (Optional)</label>
                    <textarea 
                      value={styleRefinePrompt} onChange={(e) => setStyleRefinePrompt(e.target.value)}
                      placeholder="e.g. Enhance blue tones and make the lighting more cinematic..."
                      className="w-full h-24 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-brand transition-all text-sm leading-relaxed"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Art Preset</label>
                    <div className="flex flex-wrap gap-2">
                      {['Anime', 'Cyberpunk', 'Sketch', 'Oil Painting', 'Cartoon', 'Watercolor', '3D'].map(s => (
                        <button 
                          key={s} 
                          onClick={() => setTransformStyle(s)}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter border transition-all ${
                            transformStyle === s 
                            ? 'bg-brand text-white border-brand' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === DashboardTab.ImageFusion && (
                <div className="grid grid-cols-2 gap-6">
                  <ImageUpload id="fa" label="Base Subject" onImageSelect={setFuseA} />
                  <ImageUpload id="fb" label="Style Reference" onImageSelect={setFuseB} />
                </div>
              )}

              {activeTab === DashboardTab.FitCheck && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <ImageUpload id="f1" label="Photo of Yourself" onImageSelect={setFitPerson} />
                    <ImageUpload id="f2" label="Outfit to Try" onImageSelect={setFitOutfit} />
                  </div>
                  <div className="bg-blue-50 dark:bg-brand/10 p-4 rounded-2xl flex gap-3 items-center border border-brand/10">
                    <ShieldCheck className="text-brand w-5 h-5" />
                    <p className="text-[10px] font-bold text-brand uppercase tracking-wider">Privacy Guaranteed: Face & Shape preserved</p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleAction}
                disabled={loading}
                className="w-full py-4 bg-brand hover:bg-brand/90 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand/20 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Zap size={18}/> Start Generating</>}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex gap-3 items-center text-red-600 dark:text-red-400 text-xs font-bold animate-in slide-in-from-top-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>

          {/* PREVIEW PANEL */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 feature-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white dark:bg-carddark border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Generated Preview</span>
                {result && <CheckCircle2 className="text-emerald-500 w-4 h-4" />}
              </div>
              
              <div className="aspect-square bg-slate-50 dark:bg-slate-900 flex items-center justify-center relative group">
                {result ? (
                  <div className="w-full h-full relative">
                    <img src={result.imageUrl} className="w-full h-full object-cover animate-in fade-in" alt="AI Creation" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={result.imageUrl} download="imagify-ai.png" className="bg-white p-4 rounded-2xl text-slate-900 hover:scale-110 transition-transform shadow-2xl">
                        <Download size={24} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-12 opacity-20">
                    <ImageIcon size={80} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Input</p>
                  </div>
                )}
              </div>

              {result?.analysis && (
                <div className="p-8 bg-brand/5 dark:bg-brand/10 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Fit Analysis</span>
                    <span className="bg-brand text-white px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-brand/20">
                      Score: {result.analysis.score}/10
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="pl-3 border-l-2 border-brand py-1">
                      <p className="text-[10px] font-black uppercase text-brand mb-1 tracking-tighter">Improvement Advice</p>
                      <p className="text-xs font-bold leading-relaxed">{result.analysis.suggestions}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                       <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Colors</p>
                          <p className="text-[10px] font-bold">{result.analysis.colorFeedback}</p>
                       </div>
                       <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Style Context</p>
                          <p className="text-[10px] font-bold">{result.analysis.occasion}</p>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-3 text-slate-400 grayscale opacity-40">
              <Heart size={14} className="text-brand fill-brand" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Visionary AI Studio</p>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 inset-x-0 h-16 md:hidden bg-white dark:bg-softdark border-t border-slate-100 dark:border-slate-800 z-50 flex items-center justify-around pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null); setError(null); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === tab.id ? 'text-brand scale-110' : 'text-slate-400'
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? 'fill-brand/10' : ''} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{tab.mobileLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Dashboard;
