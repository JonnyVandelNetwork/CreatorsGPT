import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { VideoService, VideoStatus } from '@/services/video-service';
import { isAuthenticated } from '@/lib/auth';

// Sorting options
type SortOption = 'newest' | 'oldest';
// Filter options
type FilterOption = 'all' | 'pending' | 'processing' | 'completed' | 'failed';

export default function VideoListPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const PAGE_SIZE = 8;

  // Check authentication and load videos
  useEffect(() => {
    const authenticated = isAuthenticated();
    
    if (!authenticated) {
      router.push('/auth/login');
      return;
    }
    
    loadVideos(currentPage);
    
    // Set up auto-refresh for videos list (every 30 seconds)
    const interval = setInterval(() => {
      loadVideos(currentPage, true);
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [router]);

  // Load videos when page, sort, filter, or search changes
  useEffect(() => {
    if (isAuthenticated()) {
      loadVideos(currentPage);
    }
  }, [currentPage, sortBy, filterBy, searchQuery]);

  // Load videos from API
  const loadVideos = async (page: number, silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response = await VideoService.getUserVideos({ page, limit: PAGE_SIZE });
      
      // Apply client-side filtering and sorting
      let filteredVideos = [...response.videos];
      
      // Apply filter
      if (filterBy !== 'all') {
        filteredVideos = filteredVideos.filter(video => 
          video.status.toLowerCase() === filterBy
        );
      }
      
      // Apply search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredVideos = filteredVideos.filter(video => 
          video.text.toLowerCase().includes(query)
        );
      }
      
      // Apply sorting
      filteredVideos.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });
      
      setVideos(filteredVideos);
      setTotalPages(Math.ceil(response.total / PAGE_SIZE));
    } catch (err: any) {
      console.error('Failed to load videos:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };
  
  // Handle filter change
  const handleFilterChange = (option: FilterOption) => {
    setFilterBy(option);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case VideoStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case VideoStatus.FAILED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case VideoStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case VideoStatus.PENDING:
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Truncate text
  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>My Videos - CreatorsGPT</title>
        <meta name="description" content="Manage your AI-generated videos" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Videos</h1>
          <Link href="/videos/create" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md">
            Create New Video
          </Link>
        </div>

        {/* Search and filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="flex-1 border border-gray-300 dark:border-gray-700 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-md"
                >
                  Search
                </button>
              </form>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <select
                className="border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filterBy}
                onChange={(e) => handleFilterChange(e.target.value as FilterOption)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              
              <select
                className="border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <span className="ml-3">Loading videos...</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first AI-generated lip-sync video now!</p>
            <Link 
              href="/videos/create" 
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Create New Video
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <Link 
                  key={video.id} 
                  href={`/videos/${video.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                    {video.status === VideoStatus.COMPLETED ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {video.videoUrl ? (
                          <div className="flex items-center justify-center h-full w-full bg-gray-300 dark:bg-gray-600">
                            <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-300 dark:bg-gray-600">
                            <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="bg-primary-600 rounded-full p-3">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {video.status === VideoStatus.FAILED ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        <span className="text-center text-gray-600 dark:text-gray-400">
                          {video.status === VideoStatus.FAILED ? 'Generation failed' : 'Processing...'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium truncate">{truncateText(video.text, 50)}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(video.status)}`}>
                        {video.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {formatDate(video.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
} 