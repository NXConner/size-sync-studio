// WebRTC connection manager based on ex-pose-positions patterns

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface SignalPayload {
  type: 'offer' | 'answer' | 'ice-candidate';
  from: string;
  to: string;
  data: any;
}

export const DEFAULT_ICE_CONFIG: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class WebRTCManager {
  private peers: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private localStream: MediaStream | null = null;
  private config: WebRTCConfig;
  private onRemoteStreamCallback?: (peerId: string, stream: MediaStream) => void;
  private onIceCandidateCallback?: (peerId: string, candidate: RTCIceCandidate) => void;
  private onConnectionStateCallback?: (peerId: string, state: RTCPeerConnectionState) => void;

  constructor(config: WebRTCConfig = DEFAULT_ICE_CONFIG) {
    this.config = config;
  }

  /**
   * Set local stream
   */
  setLocalStream(stream: MediaStream | null): void {
    this.localStream = stream;
  }

  /**
   * Create peer connection
   */
  private createPeerConnection(peerId: string): RTCPeerConnection {
    const peer = new RTCPeerConnection(this.config);

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event?.candidate) {
        this.onIceCandidateCallback?.(peerId, event?.candidate);
      }
    };

    // Handle remote tracks
    peer.ontrack = (event) => {
      const stream = event?.streams?.[0];
      if (stream) {
        this.remoteStreams?.set?.(peerId, stream);
        this.onRemoteStreamCallback?.(peerId, stream);
      }
    };

    // Handle connection state changes
    peer.onconnectionstatechange = () => {
      this.onConnectionStateCallback?.(peerId, peer?.connectionState);
      
      if (peer?.connectionState === 'failed' || peer?.connectionState === 'closed') {
        this.removePeer(peerId);
      }
    };

    // Add local tracks
    if (this.localStream) {
      this.localStream?.getTracks?.()?.forEach?.((track) => {
        if (this.localStream) {
          peer?.addTrack?.(track, this.localStream);
        }
      });
    }

    this.peers?.set?.(peerId, peer);
    return peer;
  }

  /**
   * Get or create peer connection
   */
  private getPeer(peerId: string): RTCPeerConnection {
    let peer = this.peers?.get?.(peerId);
    if (!peer) {
      peer = this.createPeerConnection(peerId);
    }
    return peer;
  }

  /**
   * Create offer for peer
   */
  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit | null> {
    try {
      const peer = this.getPeer(peerId);
      const offer = await peer?.createOffer?.();
      if (!offer) return null;
      
      await peer?.setLocalDescription?.(offer);
      return offer;
    } catch (error) {
      console.error(`Failed to create offer for ${peerId}:`, error);
      return null;
    }
  }

  /**
   * Handle received offer
   */
  async handleOffer(
    peerId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit | null> {
    try {
      const peer = this.getPeer(peerId);
      await peer?.setRemoteDescription?.(new RTCSessionDescription(offer));
      
      const answer = await peer?.createAnswer?.();
      if (!answer) return null;
      
      await peer?.setLocalDescription?.(answer);
      return answer;
    } catch (error) {
      console.error(`Failed to handle offer from ${peerId}:`, error);
      return null;
    }
  }

  /**
   * Handle received answer
   */
  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const peer = this.peers?.get?.(peerId);
      if (peer) {
        await peer?.setRemoteDescription?.(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error(`Failed to handle answer from ${peerId}:`, error);
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      const peer = this.peers?.get?.(peerId);
      if (peer && peer?.remoteDescription) {
        await peer?.addIceCandidate?.(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error(`Failed to add ICE candidate for ${peerId}:`, error);
    }
  }

  /**
   * Remove peer connection
   */
  removePeer(peerId: string): void {
    const peer = this.peers?.get?.(peerId);
    if (peer) {
      try {
        peer?.close?.();
      } catch (err) {
        console.error('Error closing peer:', err);
      }
      this.peers?.delete?.(peerId);
    }
    this.remoteStreams?.delete?.(peerId);
  }

  /**
   * Get remote stream
   */
  getRemoteStream(peerId: string): MediaStream | undefined {
    return this.remoteStreams?.get?.(peerId);
  }

  /**
   * Get all remote streams
   */
  getAllRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams ?? new Map();
  }

  /**
   * Set callback for remote stream
   */
  onRemoteStream(callback: (peerId: string, stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  /**
   * Set callback for ICE candidate
   */
  onIceCandidate(callback: (peerId: string, candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateCallback = callback;
  }

  /**
   * Set callback for connection state change
   */
  onConnectionState(callback: (peerId: string, state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateCallback = callback;
  }

  /**
   * Cleanup all connections
   */
  cleanup(): void {
    this.peers?.forEach?.((peer, peerId) => {
      try {
        peer?.close?.();
      } catch (err) {
        console.error(`Error closing peer ${peerId}:`, err);
      }
    });
    this.peers?.clear?.();
    this.remoteStreams?.clear?.();
  }
}
