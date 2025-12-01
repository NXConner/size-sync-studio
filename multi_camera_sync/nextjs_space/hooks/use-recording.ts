// Custom hook for synchronized recording
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { scheduleAction, downloadBlob } from '@/lib/sync-utils';

export interface RecordingState {
  isRecording: boolean;
  countdown: number;
  duration: number;
}

export interface RecordedVideo {
  id: string;
  blob: Blob;
  fileName: string;
  startTime: Date;
  duration: number;
  cameraLabel: string;
}

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordings, setRecordings] = useState<RecordedVideo[]>([]);

  const recordersRef = useRef<Map<string, MediaRecorder>>(new Map());
  const chunksRef = useRef<Map<string, Blob[]>>(new Map());
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  /**
   * Start recording all streams
   */
  const startRecording = useCallback(
    (
      streams: Array<{ id: string; stream: MediaStream; label: string }>,
      leadTimeMs: number = 3000
    ) => {
      const startAt = Date.now() + leadTimeMs;

      // Schedule recording
      cleanupRef.current = scheduleAction(
        startAt,
        () => {
          // Start recording
          startTimeRef.current = Date.now();
          setIsRecording(true);
          setCountdown(0);

          // Start duration counter
          durationIntervalRef.current = setInterval(() => {
            setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
          }, 1000);

          // Record each stream
          streams?.forEach?.(({ id, stream, label }) => {
            try {
              const mimeType = MediaRecorder?.isTypeSupported?.('video/webm;codecs=vp9,opus')
                ? 'video/webm;codecs=vp9,opus'
                : MediaRecorder?.isTypeSupported?.('video/webm')
                ? 'video/webm'
                : 'video/mp4';

              const recorder = new MediaRecorder(stream, { mimeType });
              const chunks: Blob[] = [];

              recorder.ondataavailable = (event) => {
                if (event?.data?.size > 0) {
                  chunks?.push?.(event?.data);
                }
              };

              recorder.onstop = () => {
                const blob = new Blob(chunks ?? [], { type: mimeType });
                const fileName = `${label?.replace(/\s+/g, '_')}_${Date.now()}.webm`;

                setRecordings((prev) => [
                  ...(prev ?? []),
                  {
                    id,
                    blob,
                    fileName,
                    startTime: new Date(startTimeRef.current),
                    duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
                    cameraLabel: label,
                  },
                ]);

                // Auto-download
                downloadBlob(blob, fileName);
              };

              recorder?.start?.(1000); // Collect data every second
              recordersRef.current?.set?.(id, recorder);
              chunksRef.current?.set?.(id, chunks);
            } catch (err) {
              console.error(`Failed to start recorder for ${id}:`, err);
            }
          });
        },
        (remaining) => {
          setCountdown(remaining);
        }
      );
    },
    []
  );

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    // Stop all recorders
    recordersRef.current?.forEach?.((recorder) => {
      try {
        if (recorder?.state === 'recording') {
          recorder?.stop?.();
        }
      } catch (err) {
        console.error('Error stopping recorder:', err);
      }
    });

    recordersRef.current?.clear?.();
    chunksRef.current?.clear?.();

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setIsRecording(false);
    setDuration(0);
  }, []);

  /**
   * Clear recordings
   */
  const clearRecordings = useCallback(() => {
    setRecordings([]);
  }, []);

  /**
   * Download recording
   */
  const downloadRecording = useCallback((recording: RecordedVideo) => {
    downloadBlob(recording?.blob, recording?.fileName);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    countdown,
    duration,
    recordings,
    startRecording,
    stopRecording,
    clearRecordings,
    downloadRecording,
  };
}
