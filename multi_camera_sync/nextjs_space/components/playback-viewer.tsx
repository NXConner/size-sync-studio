'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, Grid, Maximize2 } from 'lucide-react';
import { RecordedVideo } from '@/hooks/use-recording';

interface PlaybackViewerProps {
  recordings: RecordedVideo[];
}

export function PlaybackViewer({ recordings }: PlaybackViewerProps) {
  const [activeCamera, setActiveCamera] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const rafRef = useRef<number>();

  // Setup video URLs
  useEffect(() => {
    recordings?.forEach?.((recording, index) => {
      const video = videoRefs.current?.get?.(index);
      if (video && recording?.blob) {
        const url = URL?.createObjectURL?.(recording?.blob);
        video.src = url ?? '';

        return () => {
          URL?.revokeObjectURL?.(url ?? '');
        };
      }
    });
  }, [recordings]);

  // Sync playback across all videos
  const syncPlayback = () => {
    const primaryVideo = videoRefs.current?.get?.(activeCamera);
    if (!primaryVideo) return;

    const time = primaryVideo?.currentTime ?? 0;
    setCurrentTime(time);

    videoRefs.current?.forEach?.((video, index) => {
      if (index !== activeCamera && video) {
        const diff = Math.abs((video?.currentTime ?? 0) - time);
        if (diff > 0.1) {
          video.currentTime = time;
        }
        
        if (isPlaying && video?.paused) {
          video?.play?.()?.catch?.(() => {});
        } else if (!isPlaying && !video?.paused) {
          video?.pause?.();
        }
      }
    });

    rafRef.current = requestAnimationFrame(syncPlayback);
  };

  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(syncPlayback);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, activeCamera]);

  const togglePlay = () => {
    const video = videoRefs.current?.get?.(activeCamera);
    if (!video) return;

    if (isPlaying) {
      videoRefs.current?.forEach?.((v) => v?.pause?.());
      setIsPlaying(false);
    } else {
      videoRefs.current?.forEach?.((v) => v?.play?.()?.catch?.(() => {}));
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    videoRefs.current?.forEach?.((video) => {
      if (video) video.currentTime = 0;
    });
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e?.target?.value ?? '0');
    videoRefs.current?.forEach?.((video) => {
      if (video) video.currentTime = time;
    });
    setCurrentTime(time);
  };

  const maxDuration =
    Math.max(...(recordings?.map?.((r) => r?.duration ?? 0) ?? [0])) || 0;

  if ((recordings?.length ?? 0) === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">No recordings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View mode toggle */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setViewMode('single')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'single'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'grid'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Grid className="w-5 h-5" />
        </button>
      </div>

      {/* Video display */}
      {viewMode === 'single' ? (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {recordings?.map?.((recording, index) => (
            <video
              key={recording?.id}
              ref={(el) => el && videoRefs.current?.set?.(index, el)}
              className={`w-full h-full object-contain ${
                index === activeCamera ? 'block' : 'hidden'
              }`}
              playsInline
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {recordings?.map?.((recording, index) => (
            <div
              key={recording?.id}
              className="aspect-video bg-black rounded-lg overflow-hidden relative"
            >
              <video
                ref={(el) => el && videoRefs.current?.set?.(index, el)}
                className="w-full h-full object-contain"
                playsInline
              />
              <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                {recording?.cameraLabel}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Camera selector (single view only) */}
      {viewMode === 'single' && (recordings?.length ?? 0) > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {recordings?.map?.((recording, index) => (
            <button
              key={recording?.id}
              onClick={() => setActiveCamera(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === activeCamera
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {recording?.cameraLabel}
            </button>
          ))}
        </div>
      )}

      {/* Playback controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
        {/* Progress bar */}
        <input
          type="range"
          min="0"
          max={maxDuration}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full"
        />

        {/* Time display */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{Math.floor(currentTime)}s</span>
          <span>{maxDuration}s</span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRestart}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-4 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
