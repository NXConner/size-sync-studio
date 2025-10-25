import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  Heart, 
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  RotateCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { MediaItem } from '../types';
import { cn } from '@/lib/utils';

interface MediaGalleryProps {
  media: MediaItem[];
  positionName: string;
  onMediaSelect?: (media: MediaItem) => void;
  onMediaLike?: (media: MediaItem) => void;
  onMediaDownload?: (media: MediaItem) => void;
  onMediaShare?: (media: MediaItem) => void;
  showControls?: boolean;
  autoPlay?: boolean;
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  positionName,
  onMediaSelect,
  onMediaLike,
  onMediaDownload,
  onMediaShare,
  showControls = true,
  autoPlay = false,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [likedMedia, setLikedMedia] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const currentMedia = media[currentIndex];

  // Animation variants
  const galleryVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const mediaVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  // Handle media navigation
  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  // Handle media playback
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            prevMedia();
            break;
          case 'ArrowRight':
            nextMedia();
            break;
          case ' ':
            e.preventDefault();
            setIsPlaying(!isPlaying);
            break;
          case 'Escape':
            setIsFullscreen(false);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, isPlaying]);

  // Handle media like
  const handleLike = (media: MediaItem) => {
    setLikedMedia(prev => 
      prev.includes(media.id) 
        ? prev.filter(id => id !== media.id)
        : [...prev, media.id]
    );
    onMediaLike?.(media);
  };

  // Handle media download
  const handleDownload = (media: MediaItem) => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.name;
    link.click();
    onMediaDownload?.(media);
  };

  // Handle media share
  const handleShare = async (media: MediaItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${positionName} - ${media.name}`,
          text: media.description || `Check out this ${media.type} for ${positionName}`,
          url: media.url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(media.url);
    }
    onMediaShare?.(media);
  };

  if (!media || media.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 bg-gray-100 rounded-lg", className)}>
        <div className="text-center">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No media available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={galleryRef}
      variants={galleryVariants}
      initial="hidden"
      animate="visible"
      className={cn("relative", className)}
    >
      {/* Main Media Display */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {currentMedia && (
            <motion.div
              key={currentIndex}
              variants={mediaVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative"
            >
              {currentMedia.type === 'image' ? (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.name}
                  className={cn(
                    "w-full h-64 object-cover cursor-pointer transition-transform duration-300",
                    isZoomed && "scale-150"
                  )}
                  onClick={() => setIsFullscreen(true)}
                />
              ) : currentMedia.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="w-full h-64 object-cover"
                  muted={isMuted}
                  loop
                  playsInline
                  onClick={() => setIsPlaying(!isPlaying)}
                />
              ) : currentMedia.type === 'gif' ? (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.name}
                  className={cn(
                    "w-full h-64 object-cover cursor-pointer transition-transform duration-300",
                    isZoomed && "scale-150"
                  )}
                  onClick={() => setIsFullscreen(true)}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white bg-opacity-90 hover:bg-opacity-100"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              {currentMedia?.type === 'video' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsMuted(!isMuted)}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              )}

              <Button
                size="sm"
                variant="secondary"
                onClick={prevMedia}
                className="bg-white bg-opacity-90 hover:bg-opacity-100"
                disabled={media.length <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                onClick={nextMedia}
                className="bg-white bg-opacity-90 hover:bg-opacity-100"
                disabled={media.length <= 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsFullscreen(true)}
                className="bg-white bg-opacity-90 hover:bg-opacity-100"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Media Indicators */}
        {media.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentIndex 
                    ? "bg-white" 
                    : "bg-white bg-opacity-50"
                )}
              />
            ))}
          </div>
        )}

        {/* Media Info */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          <div className="bg-black bg-opacity-50 rounded px-2 py-1">
            <p className="text-white text-sm font-medium">{currentMedia?.name}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {currentMedia?.type}
              </Badge>
              {currentMedia?.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs text-white border-white">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleLike(currentMedia!)}
              className={cn(
                "bg-black bg-opacity-50 hover:bg-opacity-70",
                likedMedia.includes(currentMedia?.id || '') && "text-red-500"
              )}
            >
              <Heart className={cn(
                "w-4 h-4",
                likedMedia.includes(currentMedia?.id || '') && "fill-current"
              )} />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDownload(currentMedia!)}
              className="bg-black bg-opacity-50 hover:bg-opacity-70"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleShare(currentMedia!)}
              className="bg-black bg-opacity-50 hover:bg-opacity-70"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {media.length > 1 && (
        <div className="flex space-x-2 mt-4 overflow-x-auto">
          {media.map((item, index) => (
            <motion.button
              key={item.id}
              variants={itemVariants}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                index === currentIndex 
                  ? "border-pink-500" 
                  : "border-gray-300 hover:border-pink-300"
              )}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <div className="relative max-w-4xl max-h-full p-4">
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 z-10"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              
              {currentMedia && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="relative"
                >
                  {currentMedia.type === 'image' || currentMedia.type === 'gif' ? (
                    <img
                      src={currentMedia.url}
                      alt={currentMedia.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : currentMedia.type === 'video' ? (
                    <video
                      src={currentMedia.url}
                      className="max-w-full max-h-full"
                      controls
                      autoPlay
                    />
                  ) : null}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
