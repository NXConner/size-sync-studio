import React from 'react';

export type WallpaperType = 'image' | 'video';

export interface WallpaperConfig {
  type: WallpaperType;
  url: string;
  objectFit?: 'cover' | 'contain';
  opacity?: number; // 0..1
  blurPx?: number; // e.g., 0..20
  brightness?: number; // e.g., 0.5..1.2
  muted?: boolean; // videos only
  loop?: boolean; // videos only
  animation?: 'none' | 'kenburns' | 'float' | 'tilt';
  animationSpeedMs?: number; // e.g., 20000
}

interface BackgroundWallpaperProps {
  wallpaper: WallpaperConfig | null;
}

export const BackgroundWallpaper: React.FC<BackgroundWallpaperProps> = ({ wallpaper }) => {
  if (!wallpaper) {
    return null;
  }

  const opacity = wallpaper.opacity ?? 1;
  const blurPx = wallpaper.blurPx ?? 0;
  const brightness = wallpaper.brightness ?? 1;
  const objectFit = wallpaper.objectFit ?? 'cover';
  const animation = wallpaper.animation ?? 'none';
  const animationSpeedMs = wallpaper.animationSpeedMs ?? 20000;

  const commonStyle: React.CSSProperties = {
    filter: `blur(${blurPx}px) brightness(${brightness})`,
    opacity,
    objectFit,
    animation: animation !== 'none' ? `${animation} ${animationSpeedMs}ms ease-in-out infinite alternate` : undefined,
  };

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <style>
        {`
        @keyframes kenburns { 0% { transform: scale(1.05); } 100% { transform: scale(1.15); } }
        @keyframes float { 0% { transform: translateY(-1.5%); } 100% { transform: translateY(1.5%); } }
        @keyframes tilt { 0% { transform: rotate(-0.8deg) scale(1.05); } 100% { transform: rotate(0.8deg) scale(1.05); } }
        `}
      </style>
      {wallpaper.type === 'image' ? (
        <img
          src={wallpaper.url}
          alt="Background"
          className="w-full h-full"
          style={commonStyle}
          decoding="async"
          fetchPriority="low"
        />
      ) : (
        <video
          src={wallpaper.url}
          className="w-full h-full"
          style={commonStyle}
          autoPlay
          muted={wallpaper.muted ?? true}
          loop={wallpaper.loop ?? true}
          preload="metadata"
          playsInline
        />
      )}
      {/* Subtle vignette for readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export default BackgroundWallpaper;

