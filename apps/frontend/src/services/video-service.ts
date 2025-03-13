import { ApiClient } from './api-client';
import { MockApi } from './mock-api';

// Types
export interface Avatar {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Voice {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  avatarId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum VideoStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Video {
  id: string;
  text: string;
  videoUrl: string | null;
  status: VideoStatus;
  userId: string;
  avatarId: string;
  voiceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateVideoRequest {
  text: string;
  avatarId: string;
  voiceId: string;
}

export interface VideoListResponse {
  videos: Video[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Check if mock API is enabled
const isMockApiEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true';

// Mock data for development
const mockAvatars: Avatar[] = [
  {
    id: 'alex',
    name: 'Alex',
    description: 'Professional male avatar',
    imageUrl: '/images/avatars/placeholder.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sophia',
    name: 'Sophia',
    description: 'Professional female avatar',
    imageUrl: '/images/avatars/placeholder.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jordan',
    name: 'Jordan',
    description: 'Casual unisex avatar',
    imageUrl: '/images/avatars/placeholder.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockVoices: Record<string, Voice[]> = {
  'alex': [
    {
      id: 'alex-casual',
      name: 'Casual',
      description: 'Friendly and conversational tone',
      previewUrl: '/voices/casual.mp3',
      avatarId: 'alex',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'alex-professional',
      name: 'Professional',
      description: 'Clear and authoritative tone',
      previewUrl: '/voices/professional.mp3',
      avatarId: 'alex',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  'sophia': [
    {
      id: 'sophia-casual',
      name: 'Casual',
      description: 'Friendly and conversational tone',
      previewUrl: '/voices/casual.mp3',
      avatarId: 'sophia',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sophia-professional',
      name: 'Professional',
      description: 'Clear and authoritative tone',
      previewUrl: '/voices/professional.mp3',
      avatarId: 'sophia',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  'jordan': [
    {
      id: 'jordan-casual',
      name: 'Casual',
      description: 'Friendly and conversational tone',
      previewUrl: '/voices/casual.mp3',
      avatarId: 'jordan',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'jordan-professional',
      name: 'Professional',
      description: 'Clear and authoritative tone',
      previewUrl: '/voices/professional.mp3',
      avatarId: 'jordan',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

const mockVideos: Video[] = [];

// Get all available avatars
export const getAvatars = async (): Promise<Avatar[]> => {
  if (isMockApiEnabled) {
    return mockAvatars;
  }
  
  const response = await ApiClient.get<Avatar[]>('/videos/avatars');
  return response;
};

// Get all voices for a specific avatar
export const getVoicesForAvatar = async (avatarId: string): Promise<Voice[]> => {
  if (isMockApiEnabled) {
    return mockVoices[avatarId] || [];
  }
  
  const response = await ApiClient.get<Voice[]>(`/videos/avatars/${avatarId}/voices`);
  return response;
};

// Generate a new video
export const generateVideo = async (data: GenerateVideoRequest): Promise<Video> => {
  if (isMockApiEnabled) {
    const newVideo: Video = {
      id: `video_${Date.now()}`,
      text: data.text,
      videoUrl: null,
      status: VideoStatus.PENDING,
      userId: 'mock-user',
      avatarId: data.avatarId,
      voiceId: data.voiceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockVideos.push(newVideo);
    
    // Simulate video processing
    setTimeout(() => {
      const index = mockVideos.findIndex(v => v.id === newVideo.id);
      if (index !== -1) {
        mockVideos[index].status = VideoStatus.PROCESSING;
      }
      
      // Simulate video completion after 5 seconds
      setTimeout(() => {
        const index = mockVideos.findIndex(v => v.id === newVideo.id);
        if (index !== -1) {
          mockVideos[index].status = VideoStatus.COMPLETED;
          mockVideos[index].videoUrl = 'https://example.com/sample-video.mp4';
        }
      }, 5000);
    }, 2000);
    
    return newVideo;
  }
  
  const response = await ApiClient.post<Video>('/videos', data);
  return response;
};

// Get a specific video by ID
export const getVideoById = async (videoId: string): Promise<Video> => {
  if (isMockApiEnabled) {
    const video = mockVideos.find(v => v.id === videoId);
    if (!video) {
      throw new Error('Video not found');
    }
    return video;
  }
  
  const response = await ApiClient.get<Video>(`/videos/${videoId}`);
  return response;
};

// Get all videos for the current user
export const getUserVideos = async (page = 1, limit = 10): Promise<{
  videos: Video[];
  total: number;
  page: number;
  limit: number;
}> => {
  if (isMockApiEnabled) {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedVideos = mockVideos.slice(start, end);
    
    return {
      videos: paginatedVideos,
      total: mockVideos.length,
      page,
      limit
    };
  }
  
  // Construct query string manually
  const queryString = `?page=${page}&limit=${limit}`;
  const response = await ApiClient.get<{
    videos: Video[];
    total: number;
    page: number;
    limit: number;
  }>(`/videos${queryString}`);
  return response;
};

export class VideoService {
  static async getVideoStatus(id: string): Promise<Video> {
    if (isMockApiEnabled) {
      const video = mockVideos.find(v => v.id === id);
      if (!video) {
        throw new Error('Video not found');
      }
      return video;
    }
    
    const response = await ApiClient.get<Video>(`/videos/${id}`);
    return response;
  }
  
  static async getUserVideos(params: PaginationParams = {}): Promise<VideoListResponse> {
    if (isMockApiEnabled) {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedVideos = mockVideos.slice(start, end);
      
      return {
        videos: paginatedVideos,
        total: mockVideos.length,
        page,
        limit
      };
    }
    
    // Construct query string manually
    const queryParams = new URLSearchParams();
    
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/videos?${queryString}` : '/videos';
    
    const response = await ApiClient.get<VideoListResponse>(endpoint);
    return response;
  }
} 