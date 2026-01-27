
import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  onImageSelect: (dataUrl: string | null) => void;
  id: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, onImageSelect, id }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageSelect(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
        {preview && (
          <button 
            onClick={() => { setPreview(null); onImageSelect(null); }}
            className="text-[9px] font-black text-red-500 hover:underline uppercase"
          >
            Clear
          </button>
        )}
      </div>
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-1.5 p-4 text-center">
            <Upload className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-1" />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">Select</span>
            <input 
              id={id} type="file" accept="image/*" className="hidden" 
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
