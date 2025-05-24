import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Maximize2, Volume2, VolumeX, Wifi, AlertCircle, Users, User, Monitor, Activity, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScreenShareManager } from '../utils/webrtc';
import { useToast } from '../contexts/ToastContext';

interface GuestScreenProps {
  roomId: string;
  nickname: string;
  onBack: () => void;
}

export default function GuestScreen({ roomId, nickname, onBack }: GuestScreenProps) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error' | 'waiting'>('connecting');
  const [error, setError] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hostNickname, setHostNickname] = useState<string>('');
  const [showControls, setShowControls] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const managerRef = useRef<ScreenShareManager | null>(null);
  const pendingStreamRef = useRef<MediaStream | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    
    const manager = new ScreenShareManager(
      (newStatus) => {
        if (newStatus === 'setup') {
          setStatus('waiting');
        } else if (newStatus === 'disconnected') {
          setStatus('disconnected');
          setError('Host disconnected');
          showToast('Disconnected from host', 'info');
        } else {
          const statusValue = newStatus as 'connecting' | 'connected' | 'error' | 'waiting';
          setStatus(statusValue);
          if (statusValue === 'connected') {
            showToast('Connected successfully!', 'success');
          }
        }
      },
      (stream) => {
        console.log('🎥 GUEST UI: Received stream callback, setting video stream:', stream);
        
        if (videoRef.current) {
          console.log('🎥 GUEST UI: Setting stream to video element immediately');
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          setIsMuted(true);
          
          videoRef.current.play()
            .then(() => {
              console.log('✅ GUEST UI: Video started playing successfully (muted)');
            })
            .catch(e => {
              console.error('❌ GUEST UI: Video play error:', e);
            });
        } else {
          console.log('⏳ GUEST UI: Video element not ready, storing stream for later');
          pendingStreamRef.current = stream;
        }
      },
      (errorMessage) => {
        setError(errorMessage);
        setStatus('error');
        showToast(errorMessage, 'error');
      },
      () => {
        // Guest joined callback (not needed for guest)
      }
    );

    managerRef.current = manager;
    manager.setNickname(nickname);
    manager.joinScreenShare(roomId).catch((err) => {
      console.error('Failed to join room:', err);
    });

    const updateUserInfo = () => {
      if (managerRef.current) {
        const hostNick = managerRef.current.getHostNickname();
        if (hostNick) {
          setHostNickname(hostNick);
        }
      }
    };

    const interval = setInterval(updateUserInfo, 1000);

    return () => {
      manager.stopScreenShare();
      clearInterval(interval);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [roomId, nickname, showToast]);

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

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (status === 'connected' && !isFullscreen) {
        setShowControls(false);
      }
    }, 3000);
  }, [status, isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleMouseMove = () => {
      if (status === 'connected') {
        showControlsTemporarily();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [status, showControlsTemporarily]);

  useEffect(() => {
    if (videoRef.current && pendingStreamRef.current) {
      console.log('🎥 GUEST UI: Video element now available, setting pending stream');
      const stream = pendingStreamRef.current;
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      setIsMuted(true);
      
      videoRef.current.play()
        .then(() => {
          console.log('✅ GUEST UI: Pending video started playing successfully (muted)');
        })
        .catch(e => {
          console.error('❌ GUEST UI: Pending video play error:', e);
        });
      
      pendingStreamRef.current = null;
    }
  });

  const getStatusInfo = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: Wifi,
          color: 'blue',
          title: 'Connecting...',
          subtitle: `Joining ${roomId}${hostNickname ? ` (hosted by ${hostNickname})` : ''}`
        };
      case 'waiting':
        return {
          icon: Monitor,
          color: 'yellow',
          title: `Waiting for ${hostNickname || 'host'}`,
          subtitle: 'The host hasn\'t started sharing yet'
        };
      case 'connected':
        return {
          icon: Activity,
          color: 'green',
          title: 'Connected',
          subtitle: `Viewing ${hostNickname || 'host'}'s screen`
        };
      case 'disconnected':
        return {
          icon: AlertCircle,
          color: 'gray',
          title: 'Disconnected',
          subtitle: 'The session has ended'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'red',
          title: 'Connection Error',
          subtitle: 'Unable to connect to the session'
        };
      default:
        return {
          icon: Wifi,
          color: 'blue',
          title: 'Loading...',
          subtitle: 'Preparing connection'
        };
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (status === 'connected') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Video Player */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          muted={isMuted}
          style={{ minHeight: '100vh' }}
          onClick={showControlsTemporarily}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              showControlsTemporarily();
            }
          }}
          tabIndex={0}
        />

        {/* Controls Overlay */}
        {(showControls || isFullscreen) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 pointer-events-auto">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:text-white hover:bg-black/70 transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>

                <div className="flex items-center gap-3 px-4 py-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-white/80 text-sm font-medium">
                    Viewing {hostNickname || 'host'}'s screen
                  </span>
                </div>
              </div>
            </div>

            {/* Center Play/Pause Button */}
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-20 h-20 bg-black/70 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all group"
                >
                  <Play className="w-8 h-8 ml-1 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="p-3 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:text-white hover:bg-black/70 transition-all"
                  title={isPaused ? 'Play' : 'Pause'}
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-3 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:text-white hover:bg-black/70 transition-all"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-3 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:text-white hover:bg-black/70 transition-all"
                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Loading/Error/Waiting states
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        {/* Subtle floating shapes */}
        <motion.div
          className="absolute top-1/4 right-1/3 w-40 h-40 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)'
          }}
          animate={{
            x: [0, 25, 0],
            y: [0, -18, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 14,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-28 h-28 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.015) 0%, transparent 70%)'
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 12, 0],
            scale: [1, 0.92, 1],
          }}
          transition={{
            duration: 11,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </motion.div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Back Button */}
          <motion.button
            type="button"
            onClick={onBack}
            className="absolute top-0 left-0 flex items-center text-white/70 hover:text-white text-sm transition-colors group mb-8"
            whileHover={{ x: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave session
          </motion.button>

          {/* Status Icon */}
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 border border-white/10 rounded-2xl mb-8 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
            animate={{ 
              scale: status === 'connecting' || status === 'waiting' ? [1, 1.05, 1] : 1,
              opacity: status === 'connecting' || status === 'waiting' ? [1, 0.8, 1] : 1
            }}
            transition={{ 
              duration: status === 'connecting' || status === 'waiting' ? 2 : 0, 
              repeat: status === 'connecting' || status === 'waiting' ? Number.POSITIVE_INFINITY : 0, 
              ease: "easeInOut" 
            }}
          >
            <StatusIcon className={`w-10 h-10 ${
              statusInfo.color === 'green' ? 'text-white' :
              statusInfo.color === 'yellow' ? 'text-white/80' :
              statusInfo.color === 'red' ? 'text-white/60' :
              statusInfo.color === 'gray' ? 'text-white/50' :
              'text-white/70'
            }`} />
          </motion.div>
          
          {/* Title */}
          <motion.h1 
            className="text-4xl md:text-5xl font-semibold mb-4 text-white tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {statusInfo.title}
          </motion.h1>
          
          {/* User Info */}
          <motion.p 
            className="text-xl text-white/70 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            Welcome, <span className="font-medium text-white">{nickname}</span>
          </motion.p>

          {/* Status */}
          <motion.div 
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border text-sm font-medium ${
              statusInfo.color === 'green' ? 'bg-white/10 border-white/20 text-white' :
              statusInfo.color === 'yellow' ? 'bg-white/08 border-white/15 text-white/80' :
              statusInfo.color === 'red' ? 'bg-white/05 border-white/10 text-white/60' :
              statusInfo.color === 'gray' ? 'bg-white/03 border-white/08 text-white/50' :
              'bg-white/06 border-white/12 text-white/70'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          >
            <StatusIcon className="w-4 h-4" />
            <span>{statusInfo.subtitle}</span>
          </motion.div>
        </motion.div>

        {/* Room Info Card */}
        <motion.div 
          className="card p-8 mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-5 h-5 text-white/70" />
            <h3 className="text-xl font-medium text-white">
              Session Details
            </h3>
          </div>
          
          <div className="space-y-4">
            <motion.div 
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
              whileHover={{ 
                background: "rgba(255, 255, 255, 0.08)",
                borderColor: "rgba(255, 255, 255, 0.15)"
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-white/60">Room Code</span>
              <span className="font-mono font-bold text-white tracking-wider">{roomId}</span>
            </motion.div>
            
            {hostNickname && (
              <motion.div 
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
                whileHover={{ 
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)"
                }}
              >
                <span className="text-white/60">Host</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-white/80 flex items-center justify-center">
                    <User className="w-3 h-3 text-black" />
                  </div>
                  <span className="font-medium text-white">{hostNickname}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>



        {/* Action Button */}
        {(status === 'error' || status === 'disconnected') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            <motion.button
              type="button"
              onClick={onBack}
              className="w-full py-4 bg-white text-black text-lg font-medium rounded-xl hover:bg-white/90 transition-all relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 mr-3" />
                Return to Home
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* Instructions */}
        {status === 'waiting' && (
          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            <h4 className="font-medium mb-4 text-white flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              What happens next
            </h4>
            <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
              <li>The host will start sharing their screen</li>
              <li>You'll see their screen appear automatically</li>
              <li>Use the controls to adjust volume or go fullscreen</li>
              <li>The session is private and secure</li>
            </ol>
          </motion.div>
        )}
      </div>
    </div>
  );
} 