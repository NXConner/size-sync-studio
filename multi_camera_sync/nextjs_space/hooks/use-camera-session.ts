// Custom hook for camera session management
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCManager } from '@/lib/webrtc-manager';
import { generateParticipantId, getDeviceLabel } from '@/lib/sync-utils';

export interface ParticipantInfo {
  id: string;
  label: string;
  isSelf: boolean;
  connected: boolean;
}

export interface RemoteStreamInfo {
  participantId: string;
  stream: MediaStream;
  label: string;
}

export interface CameraSessionState {
  sessionId: string | null;
  participantId: string;
  localStream: MediaStream | null;
  remoteStreams: RemoteStreamInfo[];
  participants: ParticipantInfo[];
  isConnected: boolean;
  error: string | null;
}

export function useCameraSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamInfo[]>([]);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const participantIdRef = useRef<string>(generateParticipantId());
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  /**
   * Initialize WebRTC manager
   */
  useEffect(() => {
    webrtcManagerRef.current = new WebRTCManager();

    // Handle remote stream
    webrtcManagerRef.current?.onRemoteStream?.((peerId, stream) => {
      setRemoteStreams((prev) => {
        const existing = prev?.find?.((s) => s?.participantId === peerId);
        if (existing) return prev;

        const label = participants?.find?.((p) => p?.id === peerId)?.label ?? 'Remote Camera';
        return [...(prev ?? []), { participantId: peerId, stream, label }];
      });
    });

    // Handle ICE candidate
    webrtcManagerRef.current?.onIceCandidate?.((peerId, candidate) => {
      sendSignal(peerId, {
        type: 'ice-candidate',
        from: participantIdRef?.current ?? '',
        to: peerId,
        data: candidate?.toJSON?.(),
      });
    });

    // Handle connection state
    webrtcManagerRef.current?.onConnectionState?.((peerId, state) => {
      console.log(`Peer ${peerId} state:`, state);
      
      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        setRemoteStreams((prev) => prev?.filter?.((s) => s?.participantId !== peerId) ?? []);
      }
    });

    return () => {
      webrtcManagerRef.current?.cleanup?.();
    };
  }, [participants]);

  /**
   * Create new session
   */
  const createSession = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/sessions', {
        method: 'POST',
      });

      const data = await response?.json?.();

      if (data?.success && data?.session) {
        setSessionId(data?.session?.id);
        await joinChannel(data?.session?.id);
        return data?.session?.id;
      }

      throw new Error('Failed to create session');
    } catch (err) {
      const message = err instanceof Error ? err?.message : 'Failed to create session';
      setError(message);
      return null;
    }
  }, []);

  /**
   * Join existing session
   */
  const joinSession = useCallback(async (sessionIdToJoin: string) => {
    try {
      setError(null);
      
      // Verify session exists
      const response = await fetch(`/api/sessions?id=${sessionIdToJoin}`);
      const data = await response?.json?.();

      if (data?.success && data?.session) {
        setSessionId(sessionIdToJoin);
        await joinChannel(sessionIdToJoin);
        return true;
      }

      throw new Error('Session not found');
    } catch (err) {
      const message = err instanceof Error ? err?.message : 'Failed to join session';
      setError(message);
      return false;
    }
  }, []);

  /**
   * Join broadcast channel
   */
  const joinChannel = useCallback(async (sessionIdToJoin: string) => {
    try {
      // Register device
      await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdToJoin,
          participantId: participantIdRef?.current,
          deviceLabel: getDeviceLabel(),
        }),
      });

      // Create broadcast channel for signaling
      const channel = new BroadcastChannel(`camera_sync:${sessionIdToJoin}`);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        handleChannelMessage(event?.data);
      };

      // Announce presence
      channel?.postMessage?.({
        type: 'presence',
        participantId: participantIdRef?.current,
        label: getDeviceLabel(),
      });

      setIsConnected(true);
    } catch (err) {
      console.error('Failed to join channel:', err);
    }
  }, []);

  /**
   * Handle channel messages
   */
  const handleChannelMessage = useCallback(async (message: any) => {
    const { type, from, to, data } = message ?? {};

    // Ignore messages from self
    if (from === participantIdRef?.current) return;

    switch (type) {
      case 'presence':
        handlePresence(message);
        break;

      case 'signal':
        if (to === participantIdRef?.current || !to) {
          await handleSignal(message);
        }
        break;

      default:
        break;
    }
  }, []);

  /**
   * Handle presence announcement
   */
  const handlePresence = useCallback((message: any) => {
    const { participantId, label } = message ?? {};

    setParticipants((prev) => {
      const existing = prev?.find?.((p) => p?.id === participantId);
      if (existing) return prev;

      const newParticipant: ParticipantInfo = {
        id: participantId ?? '',
        label: label ?? 'Unknown',
        isSelf: participantId === participantIdRef?.current,
        connected: true,
      };

      return [...(prev ?? []), newParticipant];
    });

    // If not self, initiate WebRTC connection
    if (participantId !== participantIdRef?.current && participantId > participantIdRef?.current) {
      initiateConnection(participantId);
    }
  }, []);

  /**
   * Initiate WebRTC connection
   */
  const initiateConnection = useCallback(async (peerId: string) => {
    try {
      const offer = await webrtcManagerRef.current?.createOffer?.(peerId);
      if (offer) {
        sendSignal(peerId, {
          type: 'offer',
          from: participantIdRef?.current ?? '',
          to: peerId,
          data: offer,
        });
      }
    } catch (err) {
      console.error('Failed to initiate connection:', err);
    }
  }, []);

  /**
   * Handle WebRTC signaling
   */
  const handleSignal = useCallback(async (message: any) => {
    const { type, from, data } = message ?? {};

    try {
      if (type === 'offer') {
        const answer = await webrtcManagerRef.current?.handleOffer?.(from, data);
        if (answer) {
          sendSignal(from, {
            type: 'answer',
            from: participantIdRef?.current ?? '',
            to: from,
            data: answer,
          });
        }
      } else if (type === 'answer') {
        await webrtcManagerRef.current?.handleAnswer?.(from, data);
      } else if (type === 'ice-candidate') {
        await webrtcManagerRef.current?.addIceCandidate?.(from, data);
      }
    } catch (err) {
      console.error('Failed to handle signal:', err);
    }
  }, []);

  /**
   * Send signal via broadcast channel
   */
  const sendSignal = useCallback((to: string, payload: any) => {
    channelRef.current?.postMessage?.(payload);
  }, []);

  /**
   * Enable local camera
   */
  const enableCamera = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      
      const stream = await navigator?.mediaDevices?.getUserMedia?.({
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: 1280, height: 720 },
        audio: true,
      });

      setLocalStream(stream);
      webrtcManagerRef.current?.setLocalStream?.(stream);

      return stream;
    } catch (err) {
      const message = err instanceof Error ? err?.message : 'Failed to enable camera';
      setError(message);
      return null;
    }
  }, []);

  /**
   * Disable local camera
   */
  const disableCamera = useCallback(() => {
    if (localStream) {
      localStream?.getTracks?.()?.forEach?.((track) => track?.stop?.());
      setLocalStream(null);
      webrtcManagerRef.current?.setLocalStream?.(null);
    }
  }, [localStream]);

  /**
   * Send command to all participants
   */
  const sendCommand = useCallback((command: any) => {
    channelRef.current?.postMessage?.({
      type: 'command',
      from: participantIdRef?.current,
      ...command,
    });
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disableCamera();
      channelRef.current?.close?.();
      webrtcManagerRef.current?.cleanup?.();
    };
  }, []);

  return {
    sessionId,
    participantId: participantIdRef?.current ?? '',
    localStream,
    remoteStreams,
    participants,
    isConnected,
    error,
    createSession,
    joinSession,
    enableCamera,
    disableCamera,
    sendCommand,
  };
}
