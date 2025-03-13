import { useState, useEffect } from 'react';
import Image from 'next/image';

interface VideoPlayerProps {
  videoUrl: string | null;
  avatarImageUrl: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export default function VideoPlayer({ videoUrl, avatarImageUrl, status }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset loading state when video URL changes
    if (videoUrl) {
      setIsLoading(true);
      setError(null);
    }
  }, [videoUrl]);

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setError('Failed to load video. Please try again later.');
  };

  // If video is still processing, show a placeholder with status
  if (status === 'PENDING' || status === 'PROCESSING') {
    return (
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mb-4">
            <Image
              src={avatarImageUrl}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="animate-pulse flex space-x-2 mb-2">
            <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
            <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
            <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {status === 'PENDING' ? 'Preparing to generate video...' : 'Generating your video...'}
          </p>
        </div>
      </div>
    );
  }

  // If video generation failed, show an error
  if (status === 'FAILED') {
    return (
      <div className="relative aspect-video bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <svg
            className="w-12 h-12 text-red-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-red-800 dark:text-red-200">
            Video generation failed. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // If video is completed but no URL, show an error
  if (status === 'COMPLETED' && !videoUrl) {
    return (
      <div className="relative aspect-video bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <svg
            className="w-12 h-12 text-yellow-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Video URL is missing. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // If video is completed and has a URL, show the video
  return (
    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      <video
        src={videoUrl || undefined}
        controls
        className="w-full h-full object-cover"
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
      />
    </div>
  );
} 