import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AvatarGrid } from '@/components/features/avatar-selection/AvatarGrid';
import { VoiceSelector } from '@/components/features/avatar-selection/VoiceSelector';
import { ChatInterface } from '@/components/features/chat/ChatInterface';
import { generateId } from '@/lib/utils';
import { VideoService, getAvatars, getVoicesForAvatar, generateVideo, Avatar as ApiAvatar, Voice as ApiVoice, Video } from '@/services/video-service';
import { isAuthenticated, getUser, removeToken } from '@/lib/auth';
import { useRouter } from 'next/router';

// Types for UI components that match the component interfaces
interface UIAvatar {
  id: string;
  name: string;
  imageUrl: string;
}

interface UIVoice {
  id: string;
  name: string;
  color: string;
  previewUrl?: string;
}

// Types for messages that match the ChatInterface component
interface UIMessage {
  id: string;
  content: string;
  sender: 'user' | 'avatar';
  timestamp: Date;
  videoUrl?: string;
  status?: 'sending' | 'processing' | 'complete' | 'error';
}

export default function Home() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<ApiAvatar[]>([]);
  const [voices, setVoices] = useState<ApiVoice[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<ApiAvatar | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<ApiVoice | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugVisible, setDebugVisible] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  // Force re-render function
  const forceRerender = () => {
    setRenderCount(prev => prev + 1);
    console.log('Forced re-render, count:', renderCount + 1);
  };

  // Debug component
  const DebugPanel = () => {
    const user = getUser();
    const authenticated = isAuthenticated();
    const accessToken = localStorage.getItem('creatorsgpt_access_token');
    const refreshToken = localStorage.getItem('creatorsgpt_refresh_token');
    
    return (
      <div className="fixed bottom-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 m-4 rounded-lg shadow-lg z-50 max-w-md overflow-auto max-h-[80vh]">
        <h3 className="text-lg font-bold mb-2">Debug Panel</h3>
        <div className="mb-2">
          <button 
            onClick={() => setDebugVisible(false)}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Close
          </button>
          <button 
            onClick={forceRerender}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs ml-2"
          >
            Force Re-render
          </button>
          <button 
            onClick={() => {
              removeToken();
              router.push('/auth/login');
            }}
            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs ml-2"
          >
            Logout
          </button>
        </div>
        <div className="text-sm">
          <p>Render Count: {renderCount}</p>
          <p>Is Authenticated: {authenticated ? 'Yes' : 'No'}</p>
          <p>Access Token: {accessToken ? `${accessToken.substring(0, 20)}...` : 'None'}</p>
          <p>Refresh Token: {refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None'}</p>
          <p>User: {user ? JSON.stringify(user, null, 2) : 'None'}</p>
          <p>Selected Avatar: {selectedAvatar ? selectedAvatar.id : 'None'}</p>
          <p>Selected Voice: {selectedVoice ? selectedVoice.id : 'None'}</p>
          <p>Setup Complete: {setupComplete ? 'Yes' : 'No'}</p>
          <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Is Generating: {isGenerating ? 'Yes' : 'No'}</p>
          <p>Available Avatars: {avatars.length}</p>
          <p>Available Voices: {voices.length}</p>
        </div>
      </div>
    );
  };

  // Check if user is authenticated
  useEffect(() => {
    console.log('Home page loaded, checking authentication');
    const authenticated = isAuthenticated();
    console.log('Is authenticated:', authenticated);
    
    if (!authenticated) {
      console.log('User is not authenticated, redirecting to login page');
      router.push('/auth/login');
    } else {
      console.log('User is authenticated, loading avatars');
      const user = getUser();
      console.log('Current user (detailed):', JSON.stringify(user));
      
      // Debug: Check if user has expected properties
      if (user) {
        console.log('User ID type:', typeof user.id);
        console.log('User ID value:', user.id);
        console.log('User email:', user.email);
        console.log('User name:', user.name);
      }
      
      loadAvatars();
    }
  }, [router]);

  // Load avatars from API
  const loadAvatars = async () => {
    try {
      setIsLoading(true);
      console.log('Loading avatars...');
      const avatarList = await getAvatars();
      console.log('Avatars loaded:', avatarList);
      setAvatars(avatarList);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load avatars:', error);
      setIsLoading(false);
    }
  };

  // Load voices for selected avatar
  const loadVoices = async (avatarId: string) => {
    try {
      console.log(`Loading voices for avatar ${avatarId}...`);
      const voiceList = await getVoicesForAvatar(avatarId);
      console.log('Voices loaded:', voiceList);
      setVoices(voiceList);
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const handleAvatarSelect = (avatar: UIAvatar) => {
    console.log('Avatar selected:', avatar);
    // Find the corresponding API avatar
    const apiAvatar = avatars.find(a => a.id === avatar.id);
    if (apiAvatar) {
      console.log('Setting selected avatar:', apiAvatar);
      setSelectedAvatar(apiAvatar);
      setSelectedVoice(null);
      loadVoices(apiAvatar.id);
    } else {
      console.error('Could not find API avatar with id:', avatar.id);
      console.log('Available avatars:', avatars);
    }
  };

  const handleVoiceSelect = (voice: UIVoice) => {
    console.log('Voice selected:', voice);
    // Find the corresponding API voice
    const apiVoice = voices.find(v => v.id === voice.id);
    if (apiVoice) {
      console.log('Setting selected voice:', apiVoice);
      setSelectedVoice(apiVoice);
    }
  };

  const handleStartChat = () => {
    console.log('Starting chat with avatar:', selectedAvatar, 'and voice:', selectedVoice);
    if (selectedAvatar && selectedVoice) {
      console.log('Setup complete, starting chat');
      setSetupComplete(true);
      // Add welcome message
      setMessages([
        {
          id: generateId(),
          content: `Hi there! I'm ${selectedAvatar.name}. What would you like me to say?`,
          sender: 'avatar',
          timestamp: new Date(),
        },
      ]);
    } else {
      console.error('Cannot start chat: avatar or voice not selected');
      if (!selectedAvatar) console.error('No avatar selected');
      if (!selectedVoice) console.error('No voice selected');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedAvatar || !selectedVoice) return;

    // Add user message
    const userMessageId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        content,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);

    // Start generating response
    setIsGenerating(true);

    // Add placeholder for avatar response
    const avatarMessageId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: avatarMessageId,
        content,
        sender: 'avatar',
        timestamp: new Date(),
        status: 'processing',
      },
    ]);

    try {
      // Generate video using API
      const video = await generateVideo({
        text: content,
        avatarId: selectedAvatar.id,
        voiceId: selectedVoice.id,
      });

      // Poll for video status until completed or failed
      const checkVideoStatus = async (videoId: string) => {
        const videoStatus = await VideoService.getVideoStatus(videoId);
        
        if (videoStatus.status === 'COMPLETED') {
          // Update avatar message with video
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === avatarMessageId
                ? {
                    ...msg,
                    videoUrl: videoStatus.videoUrl || undefined,
                    status: 'complete',
                  }
                : msg
            )
          );
          setIsGenerating(false);
          return true;
        } else if (videoStatus.status === 'FAILED') {
          // Update avatar message with error
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === avatarMessageId
                ? {
                    ...msg,
                    status: 'error',
                  }
                : msg
            )
          );
          setIsGenerating(false);
          return true;
        }
        
        // Continue polling
        setTimeout(() => checkVideoStatus(videoId), 2000);
        return false;
      };

      // Start polling
      checkVideoStatus(video.id);
    } catch (error) {
      console.error('Failed to generate video:', error);
      // Handle error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === avatarMessageId
            ? {
                ...msg,
                status: 'error',
              }
            : msg
        )
      );
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
        {/* Debug toggle button */}
        <button 
          onClick={() => setDebugVisible(!debugVisible)}
          className="fixed bottom-4 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        {debugVisible && <DebugPanel />}
      </div>
    );
  }

  // Convert API avatars to UI avatars
  const uiAvatars: UIAvatar[] = avatars.map(avatar => ({
    id: avatar.id,
    name: avatar.name,
    imageUrl: avatar.imageUrl,
  }));

  // Convert API voices to UI voices
  const uiVoices: UIVoice[] = voices.map(voice => ({
    id: voice.id,
    name: voice.name,
    color: voice.name.includes('Casual') ? 'bg-blue-500' : 'bg-purple-500',
    previewUrl: voice.previewUrl || undefined,
  }));

  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <Head>
          <title>CreatorsGPT - AI Video Generation</title>
          <meta name="description" content="Generate AI lip-sync videos with CreatorsGPT" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">CreatorsGPT</h1>
          
          <AvatarGrid 
            avatars={uiAvatars} 
            onSelect={handleAvatarSelect} 
            selectedAvatarId={selectedAvatar?.id}
          />
          
          {selectedAvatar && (
            <VoiceSelector 
              voices={uiVoices} 
              onSelect={handleVoiceSelect} 
              selectedVoiceId={selectedVoice?.id}
            />
          )}
          
          <button
            onClick={handleStartChat}
            disabled={!selectedAvatar || !selectedVoice}
            className="mt-8 w-full py-2 px-4 bg-primary-600 text-white rounded-md disabled:opacity-50"
          >
            Start Chat
          </button>
        </div>
        
        {/* Debug toggle button */}
        <button 
          onClick={() => setDebugVisible(!debugVisible)}
          className="fixed bottom-4 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        {debugVisible && <DebugPanel />}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Head>
        <title>Chat with {selectedAvatar?.name} - CreatorsGPT</title>
        <meta name="description" content="Chat with AI avatars using CreatorsGPT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChatInterface
        avatarName={selectedAvatar?.name || ''}
        avatarImageUrl={selectedAvatar?.imageUrl || ''}
        messages={messages}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
      />
      
      {/* Debug toggle button */}
      <button 
        onClick={() => setDebugVisible(!debugVisible)}
        className="fixed bottom-4 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      {debugVisible && <DebugPanel />}
    </div>
  );
} 