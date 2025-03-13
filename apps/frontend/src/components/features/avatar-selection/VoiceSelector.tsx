import React from 'react';

interface Voice {
  id: string;
  name: string;
  color: string;
  previewUrl?: string;
}

interface VoiceSelectorProps {
  voices: Voice[];
  onSelect: (voice: Voice) => void;
  selectedVoiceId?: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  onSelect,
  selectedVoiceId,
}) => {
  const playPreview = (voice: Voice) => {
    if (voice.previewUrl) {
      const audio = new Audio(voice.previewUrl);
      audio.play();
    }
  };

  return (
    <div className="w-full mt-8">
      <h2 className="text-lg font-medium text-center mb-4">Choose their voice!</h2>
      <div className="grid grid-cols-4 gap-4">
        {voices.map((voice) => (
          <div
            key={voice.id}
            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
              selectedVoiceId === voice.id
                ? 'ring-2 ring-primary-500 scale-105'
                : 'hover:scale-105'
            }`}
            onClick={() => {
              onSelect(voice);
              playPreview(voice);
            }}
          >
            <div 
              className={`aspect-square flex items-center justify-center ${voice.color}`}
            >
              <svg 
                className="w-12 h-12 text-white opacity-80" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                />
              </svg>
            </div>
            <p className="text-xs text-center py-1 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90">
              {voice.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example usage with default voices
export const DefaultVoices = [
  {
    id: 'voice-1',
    name: 'James',
    color: 'bg-pink-500',
    previewUrl: '/voices/james-preview.mp3',
  },
  {
    id: 'voice-2',
    name: 'Jessica',
    color: 'bg-green-500',
    previewUrl: '/voices/jessica-preview.mp3',
  },
  {
    id: 'voice-3',
    name: 'Mary',
    color: 'bg-orange-500',
    previewUrl: '/voices/mary-preview.mp3',
  },
  {
    id: 'voice-4',
    name: 'Kevin',
    color: 'bg-yellow-500',
    previewUrl: '/voices/kevin-preview.mp3',
  },
]; 