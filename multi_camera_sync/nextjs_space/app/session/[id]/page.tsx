'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, CameraOff } from 'lucide-react';
import { useCameraSession } from '@/hooks/use-camera-session';
import { useRecording } from '@/hooks/use-recording';
import { CameraGrid } from '@/components/camera-grid';
import { RecordingControls } from '@/components/recording-controls';
import { SessionInfo } from '@/components/session-info';
import { PlaybackViewer } from '@/components/playback-viewer';
import { motion } from 'framer-motion';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [showPlayback, setShowPlayback] = useState(false);

  const {
    localStream,
    remoteStreams,
    participants,
    isConnected,
    error: sessionError,
    joinSession,
    enableCamera,
    disableCamera,
    sendCommand,
  } = useCameraSession();

  const {
    isRecording,
    countdown,
    duration,
    recordings,
    startRecording,
    stopRecording,
    clearRecordings,
  } = useRecording();

  // Join session on mount
  useEffect(() => {
    if (sessionId) {
      joinSession(sessionId);
    }
  }, [sessionId, joinSession]);

  // Handle camera toggle
  const handleCameraToggle = async () => {
    if (cameraEnabled) {
      disableCamera();
      setCameraEnabled(false);
    } else {
      const stream = await enableCamera();
      if (stream) {
        setCameraEnabled(true);
      }
    }
  };

  // Handle recording start
  const handleStartRecording = () => {
    const streams = [
      ...(localStream ? [{ id: 'local', stream: localStream, label: 'You' }] : []),
      ...(remoteStreams?.map?.((r) => ({
        id: r?.participantId ?? '',
        stream: r?.stream,
        label: r?.label ?? 'Remote',
      })) ?? []),
    ];

    if ((streams?.length ?? 0) === 0) {
      alert('Please enable at least one camera before recording');
      return;
    }

    // Send command to all participants
    sendCommand({ action: 'start_recording', startAt: Date.now() + 3000 });
    
    // Start local recording
    startRecording(streams, 3000);
  };

  // Handle recording stop
  const handleStopRecording = () => {
    sendCommand({ action: 'stop_recording' });
    stopRecording();
  };

  // Show playback when recordings are available
  useEffect(() => {
    if ((recordings?.length ?? 0) > 0 && !isRecording) {
      setShowPlayback(true);
    }
  }, [recordings, isRecording]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router?.push?.('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          {!cameraEnabled && (
            <button
              onClick={handleCameraToggle}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Camera className="w-5 h-5" />
              Enable Camera
            </button>
          )}

          {cameraEnabled && (
            <button
              onClick={handleCameraToggle}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <CameraOff className="w-5 h-5" />
              Disable Camera
            </button>
          )}
        </motion.div>

        {/* Error message */}
        {sessionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg"
          >
            {sessionError}
          </motion.div>
        )}

        {/* Session Info */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <SessionInfo sessionId={sessionId} participants={participants} />
          </motion.div>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Camera Grid */}
          {!showPlayback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CameraGrid
                localStream={localStream}
                remoteStreams={remoteStreams}
                isRecording={isRecording}
              />
            </motion.div>
          )}

          {/* Playback Viewer */}
          {showPlayback && (recordings?.length ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Playback
                </h2>
                <button
                  onClick={() => setShowPlayback(false)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Back to Live View
                </button>
              </div>
              <PlaybackViewer recordings={recordings} />
            </motion.div>
          )}

          {/* Recording Controls */}
          {!showPlayback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecordingControls
                recordingState={{ isRecording, countdown, duration }}
                recordings={recordings}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onClearRecordings={clearRecordings}
                disabled={!cameraEnabled && (remoteStreams?.length ?? 0) === 0}
              />
            </motion.div>
          )}
        </div>

        {/* Empty state */}
        {!cameraEnabled && (remoteStreams?.length ?? 0) === 0 && !showPlayback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg max-w-2xl mx-auto">
              <div className="bg-purple-100 dark:bg-purple-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Enable Your Camera
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Click the "Enable Camera" button above to start your video feed.
                Share the session link with others to connect multiple cameras.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
