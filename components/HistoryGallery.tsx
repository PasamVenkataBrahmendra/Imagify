
import React from 'react';
import { GenerationLog } from '../types';
import { Trash2, History, ImageIcon, Calendar, ChevronRight } from 'lucide-react';

interface HistoryGalleryProps {
  items: GenerationLog[];
  onDelete: (id: string) => void;
}

const HistoryGallery: React.FC<HistoryGalleryProps> = ({ items, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-2 border-white/5">
        <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">No activity yet</h3>
        <p className="text-xs text-slate-500 mt-2 font-medium">Your creative processing history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Metadata Audit Stream</h3>
        <span className="text-[10px] font-bold text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full">{items.length} Entries</span>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div key={item.id} className="glass-panel rounded-2xl overflow-hidden hover:bg-white/5 transition-all group p-5 flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
              <ImageIcon size={20} className="text-primary-500" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[9px] font-black uppercase text-primary-500 tracking-wider">
                  {item.featureType.replace('-', ' ')}
                </span>
                <span className="text-[9px] font-bold text-slate-600">
                  {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Active Session'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-200 truncate pr-4">
                {item.prompt}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
               <button 
                onClick={() => onDelete(item.id)}
                className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryGallery;
