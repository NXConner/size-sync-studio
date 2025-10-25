import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Trash2,
  Eye,
  Download,
  Share2,
  Tag,
  Plus,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'gif';
  name: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
}

interface MediaUploadModalProps {
  positionId: string;
  positionName: string;
  onUpload: (media: MediaFile[]) => void;
  existingMedia?: MediaFile[];
  isOpen: boolean;
  onClose: () => void;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  positionId,
  positionName,
  onUpload,
  existingMedia = [],
  isOpen,
  onClose
}) => {
  const [files, setFiles] = useState<MediaFile[]>(existingMedia);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation variants
  const modalVariants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const fileVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  // Handle file selection
  const handleFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: MediaFile[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        console.warn(`Invalid file type: ${file.type}`);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`File too large: ${file.name}`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const mediaFile: MediaFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          type: file.type.startsWith('video/') ? 'video' : 
                file.type === 'image/gif' ? 'gif' : 'image',
          name: file.name,
          description: '',
          tags: [],
          isPublic: false
        };
        
        newFiles.push(mediaFile);
        
        if (newFiles.length === selectedFiles.length) {
          setFiles(prev => [...prev, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  // Remove file
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  // Update file properties
  const updateFile = (id: string, updates: Partial<MediaFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  // Add tag to file
  const addTag = (fileId: string, tag: string) => {
    if (!tag.trim()) return;
    updateFile(fileId, {
      tags: [...files.find(f => f.id === fileId)?.tags || [], tag.trim()]
    });
  };

  // Remove tag from file
  const removeTag = (fileId: string, tag: string) => {
    updateFile(fileId, {
      tags: files.find(f => f.id === fileId)?.tags.filter(t => t !== tag) || []
    });
  };

  // Handle upload
  const handleUpload = async () => {
    setUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onUpload(files);
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <motion.div
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Upload Media for "{positionName}"
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive 
                  ? "border-pink-400 bg-pink-50" 
                  : "border-gray-300 hover:border-pink-300"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your files here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mb-2"
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.gif"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
              <p className="text-xs text-gray-400">
                Supports: JPG, PNG, GIF, WebP, MP4, WebM (max 10MB each)
              </p>
            </div>

            {/* File List */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">Uploaded Files ({files.length})</h3>
                  
                  {files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      variants={fileVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Preview */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {file.type === 'video' ? (
                            <video
                              src={file.preview}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {file.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-500" />}
                            {file.type === 'video' && <Video className="w-4 h-4 text-red-500" />}
                            {file.type === 'gif' && <ImageIcon className="w-4 h-4 text-green-500" />}
                            <span className="font-medium text-sm truncate">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.type}
                            </Badge>
                          </div>

                          {/* Description */}
                          <Textarea
                            placeholder="Add a description..."
                            value={file.description}
                            onChange={(e) => updateFile(file.id, { description: e.target.value })}
                            className="mb-2 text-sm"
                            rows={2}
                          />

                          {/* Tags */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {file.tags.map((tag, tagIndex) => (
                                <Badge
                                  key={tagIndex}
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-red-100"
                                  onClick={() => removeTag(file.id, tag)}
                                >
                                  {tag} ×
                                </Badge>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Add tag..."
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    addTag(file.id, newTag);
                                    setNewTag('');
                                  }
                                }}
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  addTag(file.id, newTag);
                                  setNewTag('');
                                }}
                                disabled={!newTag.trim()}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Privacy Setting */}
                          <div className="flex items-center space-x-2 mt-2">
                            <input
                              type="checkbox"
                              id={`public-${file.id}`}
                              checked={file.isPublic}
                              onChange={(e) => updateFile(file.id, { isPublic: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor={`public-${file.id}`} className="text-sm">
                              Make this media public
                            </Label>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Button */}
            {files.length > 0 && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 mr-2"
                      >
                        <Upload className="w-4 h-4" />
                      </motion.div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {files.length} file{files.length > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
