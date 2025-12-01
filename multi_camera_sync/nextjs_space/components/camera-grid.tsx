'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import { RemoteStreamInfo } from '@/hooks/use-camera-session';

interface CameraGridProps {
  localStream: MediaStream | null;
  remoteStreams: RemoteStreamInfo[];
  isRecording?: boolean;
}

export function CameraGrid({ localStream, remoteStreams, isRecording }: CameraGridProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Callback ref for local video
  const setLocalVideoRef = useCallback((el: HTMLVideoElement | null) => {
    localVideoRef.current = el;
    if (el && localStream) {
      el.srcObject = localStream;
    }
  }, [localStream]);

  // Callback ref for remote videos
  const setRemoteVideoRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) {
      remoteVideoRefs.current.set(id, el);
      const remoteStream = remoteStreams?.find?.(r => r?.participantId === id);
      if (remoteStream?.stream) {
        el.srcObject = remoteStream.stream;
      }
    }
  }, [remoteStreams]);

  // Setup local video
  useEffect(() => {
    if (localVideoRef?.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Setup remote videos
  useEffect(() => {
    remoteStreams?.forEach?.(({ participantId, stream }) => {
      const videoEl = remoteVideoRefs.current?.get?.(participantId);
      if (videoEl && stream) {
        videoEl.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const allStreams = [
    { id: 'local', stream: localStream, label: 'You', isLocal: true },
    ...(remoteStreams?.map?.((r) => ({
      id: r?.participantId ?? '',
      stream: r?.stream,
      label: r?.label ?? 'Remote',
      isLocal: false,
    })) ?? []),
  ];

  const gridCols =
    allStreams?.length === 1
      ? 'grid-cols-1'
      : allStreams?.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : allStreams?.length === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-2';

  return (
    <div className={`grid ${gridCols} gap-4 w-full`}>
      {allStreams?.map?.(({ id, stream, label, isLocal }) => {
        const hasVideo = stream?.getVideoTracks?.()?.[0]?.enabled ?? false;
        const hasAudio = stream?.getAudioTracks?.()?.[0]?.enabled ?? false;

        return (
          <div
            key={id}
            className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg"
          >
            {stream ? (
              <video
                ref={isLocal ? setLocalVideoRef : (el) => setRemoteVideoRef(id, el)}
                autoPlay
                playsInline
                muted={isLocal}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CameraOff className="w-12 h-12 text-gray-600" />
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                REC
              </div>
            )}

            {/* Camera label */}
            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
              {label}
            </div>

            {/* Video/Audio status */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {hasVideo ? (
                <div className="bg-green-600 p-1.5 rounded-full">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="bg-red-600 p-1.5 rounded-full">
                  <CameraOff className="w-4 h-4 text-white" />
                </div>
              )}
              
              {!isLocal && (
                hasAudio ? (
                  <div className="bg-green-600 p-1.5 rounded-full">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="bg-red-600 p-1.5 rounded-full">
                    <MicOff className="w-4 h-4 text-white" />
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
