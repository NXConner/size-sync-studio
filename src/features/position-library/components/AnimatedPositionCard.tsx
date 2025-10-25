import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Star, 
  Eye,
  Upload,
  Image as ImageIcon,
  Video,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  Clock,
  Zap
} from 'lucide-react';
import { Position } from '../types';
import { cn } from '@/lib/utils';

interface AnimatedPositionCardProps {
  position: Position;
  onSelect?: (position: Position) => void;
  onFavorite?: (position: Position) => void;
  onBookmark?: (position: Position) => void;
  isFavorite?: boolean;
  isBookmarked?: boolean;
  showMedia?: boolean;
  autoPlay?: boolean;
}

export const AnimatedPositionCard: React.FC<AnimatedPositionCardProps> = ({
  position,
  onSelect,
  onFavorite,
  onBookmark,
  isFavorite = false,
  isBookmarked = false,
  showMedia = true,
  autoPlay = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation variants
  const cardVariants = {
    initial: { scale: 1, rotateY: 0 },
    hover: { 
      scale: 1.05, 
      rotateY: 5,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: { scale: 0.95 }
  };

  const mediaVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1 },
    exit: { opacity: 0 }
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

  // Handle media cycling
  const nextMedia = () => {
    if (position.media && position.media.length > 0) {
      setCurrentMediaIndex((prev) => (prev + 1) % position.media.length);
    }
  };

  const prevMedia = () => {
    if (position.media && position.media.length > 0) {
      setCurrentMediaIndex((prev) => (prev - 1 + position.media.length) % position.media.length);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Process uploaded files
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            // Add to position media
            console.log('Uploaded media:', file.name, e.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const currentMedia = position.media?.[currentMediaIndex];

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <Card className="overflow-hidden bg-card border-2 border-transparent hover:border-primary/20 transition-all duration-300">
        {/* Media Section */}
        {showMedia && (
          <div className="relative h-48 overflow-hidden">
            <AnimatePresence mode="wait">
              {currentMedia ? (
                <motion.div
                  key={currentMediaIndex}
                  variants={mediaVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full h-full"
                >
                  {currentMedia.type === 'image' ? (
                    <img
                      src={currentMedia.url}
                      alt={position.name}
                      className="w-full h-full object-cover"
                    />
                  ) : currentMedia.type === 'video' ? (
                    <video
                      ref={videoRef}
                      src={currentMedia.url}
                      className="w-full h-full object-cover"
                      muted={isMuted}
                      loop
                      playsInline
                    />
                  ) : currentMedia.type === 'gif' ? (
                    <img
                      src={currentMedia.url}
                      alt={position.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  variants={mediaVariants}
                  initial="initial"
                  animate="animate"
                  className="w-full h-full bg-muted flex items-center justify-center"
                >
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No media available</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Media Controls Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate={isHovered ? "hover" : "initial"}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
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
                  disabled={!position.media || position.media.length <= 1}
                >
                  ←
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={nextMedia}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100"
                  disabled={!position.media || position.media.length <= 1}
                >
                  →
                </Button>
              </div>
            </motion.div>

            {/* Media Indicators */}
            {position.media && position.media.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {position.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      index === currentMediaIndex 
                        ? "bg-white" 
                        : "bg-white bg-opacity-50"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Upload Button */}
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100"
              onClick={() => setShowMediaUpload(!showMediaUpload)}
            >
              <Upload className="w-4 h-4" />
            </Button>

            {/* File Upload Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.gif"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Content Section */}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              {position.name}
            </CardTitle>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFavorite?.(position)}
                className={cn(
                  "p-1",
                  isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
                )}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onBookmark?.(position)}
                className={cn(
                  "p-1",
                  isBookmarked ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
                )}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 fill-current" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Difficulty and Category */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs",
                position.difficulty === 'beginner' && "bg-green-100 text-green-700",
                position.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-700",
                position.difficulty === 'advanced' && "bg-red-100 text-red-700"
              )}
            >
              {position.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {position.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {position.mood}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {position.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>
                {typeof position.duration === 'object' 
                  ? `${position.duration.min}-${position.duration.max} min`
                  : `${position.duration} min`
                }
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>{position.intensity}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>4.8</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onSelect?.(position)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* Share functionality */}}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* Download functionality */}}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
