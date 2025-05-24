import { useState, useEffect, useRef } from 'react';
import { Copy, StopCircle, Users, Wifi, AlertCircle, User, Monitor, ArrowLeft, Eye, Share2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScreenShareManager, type GuestInfo } from '../utils/webrtc';
import { useToast } from '../contexts/ToastContext';

interface HostScreenProps {
  nickname: string;
  onBack: () => void;
}

export default function HostScreen({ nickname, onBack }: HostScreenProps) {
  const [roomId, setRoomId] = useState<string>('');
  const [status, setStatus] = useState<'setup' | 'connecting' | 'connected' | 'error'>('setup');
  const [error, setError] = useState<string>('');
  const [guestCount, setGuestCount] = useState(0);
  const [connectedGuests, setConnectedGuests] = useState<GuestInfo[]>([]);
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const managerRef = useRef<ScreenShareManager | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Generate room ID and initialize host room
    const manager = new ScreenShareManager(
      (newStatus) => {
        if (newStatus === 'disconnected') {
          setStatus('setup');
        } else if (newStatus === 'setup') {
          setStatus('setup');
          setGuestCount(0);
        } else {
          setStatus(newStatus as 'setup' | 'connecting' | 'connected' | 'error');
        }
      },
      () => {
        // This callback is for when stream is received (not needed for host)
      },
      (errorMessage) => {
        setError(errorMessage);
        setStatus('error');
        showToast(errorMessage, 'error');
      },
      (guest: GuestInfo) => {
        console.log('🎯 HOST UI: Guest joined callback triggered:', guest);
        if (managerRef.current) {
          const guests = managerRef.current.getConnectedGuests();
          console.log('🎯 HOST UI: Updated guests list:', guests);
          setConnectedGuests(guests);
          setGuestCount(guests.length);
        }
      },
      (guestId: string) => {
        console.log('🎯 HOST UI: Guest left callback triggered:', guestId);
        if (managerRef.current) {
          const guests = managerRef.current.getConnectedGuests();
          console.log('🎯 HOST UI: Updated guests list after leave:', guests);
          setConnectedGuests(guests);
          setGuestCount(guests.length);
        }
      }
    );
    
    managerRef.current = manager;
    manager.setNickname(nickname);
    
    const newRoomId = manager.generateRoomId();
    setRoomId(newRoomId);

    manager.initializeHostRoom(newRoomId).catch((err) => {
      console.error('Failed to initialize host room:', err);
    });

    const updateGuestInfo = () => {
      if (managerRef.current) {
        const guests = managerRef.current.getConnectedGuests();
        const count = managerRef.current.getGuestCount();
        setConnectedGuests(guests);
        setGuestCount(count);
        
        if (guests.length !== count) {
          console.log('🎯 HOST UI: Guest count mismatch - guests:', guests.length, 'count:', count);
        }
      }
    };

    const interval = setInterval(updateGuestInfo, 2000);

    return () => {
      manager.stopScreenShare();
      clearInterval(interval);
    };
  }, [nickname, showToast]);

  const startSharing = async () => {
    if (!managerRef.current) return;
    
    try {
      setStatus('connecting');
      setError('');
      await managerRef.current.startScreenShare(roomId);
    } catch (err) {
      console.error('Failed to start sharing:', err);
    }
  };

  const stopSharing = () => {
    if (managerRef.current) {
      managerRef.current.stopScreenShare();
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      showToast('Copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy room code', 'error');
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'setup':
        return {
          icon: Monitor,
          color: 'blue',
          text: guestCount > 0 ? 'Ready to share again' : 'Ready to share',
          subtitle: guestCount > 0 ? `${guestCount} ${guestCount === 1 ? 'viewer' : 'viewers'} waiting` : 'Waiting for viewers'
        };
      case 'connecting':
        return {
          icon: Wifi,
          color: 'yellow',
          text: 'Starting screen share...',
          subtitle: 'Initializing connection'
        };
      case 'connected':
        return {
          icon: Activity,
          color: 'green',
          text: 'Sharing your screen',
          subtitle: guestCount > 0 ? `${guestCount} ${guestCount === 1 ? 'viewer' : 'viewers'} connected` : 'No viewers yet'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'red',
          text: 'Connection failed',
          subtitle: 'Please try again'
        };
      default:
        return {
          icon: Monitor,
          color: 'blue',
          text: 'Ready to share',
          subtitle: 'Waiting for viewers'
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
          className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.015) 0%, transparent 70%)'
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-24 h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.01) 0%, transparent 70%)'
          }}
          animate={{
            x: [0, -15, 0],
            y: [0, 10, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1
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
            Back to home
          </motion.button>

          {/* Status Icon */}
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 border border-white/10 rounded-2xl mb-8 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
            animate={{ 
              boxShadow: status === 'connected' 
                ? ['0 0 20px rgba(255, 255, 255, 0.05)', '0 0 30px rgba(255, 255, 255, 0.08)', '0 0 20px rgba(255, 255, 255, 0.05)']
                : status === 'connecting' 
                ? ['0 0 15px rgba(255, 255, 255, 0.03)', '0 0 25px rgba(255, 255, 255, 0.06)', '0 0 15px rgba(255, 255, 255, 0.03)']
                : '0 0 10px rgba(255, 255, 255, 0.02)'
            }}
            transition={{ 
              duration: status === 'connected' ? 3 : status === 'connecting' ? 2 : 4, 
              repeat: Number.POSITIVE_INFINITY, 
              ease: "easeInOut" 
            }}
          >
            <StatusIcon className={`w-10 h-10 ${
              statusInfo.color === 'green' ? 'text-white' :
              statusInfo.color === 'yellow' ? 'text-white/80' :
              statusInfo.color === 'red' ? 'text-white/60' :
              'text-white'
            }`} />
          </motion.div>
          
          {/* Title */}
          <motion.h1 
            className="text-4xl md:text-5xl font-semibold mb-4 text-white tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Share Your <span className="gradient-text">Screen</span>
          </motion.h1>
          
          {/* Welcome Message */}
          <motion.p 
            className="text-xl text-white/70 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            Welcome back, <span className="font-medium text-white">{nickname}</span>
          </motion.p>

          {/* Status */}
          <motion.div 
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border text-sm font-medium ${
              statusInfo.color === 'green' ? 'bg-white/10 border-white/20 text-white' :
              statusInfo.color === 'yellow' ? 'bg-white/08 border-white/15 text-white/80' :
              statusInfo.color === 'red' ? 'bg-white/05 border-white/10 text-white/60' :
              'bg-white/5 border-white/10 text-white/80'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          >
            <StatusIcon className="w-4 h-4" />
            <span>{statusInfo.text}</span>
          </motion.div>
          <motion.p 
            className="text-sm text-white/50 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
          >
            {statusInfo.subtitle}
          </motion.p>
        </motion.div>

        {/* Room Code Card */}
        <motion.div 
          className="card p-8 mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Share2 className="w-5 h-5 text-white/70" />
            <h3 className="text-xl font-medium text-white">
              Room Code
            </h3>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div 
              className="bg-gradient-to-r from-white/10 to-white/5 rounded-2xl px-8 py-6 border border-white/20 backdrop-blur-sm"
              whileHover={{ 
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",
                borderColor: "rgba(255, 255, 255, 0.25)"
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-4xl md:text-5xl font-mono font-bold tracking-wider text-white drop-shadow-lg">
                {roomId}
              </span>
            </motion.div>
            
            <motion.button
              type="button"
              onClick={copyRoomId}
              className="p-4 rounded-xl border transition-all duration-300 interactive bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white"
              title="Copy room code"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Copy className="w-5 h-5" />
            </motion.button>
          </div>


          
          <p className="text-white/60 leading-relaxed">
            Share this code with others so they can view your screen
          </p>
        </motion.div>



        {/* Action Buttons */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        >
          {status === 'setup' && (
            <motion.button
              type="button"
              onClick={startSharing}
              className="w-full py-4 bg-white text-black text-lg font-medium rounded-xl hover:bg-white/90 transition-all relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="flex items-center justify-center">
                <Monitor className="w-5 h-5 mr-3" />
                {guestCount > 0 ? 'Resume Sharing' : 'Start Sharing Screen'}
              </span>
            </motion.button>
          )}

          {(status === 'connecting' || status === 'connected') && (
            <motion.button
              type="button"
              onClick={stopSharing}
              className="w-full py-4 bg-white/10 text-white border border-white/20 text-lg font-medium rounded-xl hover:bg-white/20 transition-all group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="flex items-center justify-center">
                <StopCircle className="w-5 h-5 mr-3" />
                Stop Sharing
              </span>
            </motion.button>
          )}

          {status === 'error' && (
            <motion.button
              type="button"
              onClick={startSharing}
              className="w-full py-4 bg-white text-black text-lg font-medium rounded-xl hover:bg-white/90 transition-all relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="flex items-center justify-center">
                <Monitor className="w-5 h-5 mr-3" />
                Try Again
              </span>
            </motion.button>
          )}
        </motion.div>

        {/* Connected Guests */}
        {guestCount > 0 && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-5 h-5 text-white/70" />
                <h4 className="text-lg font-medium text-white">
                  {status === 'connected' ? 'Currently Viewing' : 'Waiting to View'} ({guestCount})
                </h4>
              </div>
              
              <div className="space-y-3">
                {connectedGuests.length > 0 ? (
                  connectedGuests.map((guest, index) => (
                    <motion.div 
                      key={guest.id} 
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        status === 'connected' 
                          ? 'bg-gradient-to-r from-white to-white/80' 
                          : 'bg-gradient-to-r from-white/80 to-white/60'
                      }`}>
                        <User className="w-5 h-5 text-black" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {guest.nickname}
                        </p>
                        <p className="text-sm text-white/60">
                          {status === 'connected' ? 'Viewing your screen' : 'Ready to view'}
                        </p>
                      </div>
                      <motion.div 
                        className={`w-3 h-3 rounded-full ${
                          status === 'connected' ? 'bg-white' : 'bg-white/60'
                        }`}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Number.POSITIVE_INFINITY, 
                          ease: "easeInOut" 
                        }}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-white/60 to-white/40 flex items-center justify-center">
                      <User className="w-5 h-5 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        Guest (loading...)
                      </p>
                      <p className="text-sm text-white/60">
                        Connection details loading
                      </p>
                    </div>
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-white/40"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Number.POSITIVE_INFINITY, 
                        ease: "easeInOut" 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        {status === 'setup' && guestCount === 0 && (
          <motion.div 
            className="mt-8 card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
          >
            <h4 className="font-medium mb-4 text-white flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              How it works
            </h4>
            <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
              <li>Click "Start Sharing Screen" to begin</li>
              <li>Select which screen or window to share</li>
              <li>Share the room code with your viewers</li>
              <li>They can join using any modern web browser</li>
            </ol>
          </motion.div>
        )}
      </div>


    </div>
  );
} 