import { useState, useEffect } from 'react';
import Head from 'next/head';
import { isAuthenticated, getUser, removeToken } from '@/lib/auth';
import { useRouter } from 'next/router';
import Image from 'next/image';

// Simple avatar interface
interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

// Simple avatar grid component
const SimpleAvatarGrid = ({ 
  avatars, 
  onSelect, 
  selectedAvatarId 
}: { 
  avatars: Avatar[]; 
  onSelect: (avatar: Avatar) => void; 
  selectedAvatarId?: string;
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {avatars.map((avatar) => (
        <div
          key={avatar.id}
          className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
            selectedAvatarId === avatar.id
              ? 'ring-2 ring-primary-500 scale-105'
              : 'hover:scale-105'
          }`}
          onClick={() => {
            console.log('Avatar clicked in SimpleAvatarGrid:', avatar);
            onSelect(avatar);
          }}
        >
          <div className="aspect-square bg-gray-200 flex items-center justify-center">
            <div className="w-full h-full relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                {avatar.name.charAt(0).toUpperCase()}
              </div>
              {avatar.imageUrl && (
                <img
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
          </div>
          <p className="text-xs text-center py-1 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90">
            {avatar.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default function TestAvatarPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  // Sample avatars
  const avatars: Avatar[] = [
    {
      id: 'avatar-1',
      name: 'Alex',
      imageUrl: '/images/avatars/placeholder.svg',
    },
    {
      id: 'avatar-2',
      name: 'Sophia',
      imageUrl: '/images/avatars/placeholder.svg',
    },
    {
      id: 'avatar-3',
      name: 'Jordan',
      imageUrl: '/images/avatars/placeholder.svg',
    },
  ];

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = isAuthenticated();
    console.log('Test avatar page loaded, is authenticated:', authenticated);
    
    if (!authenticated) {
      console.log('User is not authenticated, redirecting to login page');
      router.push('/auth/login');
    } else {
      const user = getUser();
      console.log('Current user:', user);
      setUserInfo(user);
      
      // Add to event log
      setEventLog(prev => [...prev, `Page loaded, user: ${JSON.stringify(user)}`]);
    }
  }, [router]);

  const handleAvatarSelect = (avatar: Avatar) => {
    console.log('Avatar selected:', avatar);
    setSelectedAvatar(avatar);
    setEventLog(prev => [...prev, `Avatar selected: ${avatar.name} (${avatar.id})`]);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    removeToken();
    setEventLog(prev => [...prev, 'Logged out']);
    router.push('/auth/login');
  };

  const handleRedirect = (path: string) => {
    console.log('Redirecting to:', path);
    setEventLog(prev => [...prev, `Redirecting to: ${path}`]);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <Head>
        <title>CreatorsGPT - Avatar Test</title>
        <meta name="description" content="Avatar test page for CreatorsGPT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Avatar Selection Test</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">User Info</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-40">
            {userInfo ? JSON.stringify(userInfo, null, 2) : 'Not authenticated'}
          </pre>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Select an Avatar</h2>
          <SimpleAvatarGrid 
            avatars={avatars} 
            onSelect={handleAvatarSelect} 
            selectedAvatarId={selectedAvatar?.id}
          />
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Selected Avatar</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-40">
            {selectedAvatar ? JSON.stringify(selectedAvatar, null, 2) : 'None selected'}
          </pre>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Navigation</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleRedirect('/')}
              className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Go to Home
            </button>
            <button
              onClick={() => handleRedirect('/test')}
              className="py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Go to Test Page
            </button>
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-2">Event Log</h2>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-40">
            {eventLog.map((event, index) => (
              <div key={index} className="text-sm mb-1">
                {event}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 