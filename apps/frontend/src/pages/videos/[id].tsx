import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { VideoService, VideoStatus, getVideoById } from '@/services/video-service';
import { isAuthenticated } from '@/lib/auth';
import VideoPlayer from '@/components/features/video/VideoPlayer';
import Link from 'next/link';

export default function VideoDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [video, setVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is authenticated and load video data
  useEffect(() => {
    const authenticated = isAuthenticated();
    
    if (!authenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (id) {
      loadVideo(id as string);
      // Increment view count when page loads
      incrementViewCount();
    }
    
    return () => {
      // Clean up polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [id, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target as Node)) {
        setShareDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load video data
  const loadVideo = async (videoId: string) => {
    try {
      setIsLoading(true);
      const videoData = await getVideoById(videoId);
      setVideo(videoData);
      setIsLoading(false);
      
      // If video is still processing, start polling for updates
      if (videoData.status === VideoStatus.PENDING || videoData.status === VideoStatus.PROCESSING) {
        startPolling(videoId);
      }
    } catch (err: any) {
      console.error('Failed to load video:', err);
      setError(err.message || 'Failed to load video');
      setIsLoading(false);
    }
  };

  // Start polling for video status updates
  const startPolling = (videoId: string) => {
    // Poll every 5 seconds
    const interval = setInterval(async () => {
      try {
        const videoData = await getVideoById(videoId);
        setVideo(videoData);
        
        // If video is completed or failed, stop polling
        if (videoData.status === VideoStatus.COMPLETED || videoData.status === VideoStatus.FAILED) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      } catch (err) {
        console.error('Failed to poll video status:', err);
        // Don't stop polling on error, just log it
      }
    }, 5000);
    
    setPollingInterval(interval);
  };

  // Copy video URL to clipboard
  const copyVideoUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      incrementShareCount();
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });
  };

  // Toggle share dropdown
  const toggleShareDropdown = () => {
    setShareDropdownOpen(prev => !prev);
  };

  // Share video on social media
  const shareVideo = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email') => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Check out my AI-generated video: ${video?.text?.substring(0, 50) || 'CreatorsGPT Video'}`);
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=Check out this video: ${url}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
    incrementShareCount();
    setShareDropdownOpen(false);
  };

  // Download video
  const downloadVideo = async () => {
    if (!video?.videoUrl) return;
    
    try {
      setIsDownloading(true);
      
      // Fetch the video
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `creatorsgpt-video-${id}.mp4`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download video:', err);
      setError('Failed to download video. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Increment view count (in a real app, this would call an API)
  const incrementViewCount = () => {
    // For demo purposes, we're just updating the local state
    // In a real app, this would be an API call
    setViewCount(prev => prev + 1);
  };

  // Increment share count (in a real app, this would call an API)
  const incrementShareCount = () => {
    // For demo purposes, we're just updating the local state
    // In a real app, this would be an API call
    setShareCount(prev => prev + 1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case VideoStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case VideoStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case VideoStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case VideoStatus.FAILED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>{video ? `Video: ${video.text.substring(0, 30)}...` : 'Video Detail'} - CreatorsGPT</title>
        <meta name="description" content={video?.text || 'AI-generated lip-sync video'} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/videos" className="text-primary-600 hover:text-primary-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Videos
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
            {error}
          </div>
        ) : video ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Video player */}
            <div className="aspect-video bg-black relative">
              {video.status === VideoStatus.COMPLETED && video.videoUrl ? (
                <VideoPlayer 
                  videoUrl={video.videoUrl} 
                  avatarImageUrl="/images/avatars/placeholder.svg" 
                  status={video.status}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  {video.status === VideoStatus.FAILED ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xl">Video generation failed</p>
                    </>
                  ) : (
                    <>
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
                      <p className="text-xl">{video.status === VideoStatus.PENDING ? 'Waiting to process...' : 'Processing video...'}</p>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Video details */}
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {video.text}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Created: {formatDate(video.createdAt)}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(video.status)}`}>
                      {video.status}
                    </span>
                  </div>
                </div>
                
                {/* Analytics */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2 md:mt-0">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {viewCount} views
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    {shareCount} shares
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-6">
                {video.status === VideoStatus.COMPLETED && video.videoUrl && (
                  <>
                    <button
                      onClick={downloadVideo}
                      disabled={isDownloading}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 101.414 1.414l-3 3a1 1 0 00-1.414 0l-3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                          Download
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={copyVideoUrl}
                      className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      {copySuccess ? 'Copied!' : 'Copy Link'}
                    </button>
                    
                    <div className="relative" ref={shareDropdownRef}>
                      <button
                        onClick={toggleShareDropdown}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        Share
                      </button>
                      
                      {shareDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-10">
                          <div className="py-1">
                            <button
                              onClick={() => shareVideo('twitter')}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                            >
                              <svg className="h-5 w-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                              </svg>
                              Twitter
                            </button>
                            <button
                              onClick={() => shareVideo('facebook')}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                            >
                              <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                              Facebook
                            </button>
                            <button
                              onClick={() => shareVideo('linkedin')}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                            >
                              <svg className="h-5 w-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                              LinkedIn
                            </button>
                            <button
                              onClick={() => shareVideo('whatsapp')}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                            >
                              <svg className="h-5 w-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => shareVideo('email')}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                            >
                              <svg className="h-5 w-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                              </svg>
                              Email
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
            Video not found
          </div>
        )}
      </main>
    </div>
  );
} 