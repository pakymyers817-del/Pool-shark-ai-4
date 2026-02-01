import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative group cursor-pointer flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-900/10 scale-[1.02]' 
            : 'border-slate-600 bg-slate-800/50 hover:border-emerald-500/50 hover:bg-slate-800'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload pool table image"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 rounded-2xl pointer-events-none" />
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleInputChange}
        />

        <div className="z-10 flex flex-col items-center space-y-4 text-center p-6">
          <div className={`p-4 rounded-full bg-slate-700/50 group-hover:bg-slate-700 transition-colors ${isDragging ? 'bg-emerald-900/30' : ''}`}>
            {isDragging ? (
              <Upload className="w-10 h-10 text-emerald-400" />
            ) : (
              <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-200 group-hover:text-white">
              {isDragging ? 'Drop it like it\'s hot!' : 'Upload Pool Table Image'}
            </h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Drag and drop your image here, or click to browse files.
            </p>
          </div>
          
          <div className="flex items-center text-xs text-slate-500 space-x-4 pt-2">
            <span className="flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> JPEG, PNG</span>
            <span>•</span>
            <span>Max 10MB</span>
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-center text-slate-400 text-sm">
        Take a clear photo from above the table for best results.
      </p>
    </div>
  );
};