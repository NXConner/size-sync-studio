
import React from 'react';
import { buildSrcSet, responsiveSizes } from '@svh/lib/image';
import type { MediaItem } from '@svh/pages/Index';
import { Play, Image } from 'lucide-react';

interface MediaGalleryProps {
  mediaItems: MediaItem[];
  onMediaSelect: (media: MediaItem) => void;
}

// using shared responsive helpers

export const MediaGallery = React.memo(function MediaGallery({ mediaItems, onMediaSelect }: MediaGalleryProps) {
  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Image size={64} className="mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No media found</h3>
        <p className="text-gray-500">Upload some files to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {mediaItems.map((item) => (
        <div
          key={item.id}
          className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
          onClick={() => onMediaSelect(item)}
          onMouseEnter={() => { void import('@svh/components/MediaViewer'); }}
        >
          {/* Media Thumbnail */}
          <picture>
            <source
              type="image/avif"
              srcSet={buildSrcSet(item.thumbnail, [200, 400, 800, 1200], 'avif')}
              sizes={responsiveSizes}
            />
            <source
              type="image/webp"
              srcSet={buildSrcSet(item.thumbnail, [200, 400, 800, 1200], 'webp')}
              sizes={responsiveSizes}
            />
            <img
              src={item.thumbnail}
              srcSet={buildSrcSet(item.thumbnail, [200, 400, 800, 1200])}
              sizes={responsiveSizes}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 [transition-filter]"
              loading="lazy"
              decoding="async"
              // React warns on non-standard prop casing; use lowercase attribute
              // @ts-expect-error React DOM attribute casing workaround
              fetchpriority="low"
              style={{ filter: 'blur(12px)' }}
              onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.filter = 'blur(0px)'; }}
            />
          </picture>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Video indicator */}
          {item.type === 'video' && (
            <div className="absolute top-2 right-2 bg-black/60 rounded-full p-2">
              <Play size={16} className="text-white" />
            </div>
          )}
          
          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
            <p className="text-xs text-gray-300 mt-1">{item.collection}</p>
          </div>
          
          {/* Hover border effect */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400 rounded-lg transition-colors duration-300" />
        </div>
      ))}
    </div>
  );
});
