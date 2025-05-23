import { useState, useEffect } from 'react';
import HomePage from './HomePage';
import HostScreen from './HostScreen';
import GuestScreen from './GuestScreen';

type ScreenType = 'home' | 'host' | 'guest';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [roomId, setRoomId] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');

  // Initialize screen, roomId, and nickname on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const path = window.location.pathname;
    
    // Extract roomId from URL
    const getRoomId = (): string | null => {
      const match = path.match(/^\/room\/(.+)$/);
      return match ? match[1] : null;
    };

    // Determine current screen based on URL
    const getScreen = (): ScreenType => {
      if (path === '/host') {
        return 'host';
      }
      if (path.startsWith('/room/')) {
        return 'guest';
      }
      return 'home';
    };

    const screen = getScreen();
    const urlRoomId = getRoomId();
    const storedNickname = sessionStorage.getItem('userNickname') || '';
    
    setCurrentScreen(screen);
    setNickname(storedNickname);
    if (urlRoomId) {
      setRoomId(urlRoomId);
    }
  }, []);

  const handleCreateRoom = (nickname: string) => {
    // Store nickname and navigate to host page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userNickname', nickname);
      window.location.href = '/host';
    }
  };

  const handleJoinRoom = (roomId: string, nickname: string) => {
    // Store nickname and navigate to room page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userNickname', nickname);
      window.location.href = `/room/${roomId}`;
    }
  };

  const handleBackToHome = () => {
    // Navigate back to home
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomePage 
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        );
      
      case 'host':
        return (
          <HostScreen 
            nickname={nickname}
            onBack={handleBackToHome}
          />
        );
      
      case 'guest':
        return roomId ? (
          <GuestScreen 
            roomId={roomId}
            nickname={nickname}
            onBack={handleBackToHome}
          />
        ) : (
          <HomePage 
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        );
      
      default:
        return (
          <HomePage 
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {renderCurrentScreen()}
    </div>
  );
} 