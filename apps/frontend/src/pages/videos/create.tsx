import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getAvatars, getVoicesForAvatar, generateVideo } from '@/services/video-service';
import { isAuthenticated } from '@/lib/auth';

export default function CreateVideoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [avatars, setAvatars] = useState<any[]>([]);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarsLoading, setAvatarsLoading] = useState(true);
  const [voicesLoading, setVoicesLoading] = useState(false);
  
  const MAX_CHARS = 500;

  // Check authentication and load avatars
  useEffect(() => {
    const authenticated = isAuthenticated();
    
    if (!authenticated) {
      router.push('/auth/login');
      return;
    }
    
    loadAvatars();
  }, [router]);

  // Load avatars
  const loadAvatars = async () => {
    try {
      setAvatarsLoading(true);
      setError(null);
      const data = await getAvatars();
      console.log('Loaded avatars:', data);
      setAvatars(data);
      
      // Auto-select first avatar if available
      if (data.length > 0) {
        setSelectedAvatar(data[0].id);
        loadVoices(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load avatars:', err);
      setError('Failed to load avatars. Please try again later.');
    } finally {
      setAvatarsLoading(false);
    }
  };

  // Load voices for selected avatar
  const loadVoices = async (avatarId: string) => {
    try {
      setVoicesLoading(true);
      setError(null);
      const data = await getVoicesForAvatar(avatarId);
      console.log('Loaded voices for avatar:', avatarId, data);
      setVoices(data);
      
      // Auto-select first voice if available
      if (data.length > 0) {
        setSelectedVoice(data[0].id);
      } else {
        setSelectedVoice(null);
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
      setError('Failed to load voices for this avatar. Please try again later.');
    } finally {
      setVoicesLoading(false);
    }
  };

  // Handle avatar selection
  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setSelectedVoice(null); // Reset voice selection
    loadVoices(avatarId);
  };

  // Handle voice selection
  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setText(newText);
    }
  };

  // Navigate to next step
  const handleNextStep = () => {
    if (step === 1 && selectedAvatar) {
      setStep(2);
    } else if (step === 2 && selectedVoice) {
      setStep(3);
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Submit video generation request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAvatar || !selectedVoice || !text.trim()) {
      setError('Please select an avatar, voice, and enter text for your video.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Generating video with:', {
        avatarId: selectedAvatar,
        voiceId: selectedVoice,
        text: text
      });
      
      const response = await generateVideo({
        avatarId: selectedAvatar,
        voiceId: selectedVoice,
        text: text
      });
      
      console.log('Video generation initiated:', response);
      
      // Redirect to video detail page
      router.push(`/videos/${response.id}`);
    } catch (err) {
      console.error('Failed to generate video:', err);
      setError('Failed to generate video. Please try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Head>
        <title>Create Video - CreatorsGPT</title>
        <meta name="description" content="Create a new AI-generated lip-sync video" />
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/videos" className="text-primary-600 hover:underline">
            &larr; Back to Videos
          </Link>
          
          <h1 className="text-2xl font-bold">Create New Video</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Progress Steps */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <div 
                className={`flex-1 py-4 px-6 text-center border-r border-gray-200 dark:border-gray-700 ${
                  step === 1 ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''
                }`}
              >
                <div className="flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    1
                  </div>
                  <span>Select Avatar</span>
                </div>
              </div>
              
              <div 
                className={`flex-1 py-4 px-6 text-center border-r border-gray-200 dark:border-gray-700 ${
                  step === 2 ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''
                }`}
              >
                <div className="flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    2
                  </div>
                  <span>Select Voice</span>
                </div>
              </div>
              
              <div 
                className={`flex-1 py-4 px-6 text-center ${
                  step === 3 ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''
                }`}
              >
                <div className="flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    3
                  </div>
                  <span>Enter Text</span>
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Avatar Selection */}
            {step === 1 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Select an Avatar</h2>
                
                {avatarsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    <span className="ml-3">Loading avatars...</span>
                  </div>
                ) : avatars.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>No avatars available. Please try again later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {avatars.map((avatar) => (
                      <div 
                        key={avatar.id}
                        onClick={() => handleAvatarSelect(avatar.id)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedAvatar === avatar.id 
                            ? 'border-primary-600 shadow-lg scale-105' 
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="aspect-square relative">
                          <img 
                            src={avatar.imageUrl || '/images/avatars/placeholder.svg'} 
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <p className="font-medium truncate">{avatar.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Step 2: Voice Selection */}
            {step === 2 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Select a Voice</h2>
                
                {voicesLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    <span className="ml-3">Loading voices...</span>
                  </div>
                ) : voices.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>No voices available for this avatar. Please select a different avatar.</p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Back to Avatar Selection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {voices.map((voice) => (
                      <div 
                        key={voice.id}
                        onClick={() => handleVoiceSelect(voice.id)}
                        className={`cursor-pointer p-4 rounded-lg border transition-all ${
                          selectedVoice === voice.id 
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full border-2 mr-3 flex-shrink-0 ${
                            selectedVoice === voice.id 
                              ? 'border-primary-600 bg-primary-600' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedVoice === voice.id && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{voice.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{voice.description || 'No description available'}</p>
                          </div>
                          <button
                            type="button"
                            className="ml-auto px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Here you would play a sample of the voice
                              alert(`Playing sample of ${voice.name}`);
                            }}
                          >
                            Play Sample
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Step 3: Text Input */}
            {step === 3 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Enter Text for Your Video</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Script
                    </label>
                    <textarea
                      id="text"
                      value={text}
                      onChange={handleTextChange}
                      placeholder="Enter the text you want the avatar to say..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 min-h-[200px]"
                      required
                    />
                    <div className="flex justify-between text-sm mt-1">
                      <span className={text.length > MAX_CHARS * 0.8 ? 'text-orange-500' : 'text-gray-500'}>
                        {text.length}/{MAX_CHARS} characters
                      </span>
                      {text.length > 0 && (
                        <span className="text-gray-500">
                          ~{Math.ceil(text.length / 20)} seconds
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Preview</h3>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        {selectedAvatar && avatars.find(a => a.id === selectedAvatar) && (
                          <img 
                            src={avatars.find(a => a.id === selectedAvatar)?.imageUrl || '/images/avatars/placeholder.svg'} 
                            alt="Selected Avatar"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {selectedAvatar && avatars.find(a => a.id === selectedAvatar)?.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Voice: {selectedVoice && voices.find(v => v.id === selectedVoice)?.name}
                        </p>
                        <p className="mt-2 text-gray-800 dark:text-gray-200">
                          {text || 'Your script will appear here...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div> // Empty div to maintain flex spacing
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={step === 1 && !selectedAvatar || step === 2 && !selectedVoice}
                  className={`px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors ${
                    (step === 1 && !selectedAvatar || step === 2 && !selectedVoice) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !text.trim()}
                  className={`px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors ${
                    isSubmitting || !text.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Generating...' : 'Generate Video'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 