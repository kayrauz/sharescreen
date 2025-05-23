import { useState } from 'react';
import { Monitor, Users, Shield, Zap, User } from 'lucide-react';

interface HomePageProps {
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (roomId: string, nickname: string) => void;
}

export default function HomePage({ onCreateRoom, onJoinRoom }: HomePageProps) {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [hostNickname, setHostNickname] = useState('');
  const [guestNickname, setGuestNickname] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostNickname.trim() || hostNickname.trim().length < 4) return;
    
    setIsCreating(true);
    try {
      await onCreateRoom(hostNickname.trim());
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim() || !guestNickname.trim() || guestNickname.trim().length < 4) return;
    
    setIsJoining(true);
    try {
      await onJoinRoom(joinRoomId.trim().toUpperCase(), guestNickname.trim());
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-white/20 rounded-lg mb-8">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-medium mb-6 text-white tracking-tight">
            ShareScreen
          </h1>
          
          <p className="text-base text-white/60 max-w-lg mx-auto">
            Secure peer-to-peer screen sharing with crystal clear quality and zero latency
          </p>
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-24">
          {/* Create Room */}
          <div className="bg-black border border-white/20 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 border border-white/20 rounded-md flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white">
                Share Your Screen
              </h3>
            </div>
            
            <p className="text-sm text-white/60 mb-6">
              Start a new session and share your screen with others.
            </p>
            
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Enter your nickname"
                  value={hostNickname}
                  onChange={(e) => setHostNickname(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-black border border-white/20 rounded-md text-white text-sm placeholder-white/40 focus:border-white/40 focus:outline-none"
                  maxLength={20}
                  disabled={isCreating}
                />
              </div>
              
              <button 
                type="submit"
                disabled={!hostNickname.trim() || hostNickname.trim().length < 4 || isCreating}
                className="w-full py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </div>

          {/* Join Room */}
          <div className="bg-black border border-white/20 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 border border-white/20 rounded-md flex items-center justify-center mr-3">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white">
                Watch a Screen
              </h3>
            </div>
            
            <p className="text-sm text-white/60 mb-6">
              Enter a room code to connect to someone's shared screen.
            </p>
            
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Enter your nickname"
                  value={guestNickname}
                  onChange={(e) => setGuestNickname(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-black border border-white/20 rounded-md text-white text-sm placeholder-white/40 focus:border-white/40 focus:outline-none"
                  maxLength={20}
                  disabled={isJoining}
                />
              </div>
              
              <input
                type="text"
                placeholder="Room code"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/20 rounded-md text-white text-sm placeholder-white/40 text-center font-mono tracking-wider uppercase focus:border-white/40 focus:outline-none"
                maxLength={8}
                disabled={isJoining}
              />
              
              <button 
                type="submit"
                disabled={!joinRoomId.trim() || !guestNickname.trim() || guestNickname.trim().length < 4 || isJoining}
                className="w-full py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black border border-white/20 rounded-lg p-4 text-center">
            <div className="w-8 h-8 border border-white/20 rounded-md mx-auto mb-3 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-sm font-medium mb-2 text-white">
              100% Private
            </h4>
            <p className="text-xs text-white/60">
              Direct peer-to-peer connection with no servers storing your data
            </p>
          </div>

          <div className="bg-black border border-white/20 rounded-lg p-4 text-center">
            <div className="w-8 h-8 border border-white/20 rounded-md mx-auto mb-3 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-sm font-medium mb-2 text-white">
              Ultra Fast
            </h4>
            <p className="text-xs text-white/60">
              Real-time streaming with minimal latency for smooth experience
            </p>
          </div>

          <div className="bg-black border border-white/20 rounded-lg p-4 text-center">
            <div className="w-8 h-8 border border-white/20 rounded-md mx-auto mb-3 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-sm font-medium mb-2 text-white">
              Cross Platform
            </h4>
            <p className="text-xs text-white/60">
              Works on Windows, macOS, Linux, and mobile devices
            </p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-16 flex items-center justify-center space-x-6 text-xs text-white/40">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>100% Private</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>No Servers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Ultra Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
} 