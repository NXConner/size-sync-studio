'use client';

import { Play, Square, Download, Trash2 } from 'lucide-react';
import { formatCountdown, formatDuration } from '@/lib/sync-utils';
import { RecordingState, RecordedVideo } from '@/hooks/use-recording';

interface RecordingControlsProps {
  recordingState: RecordingState;
  recordings: RecordedVideo[];
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearRecordings: () => void;
  disabled?: boolean;
}

export function RecordingControls({
  recordingState,
  recordings,
  onStartRecording,
  onStopRecording,
  onClearRecordings,
  disabled,
}: RecordingControlsProps) {
  const { isRecording, countdown, duration } = recordingState ?? {};

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Countdown display */}
      {countdown > 0 && (
        <div className="flex items-center justify-center">
          <div className="bg-purple-600 text-white px-8 py-4 rounded-2xl text-5xl font-bold animate-pulse">
            {formatCountdown(countdown)}
          </div>
        </div>
      )}

      {/* Recording duration */}
      {isRecording && countdown === 0 && (
        <div className="flex items-center justify-center">
          <div className="bg-red-600 text-white px-6 py-3 rounded-xl text-2xl font-medium">
            {formatDuration(duration)}
          </div>
        </div>
      )}

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            disabled={disabled}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            Start Recording
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Square className="w-5 h-5" />
            Stop Recording
          </button>
        )}
      </div>

      {/* Recordings list */}
      {(recordings?.length ?? 0) > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Recordings ({recordings?.length ?? 0})</h3>
            <button
              onClick={onClearRecordings}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {recordings?.map?.((recording) => (
              <div
                key={recording?.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{recording?.cameraLabel}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDuration(recording?.duration)} • {recording?.startTime?.toLocaleTimeString?.()}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const url = URL?.createObjectURL?.(recording?.blob);
                    const a = document?.createElement?.('a');
                    if (a) {
                      a.href = url ?? '';
                      a.download = recording?.fileName ?? 'recording.webm';
                      a?.click?.();
                      URL?.revokeObjectURL?.(url ?? '');
                    }
                  }}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
