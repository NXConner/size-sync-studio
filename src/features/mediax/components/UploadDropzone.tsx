
import React, { useCallback } from 'react';
import { Upload, File, Loader2 } from 'lucide-react';

interface UploadDropzoneProps {
  onFileUpload: (files: FileList) => void;
  isUploading: boolean;
  progress?: number;
  error?: string | null;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFileUpload, isUploading, progress, error }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (isUploading) {
    return (
      <div className="mb-8 p-8 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/50 text-center">
        <Loader2 size={48} className="mx-auto mb-4 text-purple-400 animate-spin" />
        <p className="text-lg font-medium text-gray-300">Uploading your media...</p>
        {typeof progress === 'number' && (
          <p className="text-sm text-gray-400 mt-2">{progress}%</p>
        )}
        <p className="text-sm text-gray-500 mt-2">Please wait while we process your files</p>
        {error && (
          <p role="alert" className="text-sm text-red-400 mt-3">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mb-8 p-8 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer ${
        isDragging
          ? 'border-purple-500 bg-purple-500/10 scale-105'
          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800/70'
      }`}
      onClick={() => document.getElementById('file-upload')?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload media files"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('file-upload')?.click() } }}
    >
      <div className="text-center">
        <div className={`mx-auto mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          {isDragging ? (
            <File size={48} className="text-purple-400" />
          ) : (
            <Upload size={48} className="text-gray-400" />
          )}
        </div>
        <p className="text-lg font-medium text-gray-300 mb-2">
          {isDragging ? 'Drop your files here' : 'Drag & drop your media files'}
        </p>
        <p className="text-sm text-gray-500">
          Or click to browse • Supports images and videos
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-400 mt-3">{error}</p>
        )}
      </div>
    </div>
  );
};
