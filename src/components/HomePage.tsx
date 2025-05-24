import { useState, useEffect } from 'react';
import { Monitor, Users, Shield, Zap, User, ArrowLeft, Hash, Sparkles, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [selectedMode, setSelectedMode] = useState<'host' | 'join' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const resetSelection = () => {
    setSelectedMode(null);
    setHostNickname('');
    setGuestNickname('');
    setJoinRoomId('');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        {/* Floating orbs - very subtle */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)'
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.015) 0%, transparent 70%)'
          }}
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Subtle grid pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.003]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '100px 100px'],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"
          }}
        />
      </motion.div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 border border-white/10 rounded-2xl mb-8 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(255, 255, 255, 0.05)', 
                '0 0 30px rgba(255, 255, 255, 0.08)', 
                '0 0 20px rgba(255, 255, 255, 0.05)'
              ] 
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <Monitor className="w-8 h-8 text-white" />
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-7xl font-semibold mb-6 text-white tracking-tight leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Share<span className="gradient-text">Screen</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            Secure peer-to-peer screen sharing with crystal clear quality and zero latency. 
            Built for teams who value privacy and performance.
          </motion.p>

          {/* Feature Pills */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            {[
              { icon: Lock, text: 'End-to-end encrypted' },
              { icon: Globe, text: 'No servers required' },
              { icon: Zap, text: 'Ultra low latency' }
            ].map((feature, index) => (
              <motion.div 
                key={feature.text}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/80"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1, ease: "easeOut" }}
              >
                <feature.icon className="w-4 h-4" />
                {feature.text}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Main Content */}
        {!selectedMode ? (
          // Mode Selection
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-medium text-white text-center mb-12">
              How would you like to get started?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Host Option */}
              <motion.button
                type="button"
                onClick={() => setSelectedMode('host')}
                className="card interactive group p-8 text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center mb-6">
                  <motion.div 
                    className="w-12 h-12 border border-white/10 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-br from-white/10 to-white/5"
                    whileHover={{ 
                      boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-1">
                      Share My Screen
                    </h3>
                    <p className="text-sm text-white/60">
                      Start a new session
                    </p>
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Create a secure room and share your screen with team members, clients, or friends. 
                  Get a unique room code that others can use to join your session.
                </p>
                <div className="mt-6 flex items-center text-sm text-white/50">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Perfect for presentations and demos
                </div>
              </motion.button>

              {/* Join Option */}
              <motion.button
                type="button"
                onClick={() => setSelectedMode('join')}
                className="card interactive group p-8 text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center mb-6">
                  <motion.div 
                    className="w-12 h-12 border border-white/10 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-br from-white/10 to-white/5"
                    whileHover={{ 
                      boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Monitor className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-1">
                      Watch a Screen
                    </h3>
                    <p className="text-sm text-white/60">
                      Join an existing session
                    </p>
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Enter a room code to connect to someone's shared screen. 
                  Experience crystal clear quality with minimal latency for the best viewing experience.
                </p>
                <div className="mt-6 flex items-center text-sm text-white/50">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure and private connections
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Selected Mode Form
          <motion.div 
            className="max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Back Button */}
            <motion.button
              type="button"
              onClick={resetSelection}
              className="flex items-center text-white/70 hover:text-white text-sm mb-8 transition-colors group"
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to selection
            </motion.button>

            {selectedMode === 'host' ? (
              // Host Form
              <motion.div 
                className="card p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-br from-white/10 to-white/5">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white">
                      Share Your Screen
                    </h3>
                    <p className="text-sm text-white/60">
                      Start a new sharing session
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleCreateRoom} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="host-nickname" className="block text-sm font-medium text-white/80">
                      Your nickname
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        id="host-nickname"
                        type="text"
                        placeholder="Enter your display name"
                        value={hostNickname}
                        onChange={(e) => setHostNickname(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/40 focus:border-white/30 focus:bg-white/10 transition-all"
                        maxLength={20}
                        disabled={isCreating}
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-white/50">
                      Minimum 4 characters required
                    </p>
                  </div>
                  
                  <motion.button 
                    type="submit"
                    disabled={!hostNickname.trim() || hostNickname.trim().length < 4 || isCreating}
                    className="w-full py-4 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                    whileHover={{ scale: isCreating || !hostNickname.trim() || hostNickname.trim().length < 4 ? 1 : 1.02 }}
                    whileTap={{ scale: isCreating || !hostNickname.trim() || hostNickname.trim().length < 4 ? 1 : 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {isCreating ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                        Creating Room...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Room
                      </span>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              // Join Form
              <motion.div 
                className="card p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-br from-white/10 to-white/5">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white">
                      Watch a Screen
                    </h3>
                    <p className="text-sm text-white/60">
                      Join someone's session
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleJoinRoom} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="guest-nickname" className="block text-sm font-medium text-white/80">
                      Your nickname
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        id="guest-nickname"
                        type="text"
                        placeholder="Enter your display name"
                        value={guestNickname}
                        onChange={(e) => setGuestNickname(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/40 focus:border-white/30 focus:bg-white/10 transition-all"
                        maxLength={20}
                        disabled={isJoining}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="room-code" className="block text-sm font-medium text-white/80">
                      Room code
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        id="room-code"
                        type="text"
                        placeholder="Enter the room code"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/40 focus:border-white/30 focus:bg-white/10 transition-all font-mono tracking-wider"
                        disabled={isJoining}
                        autoComplete="off"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    <p className="text-xs text-white/50">
                      Get this code from the person sharing their screen
                    </p>
                  </div>
                  
                  <motion.button 
                    type="submit"
                    disabled={!joinRoomId.trim() || !guestNickname.trim() || guestNickname.trim().length < 4 || isJoining}
                    className="w-full py-4 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                    whileHover={{ scale: isJoining || !joinRoomId.trim() || !guestNickname.trim() || guestNickname.trim().length < 4 ? 1 : 1.02 }}
                    whileTap={{ scale: isJoining || !joinRoomId.trim() || !guestNickname.trim() || guestNickname.trim().length < 4 ? 1 : 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {isJoining ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                        Joining Room...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Monitor className="w-4 h-4 mr-2" />
                        Join Room
                      </span>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Footer */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
        >
          <p className="text-white/40 text-sm">
            Powered by WebRTC • No data stored on servers • Open source
          </p>
        </motion.div>
      </div>
    </div>
  );
} 