import Peer, { type DataConnection, type MediaConnection } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';

export interface ScreenShareSession {
  peer: Peer;
  connection?: MediaConnection | DataConnection;
  isHost: boolean;
  roomId: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'waiting' | 'setup';
}

export interface GuestInfo {
  id: string;
  nickname: string;
}

export class ScreenShareManager {
  private peer: Peer | null = null;
  private mediaConnection: MediaConnection | null = null;
  private stream: MediaStream | null = null;
  private onStatusChange?: (status: ScreenShareSession['status']) => void;
  private onStreamReceived?: (stream: MediaStream) => void;
  private onError?: (error: string) => void;
  private onGuestJoined?: (guest: GuestInfo) => void;
  private onGuestLeft?: (guestId: string) => void;
  private isHost: boolean = false;
  private connectedGuests: Map<string, GuestInfo> = new Map(); // Track connected guests with nicknames
  private userNickname: string = '';
  private hostNickname: string = '';

  constructor(
    onStatusChange?: (status: ScreenShareSession['status']) => void,
    onStreamReceived?: (stream: MediaStream) => void,
    onError?: (error: string) => void,
    onGuestJoined?: (guest: GuestInfo) => void,
    onGuestLeft?: (guestId: string) => void
  ) {
    this.onStatusChange = onStatusChange;
    this.onStreamReceived = onStreamReceived;
    this.onError = onError;
    this.onGuestJoined = onGuestJoined;
    this.onGuestLeft = onGuestLeft;
  }

  // Set user nickname
  setNickname(nickname: string): void {
    this.userNickname = nickname;
  }

  // Generate a simple room ID
  generateRoomId(): string {
    return uuidv4().substring(0, 8).toUpperCase();
  }

  // Initialize host room (create peer connection without starting screen share)
  async initializeHostRoom(roomId: string): Promise<void> {
    try {
      console.log('🏠 HOST: Initializing room:', roomId);
      this.isHost = true;
      this.onStatusChange?.('setup');

      // Initialize peer with room ID (without screen stream)
      console.log('🌐 HOST: Creating peer connection for room...');
      await this.initializePeer(roomId);
      
      console.log('✅ HOST: Room initialized successfully, ready for guests');
    } catch (error: unknown) {
      console.error('❌ HOST: Failed to initialize room:', error);
      this.onStatusChange?.('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize room';
      this.onError?.(errorMessage);
      throw error;
    }
  }

  // Call a specific guest with current stream
  private callGuest(guestId: string): void {
    if (!this.peer || !this.stream) return;

    console.log('📞 HOST: Calling guest:', guestId);
    const call = this.peer.call(guestId, this.stream);
    
    call.on('stream', (remoteStream) => {
      console.log('📤 HOST: Received stream back from guest (should be empty)');
    });

    call.on('error', (error) => {
      console.error('❌ HOST: Call to guest failed:', error);
      // Remove failed guest from tracking
      this.connectedGuests.delete(guestId);
      this.onGuestLeft?.(guestId);
    });

    call.on('close', () => {
      console.log('📞 HOST: Call to guest closed:', guestId);
    });

    // Store the connection (we might want to track multiple connections in the future)
    this.mediaConnection = call;
  }

  // Initialize peer connection
  async initializePeer(peerId?: string): Promise<Peer> {
    // If we already have a connected peer with the same ID, reuse it
    if (this.peer && this.peer.id === peerId && !this.peer.destroyed && !this.peer.disconnected) {
      console.log('♻️ Reusing existing peer connection for ID:', peerId);
      return Promise.resolve(this.peer);
    }

    if (this.peer) {
      this.peer.destroy();
    }

    return new Promise((resolve, reject) => {
      this.peer = peerId ? new Peer(peerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      }) : new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      });

      this.peer.on('open', (id) => {
        const role = this.isHost ? 'HOST' : 'GUEST';
        console.log(`🌐 ${role}: Peer connected successfully with ID:`, id);
        if (!this.isHost) {
          this.onStatusChange?.('connected');
        }
        resolve(this.peer!);
      });

      this.peer.on('error', (error) => {
        const role = this.isHost ? 'HOST' : 'GUEST';
        console.error(`❌ ${role}: Peer connection error:`, error);
        this.onStatusChange?.('error');
        this.onError?.(error.message || 'Failed to connect to peer network');
        reject(error);
      });

      this.peer.on('call', (call) => {
        console.log('📞 Incoming call received from:', call.peer);
        
        // Host answers with screen stream, guest answers with empty stream
        if (this.isHost && this.stream) {
          const tracks = this.stream.getTracks();
          console.log('📤 HOST: Answering call with screen stream');
          console.log('📤 HOST: Stream tracks being sent:', tracks.length, tracks.map(t => ({ kind: t.kind, label: t.label, enabled: t.enabled, readyState: t.readyState })));
          call.answer(this.stream);
          // onGuestJoined will be called when nickname is received via data connection
          console.log('👥 HOST: Guest joined! Total guests now handled');
        } else {
          console.log('📞 GUEST: Answering incoming call from host');
          
          // Close any existing media connection first
          if (this.mediaConnection) {
            console.log('📞 GUEST: Closing previous media connection');
            this.mediaConnection.close();
          }
          
          call.answer();
          // Update status to connecting when receiving a call (before stream arrives)
          this.onStatusChange?.('connecting');
          console.log('🔄 GUEST: Status updated to connecting, waiting for stream...');
        }
        
        call.on('stream', (remoteStream) => {
          const tracks = remoteStream.getTracks();
          console.log('📥 Stream received via call.on(\'stream\')');
          console.log('📥 Stream details:', { 
            id: remoteStream.id, 
            active: remoteStream.active,
            tracks: tracks.length,
            trackDetails: tracks.map(t => ({ kind: t.kind, label: t.label, enabled: t.enabled, readyState: t.readyState }))
          });
          
          // Only guests should receive streams
          if (!this.isHost) {
            console.log('👥 GUEST: Processing received stream');
            this.onStreamReceived?.(remoteStream);
            // Update status to connected when receiving stream
            this.onStatusChange?.('connected');
            console.log('✅ GUEST: Status updated to connected');
          } else {
            console.log('📤 HOST: Ignoring received stream (host shouldn\'t receive)');
          }
        });

        call.on('error', (error) => {
          console.error('❌ Call error:', error);
          this.onError?.(error.message || 'Call failed');
        });

        call.on('close', () => {
          console.log('📞 Call closed');
          if (this.isHost) {
            this.onStatusChange?.('setup');
          } else {
            // Guest: Host stopped sharing but room is still open
            console.log('📞 GUEST: Host stopped sharing, waiting for reconnection...');
            this.onStatusChange?.('waiting');
          }
        });

        this.mediaConnection = call;
      });

      this.peer.on('connection', (conn) => {
        const role = this.isHost ? 'HOST' : 'GUEST';
        console.log(`🔗 ${role}: Data connection established with:`, conn.peer);
        
        if (this.isHost) {
          // Track this guest (nickname will be received via data message)
          const guestInfo: GuestInfo = { id: conn.peer, nickname: 'Guest' };
          this.connectedGuests.set(conn.peer, guestInfo);
          console.log('👥 HOST: Added guest to tracked list. Total guests:', this.connectedGuests.size);
          
          // Listen for nickname data
          conn.on('data', (data: unknown) => {
            const parsedData = data as { type: string; nickname: string };
            console.log('👤 HOST: Received data from guest:', parsedData);
            if (parsedData.type === 'nickname') {
              const updatedGuestInfo: GuestInfo = { id: conn.peer, nickname: parsedData.nickname };
              this.connectedGuests.set(conn.peer, updatedGuestInfo);
              console.log('👤 HOST: Received guest nickname:', parsedData.nickname);
              console.log('👤 HOST: Updated guest info:', updatedGuestInfo);
              console.log('👤 HOST: All connected guests after update:', Array.from(this.connectedGuests.values()));
              this.onGuestJoined?.(updatedGuestInfo);
            }
          });

          // Send host nickname to guest when connection opens
          conn.on('open', () => {
            console.log('🔗 HOST: Data connection opened, sending nickname:', this.userNickname);
            console.log('🔗 HOST: Current guest info before nickname exchange:', this.connectedGuests.get(conn.peer));
            conn.send({ type: 'nickname', nickname: this.userNickname });
          });

          // If we're already sharing, call this guest immediately
          if (this.stream) {
            console.log('📞 HOST: Calling new guest with current stream');
            this.callGuest(conn.peer);
          }

          // Handle guest disconnection
          conn.on('close', () => {
            console.log('🔗 HOST: Guest disconnected:', conn.peer);
            this.connectedGuests.delete(conn.peer);
            this.onGuestLeft?.(conn.peer);
            console.log('👥 HOST: Removed guest. Remaining guests:', this.connectedGuests.size);
          });
        } else {
          // Guest receives host nickname (but doesn't send here - sends in joinScreenShare)
          conn.on('data', (data: unknown) => {
            const parsedData = data as { type: string; nickname: string };
            if (parsedData.type === 'nickname') {
              this.hostNickname = parsedData.nickname;
              console.log('👤 GUEST: Received host nickname (via peer connection):', parsedData.nickname);
            }
          });
        }
      });

      this.peer.on('disconnected', () => {
        console.log('Peer disconnected');
        this.onStatusChange?.('disconnected');
      });
    });
  }

  // Start screen sharing as host
  async startScreenShare(roomId: string): Promise<void> {
    try {
      console.log('🎯 HOST: Starting screen share process for room:', roomId);
      this.onStatusChange?.('connecting');
      this.isHost = true;

      // Get screen and audio
      console.log('🖥️ HOST: Requesting screen capture...');
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { max: 1920 },
          height: { max: 1080 },
          frameRate: { max: 30 }
        },
        audio: true
      });

      const videoTracks = this.stream.getVideoTracks();
      const audioTracks = this.stream.getAudioTracks();
      console.log('✅ HOST: Screen stream obtained successfully!');
      console.log('📹 HOST: Video tracks:', videoTracks.length, videoTracks.map(t => ({ label: t.label, enabled: t.enabled, readyState: t.readyState })));
      console.log('🔊 HOST: Audio tracks:', audioTracks.length, audioTracks.map(t => ({ label: t.label, enabled: t.enabled, readyState: t.readyState })));

      // Initialize peer with room ID AFTER getting the stream
      console.log('🌐 HOST: Initializing peer connection...');
      const peer = await this.initializePeer(roomId);
      const isReusedPeer = peer.id === roomId && this.connectedGuests.size > 0;

      console.log('✅ HOST: Screen sharing started successfully, waiting for guests...');
      this.onStatusChange?.('connected');

      // Call all existing guests with the new stream (if peer was reused)
      if (isReusedPeer && this.connectedGuests.size > 0) {
        console.log('📞 HOST: Calling all existing guests with new stream (reused peer)');
        for (const [guestId] of this.connectedGuests) {
          this.callGuest(guestId);
        }
      }
      
      // Handle when stream ends (user stops sharing)
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('🛑 HOST: Screen sharing ended by user');
        this.stopScreenShare();
      });

    } catch (error: unknown) {
      console.error('❌ HOST: Failed to start screen sharing:', error);
      this.onStatusChange?.('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to start screen sharing';
      this.onError?.(errorMessage);
      throw error;
    }
  }

  // Join screen sharing as guest
  async joinScreenShare(roomId: string): Promise<void> {
    try {
      console.log('👥 GUEST: Attempting to join room:', roomId);
      this.onStatusChange?.('connecting');
      this.isHost = false;

      // Initialize peer with random ID
      console.log('🌐 GUEST: Initializing peer connection...');
      await this.initializePeer();

      // Establish data connection to host (this will trigger host to call us)
      if (this.peer) {
        console.log('🔗 GUEST: Connecting to host:', roomId);
        const conn = this.peer.connect(roomId);
        
        conn.on('open', () => {
          console.log('✅ GUEST: Data connection to host established');
          console.log('🔗 GUEST: Data connection opened, sending nickname:', this.userNickname);
          console.log('🔗 GUEST: About to send nickname to host:', { type: 'nickname', nickname: this.userNickname });
          conn.send({ type: 'nickname', nickname: this.userNickname });
          // Host should now call us with the stream
        });

        conn.on('error', (error) => {
          console.error('❌ GUEST: Data connection error:', error);
          this.onStatusChange?.('error');
          this.onError?.(error.message || 'Failed to connect to host');
        });

        // Also listen for host's nickname
        conn.on('data', (data: unknown) => {
          const parsedData = data as { type: string; nickname: string };
          console.log('👤 GUEST: Received data from host:', parsedData);
          if (parsedData.type === 'nickname') {
            this.hostNickname = parsedData.nickname;
            console.log('👤 GUEST: Received host nickname:', parsedData.nickname);
          }
        });

      } else {
        console.error('❌ GUEST: Peer not initialized properly');
      }

    } catch (error: unknown) {
      console.error('❌ GUEST: Failed to join screen share:', error);
      this.onStatusChange?.('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to join screen share';
      this.onError?.(errorMessage);
      throw error;
    }
  }

  // Stop screen sharing
  stopScreenShare(): void {
    console.log('🛑 Stopping screen share...');
    
    if (this.stream) {
      console.log('🛑 Stopping local stream tracks');
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }

    if (this.mediaConnection) {
      console.log('🛑 Closing media connection');
      this.mediaConnection.close();
      this.mediaConnection = null;
    }

    if (this.isHost) {
      // Host stops sharing but keeps peer connection alive for potential reconnection
      console.log('🛑 HOST: Stopped sharing but keeping room open');
      this.onStatusChange?.('setup'); // Back to setup state, not disconnected
    } else {
      // Guest disconnects completely
      console.log('🛑 GUEST: Disconnecting from room');
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }
      this.onStatusChange?.('disconnected');
    }
  }

  // Get current peer ID
  getPeerId(): string | null {
    return this.peer?.id || null;
  }

  // Get number of connected guests (for host)
  getGuestCount(): number {
    return this.connectedGuests.size;
  }

  // Get list of connected guests (for host)
  getConnectedGuests(): GuestInfo[] {
    return Array.from(this.connectedGuests.values());
  }

  // Get host nickname (for guest)
  getHostNickname(): string {
    return this.hostNickname;
  }

  // Get all connected users info (for guests - includes host + other guests)
  getAllUsers(): { host: string; guests: string[] } {
    if (this.isHost) {
      return {
        host: this.userNickname,
        guests: Array.from(this.connectedGuests.values()).map(g => g.nickname)
      };
    } else {
      return {
        host: this.hostNickname,
        guests: [this.userNickname] // For now, guests only see themselves in the list
      };
    }
  }

  // Check if screen sharing is supported
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }
} 