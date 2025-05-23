import { useState, useEffect, useRef } from 'react';
import { Copy, StopCircle, Users, Wifi, AlertCircle, CheckCircle, User } from 'lucide-react';
import { ScreenShareManager, type GuestInfo } from '../utils/webrtc';

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
  const [copied, setCopied] = useState(false);
  const managerRef = useRef<ScreenShareManager | null>(null);

  useEffect(() => {
    // Generate room ID and initialize host room
    const manager = new ScreenShareManager(
      (newStatus) => {
        if (newStatus === 'disconnected') {
          setStatus('setup');
        } else if (newStatus === 'setup') {
          setStatus('setup');
          // Reset guest count when stopping
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
      },
      (guest: GuestInfo) => {
        // This callback is for when a guest joins
        console.log('🎯 HOST UI: Guest joined callback triggered:', guest);
        if (managerRef.current) {
          const guests = managerRef.current.getConnectedGuests();
          console.log('🎯 HOST UI: Updated guests list:', guests);
          setConnectedGuests(guests);
          setGuestCount(guests.length);
        }
      },
      (guestId: string) => {
        // This callback is for when a guest leaves
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
    
    // Set the user's nickname
    manager.setNickname(nickname);
    
    const newRoomId = manager.generateRoomId();
    setRoomId(newRoomId);

    // Initialize the host room immediately (create peer connection)
    manager.initializeHostRoom(newRoomId).catch((err) => {
      console.error('Failed to initialize host room:', err);
    });

    // Update guest count and list periodically
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

    const interval = setInterval(updateGuestInfo, 2000); // Update every 2 seconds

    return () => {
      manager.stopScreenShare();
      clearInterval(interval);
    };
  }, [nickname]);

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
    // Don't call onBack() - keep host in the room
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'setup':
        return <Users className="w-6 h-6" />;
      case 'connecting':
        return <Wifi className="w-6 h-6 animate-pulse" />;
      case 'connected':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Users className="w-6 h-6" />;
    }
  };

  const getStatusText = () => {
    console.log('🎯 HOST UI: getStatusText called - status:', status, 'guestCount:', guestCount, 'connectedGuests:', connectedGuests);
    
    switch (status) {
      case 'setup':
        if (guestCount > 0) {
          const guestNames = connectedGuests.map(g => g.nickname).join(', ');
          console.log('🎯 HOST UI: Setup with guests - names:', guestNames);
          return `Room active • ${guestNames} waiting`;
        }
        return 'Ready to share';
      case 'connecting':
        return 'Starting screen share...';
      case 'connected':
        if (guestCount > 0) {
          const guestNames = connectedGuests.map(g => g.nickname).join(', ');
          console.log('🎯 HOST UI: Connected with guests - names:', guestNames);
          return `Sharing with ${guestNames}`;
        }
        return 'Sharing • No viewers';
      case 'error':
        return 'Connection failed';
      default:
        return 'Ready to share';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6 animate-breathe shadow-lg shadow-green-500/20">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-4xl font-bold mb-2 text-[var(--color-text-primary)] bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
            Share Your Screen
          </h1>
          
          <p className="text-lg text-[var(--color-text-secondary)] mb-4">
            Welcome, {nickname}!
          </p>
          
          <div className={`status-indicator mx-auto ${
            status === 'connecting' ? 'status-connecting' : 
            status === 'connected' ? 'status-connected' : 
            status === 'error' ? 'status-error' : ''
          }`}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* Room ID Card */}
        <div className="glass p-8 mb-8 text-center animate-slide-up">
          <h3 className="text-xl font-semibold mb-6 text-[var(--color-text-primary)]">
            Room Code
          </h3>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl px-6 py-4 border border-blue-500/30">
              <span className="text-4xl font-mono font-bold tracking-wider text-[var(--color-primary)] drop-shadow-lg">
                {roomId}
              </span>
            </div>
            
            <button
              type="button"
              onClick={copyRoomId}
              className={`btn-secondary p-4 flex items-center space-x-2 transition-all duration-200 ${
                copied ? 'bg-green-500/20 border-green-500/30 text-green-400' : ''
              }`}
              title="Copy room code"
            >
              <Copy className="w-6 h-6" />
              {copied && <span className="text-sm font-medium">Copied!</span>}
            </button>
          </div>
          
          <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
            Share this code with others to let them view your screen
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {status === 'setup' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={startSharing}
                className="btn-primary px-8 py-4 text-lg font-semibold w-full"
              >
                {guestCount > 0 ? 'Start Sharing Again' : 'Start Sharing Screen'}
              </button>
              
              <button
                type="button"
                onClick={onBack}
                className="btn-secondary px-8 py-4 text-lg font-semibold w-full"
              >
                Leave Room
              </button>
            </div>
          )}

          {(status === 'connecting' || status === 'connected') && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={stopSharing}
                className="btn-secondary px-8 py-4 text-lg font-semibold w-full flex items-center justify-center space-x-2 text-red-400 border-red-500/30 hover:bg-red-900/20"
              >
                <StopCircle className="w-5 h-5" />
                <span>Stop Sharing</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="btn-secondary px-8 py-4 text-lg font-semibold w-full opacity-60 hover:opacity-100"
              >
                Leave Room
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={startSharing}
                className="btn-primary px-8 py-4 text-lg font-semibold w-full"
              >
                Try Again
              </button>
              
              <button
                type="button"
                onClick={onBack}
                className="btn-secondary px-8 py-4 text-lg font-semibold w-full"
              >
                Leave Room
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {status === 'setup' && guestCount === 0 && (
          <div className="mt-8 p-4 bg-[var(--color-surface-secondary)] rounded-lg">
            <h4 className="font-semibold mb-2 text-[var(--color-text-primary)]">
              Instructions:
            </h4>
            <ol className="text-sm text-[var(--color-text-secondary)] space-y-1 list-decimal list-inside">
              <li>Click "Start Sharing Screen" to begin</li>
              <li>Select which screen or window to share</li>
              <li>Share the room code with your viewers</li>
              <li>They can join using any modern web browser</li>
            </ol>
          </div>
        )}

        {status === 'setup' && guestCount > 0 && (
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-semibold mb-3 text-blue-400">
              Viewers Waiting ({guestCount})
            </h4>
            <div className="space-y-2 mb-4">
              {connectedGuests.length > 0 ? (
                connectedGuests.map((guest) => (
                  <div key={guest.id} className="flex items-center space-x-3 p-2 bg-blue-500/10 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {guest.nickname}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-3 p-2 bg-blue-500/10 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    Guest (nickname loading...)
                  </span>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                </div>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {connectedGuests.length > 0 
                ? `Click "Start Sharing Again" to resume sharing your screen with ${connectedGuests.map(g => g.nickname).join(', ')}.`
                : "Click \"Start Sharing Again\" to resume sharing your screen with them."
              }
            </p>
          </div>
        )}

        {(status === 'connected' || status === 'connecting') && guestCount > 0 && (
          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="font-semibold mb-3 text-green-400">
              Currently Viewing ({guestCount})
            </h4>
            <div className="space-y-2">
              {connectedGuests.length > 0 ? (
                connectedGuests.map((guest) => (
                  <div key={guest.id} className="flex items-center space-x-3 p-2 bg-green-500/10 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {guest.nickname}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-3 p-2 bg-green-500/10 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    Guest (nickname loading...)
                  </span>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 