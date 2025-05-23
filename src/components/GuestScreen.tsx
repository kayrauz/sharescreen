import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Maximize2, Volume2, VolumeX, Wifi, AlertCircle, Users, User } from 'lucide-react';
import { ScreenShareManager } from '../utils/webrtc';

interface GuestScreenProps {
  roomId: string;
  nickname: string;
  onBack: () => void;
}

export default function GuestScreen({ roomId, nickname, onBack }: GuestScreenProps) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error' | 'waiting'>('connecting');
  const [error, setError] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted to allow autoplay
  const [hostNickname, setHostNickname] = useState<string>('');
  const [showParticipants, setShowParticipants] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const managerRef = useRef<ScreenShareManager | null>(null);
  const pendingStreamRef = useRef<MediaStream | null>(null); // Store stream if video ref not ready

  useEffect(() => {
    const manager = new ScreenShareManager(
      (newStatus) => {
        // Map WebRTC manager statuses to guest UI statuses
        if (newStatus === 'setup') {
          setStatus('waiting');
        } else if (newStatus === 'disconnected') {
          setStatus('disconnected');
          setError('Host disconnected');
        } else {
          setStatus(newStatus as 'connecting' | 'connected' | 'error' | 'waiting');
        }
      },
      (stream) => {
        console.log('🎥 GUEST UI: Received stream callback, setting video stream:', stream);
        console.log('🎥 GUEST UI: Stream details:', {
          id: stream.id,
          active: stream.active,
          tracks: stream.getTracks().length,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length
        });
        
        if (videoRef.current) {
          console.log('🎥 GUEST UI: Setting stream to video element immediately');
          videoRef.current.srcObject = stream;
          
          // Ensure video is muted for autoplay to work
          videoRef.current.muted = true;
          setIsMuted(true);
          
          // Try to play the video (muted, so should work)
          videoRef.current.play()
            .then(() => {
              console.log('✅ GUEST UI: Video started playing successfully (muted)');
            })
            .catch(e => {
              console.error('❌ GUEST UI: Video play error:', e);
              console.log('ℹ️ GUEST UI: User can manually click to play');
            });
        } else {
          console.log('⏳ GUEST UI: Video element not ready, storing stream for later');
          pendingStreamRef.current = stream;
        }
      },
      (errorMessage) => {
        setError(errorMessage);
        setStatus('error');
      },
      () => {
        // Guest joined callback (not needed for guest)
      }
    );

    managerRef.current = manager;
    
    // Set the user's nickname
    manager.setNickname(nickname);

    // Join the room
    manager.joinScreenShare(roomId).catch((err) => {
      console.error('Failed to join room:', err);
    });

    // Update host nickname periodically
    const updateUserInfo = () => {
      if (managerRef.current) {
        const hostNick = managerRef.current.getHostNickname();
        if (hostNick) {
          setHostNickname(hostNick);
        }
      }
    };

    const interval = setInterval(updateUserInfo, 1000); // Check every second

    return () => {
      manager.stopScreenShare();
      clearInterval(interval);
    };
  }, [roomId, nickname]);

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          await videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Effect to set pending stream when video element becomes available
  useEffect(() => {
    if (videoRef.current && pendingStreamRef.current) {
      console.log('🎥 GUEST UI: Video element now available, setting pending stream');
      const stream = pendingStreamRef.current;
      videoRef.current.srcObject = stream;
      
      // Ensure video is muted for autoplay to work
      videoRef.current.muted = true;
      setIsMuted(true);
      
      // Try to play the video (muted, so should work)
      videoRef.current.play()
        .then(() => {
          console.log('✅ GUEST UI: Pending video started playing successfully (muted)');
        })
        .catch(e => {
          console.error('❌ GUEST UI: Pending video play error:', e);
          console.log('ℹ️ GUEST UI: User can manually click to play');
        });
      
      // Clear the pending stream
      pendingStreamRef.current = null;
    }
  });

  const getStatusContent = () => {
    switch (status) {
      case 'connecting':
        return (
          <div className="flex flex-col items-center space-y-4 animate-fade-in">
            <Wifi className="w-12 h-12 text-blue-500 animate-pulse" />
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-[var(--color-text-primary)]">
                Connecting to {roomId}
              </h3>
              {hostNickname && (
                <p className="text-lg text-[var(--color-text-secondary)] mb-2">
                  Hosted by {hostNickname}
                </p>
              )}
              <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
                Welcome, {nickname}!
              </p>
              <p className="text-[var(--color-text-secondary)]">
                Waiting for host to start sharing...
              </p>
            </div>
          </div>
        );

      case 'waiting':
        return (
          <div className="flex flex-col items-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center animate-breathe">
              <Wifi className="w-10 h-10 text-yellow-500" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-3 text-[var(--color-text-primary)]">
                Waiting for {hostNickname || 'Host'}
              </h3>
              <p className="text-lg text-[var(--color-text-secondary)] mb-2 leading-relaxed">
                {hostNickname ? `${hostNickname} has paused` : 'The host has paused'} screen sharing
              </p>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
                Hi {nickname}! You'll automatically see their screen when they start sharing again
              </p>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-[var(--color-text-tertiary)] mb-8">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span>Room {roomId} • Connected{hostNickname ? ` to ${hostNickname}` : ''}</span>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="btn-secondary px-6 py-3 font-semibold"
              >
                Leave Room
              </button>
            </div>
          </div>
        );

      case 'error':
      case 'disconnected':
        return (
          <div className="flex flex-col items-center space-y-4 animate-fade-in">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-[var(--color-text-primary)]">
                Connection Failed
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-6">
                {error || 'Unable to connect to the host'}
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="btn-primary px-6 py-3 font-semibold"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="btn-secondary px-6 py-3 font-semibold ml-3"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (status !== 'connected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {getStatusContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Header controls */}
      {!isFullscreen && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {hostNickname ? `${hostNickname}'s Screen` : `Room ${roomId}`}
                </h2>
                <p className="text-sm text-white/70">
                  {hostNickname ? `Room ${roomId} by ${hostNickname} • Viewing as ${nickname}` : 'Viewing shared screen'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Enter fullscreen"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants panel (right side hover) */}
      {!isFullscreen && (
        <div 
          className="absolute top-20 right-4 z-20"
          onMouseEnter={() => setShowParticipants(true)}
          onMouseLeave={() => setShowParticipants(false)}
        >
          {/* Participants trigger button */}
          <div className="flex justify-end">
            <button 
              type="button"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
              title="View participants"
            >
              <Users className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Participants panel */}
          {showParticipants && (
            <div className="mt-2 p-4 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 min-w-[200px] animate-fade-in">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Participants</span>
              </h3>
              
              <div className="space-y-2">
                {/* Host */}
                {hostNickname && (
                  <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-white font-medium">{hostNickname}</span>
                      <div className="text-xs text-green-400">Host</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                )}
                
                {/* Current guest (you) */}
                <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-white font-medium">{nickname}</span>
                    <div className="text-xs text-blue-400">You</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video container */}
      <div className="relative w-full h-screen flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="max-w-full max-h-full object-contain"
          onLoadedMetadata={() => {
            console.log('🎥 GUEST UI: Video metadata loaded');
            if (videoRef.current) {
              console.log('🎥 GUEST UI: Video dimensions:', {
                videoWidth: videoRef.current.videoWidth,
                videoHeight: videoRef.current.videoHeight,
                duration: videoRef.current.duration
              });
            }
          }}
          onCanPlay={() => {
            console.log('✅ GUEST UI: Video can play - ready for playback');
          }}
          onPlay={() => {
            console.log('▶️ GUEST UI: Video started playing');
          }}
          onPause={() => {
            console.log('⏸️ GUEST UI: Video paused');
          }}
          onWaiting={() => {
            console.log('⏳ GUEST UI: Video waiting for data');
          }}
          onPlaying={() => {
            console.log('🎬 GUEST UI: Video is now playing');
          }}
          onError={(e) => {
            console.error('❌ GUEST UI: Video element error:', e);
            if (videoRef.current) {
              console.error('❌ GUEST UI: Video error details:', {
                error: videoRef.current.error,
                networkState: videoRef.current.networkState,
                readyState: videoRef.current.readyState
              });
            }
          }}
        />

        {/* Click overlay for fullscreen toggle */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={toggleFullscreen}
          title="Click to toggle fullscreen"
        />
      </div>

      {/* Fullscreen controls */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-2 bg-black/60 rounded-lg px-4 py-2">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            <span className="text-white text-sm px-2">
              {hostNickname ? `${hostNickname}'s Screen` : `Room ${roomId}`}
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Exit fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 