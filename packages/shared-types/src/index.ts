// User related types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication related types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Avatar related types
export enum AvatarType {
  STATIC = 'static',
  AI_GENERATED = 'ai_generated',
  UPLOADED = 'uploaded',
}

export interface Avatar {
  id: string;
  userId: string;
  type: AvatarType;
  url: string;
  createdAt: Date;
}

// Video generation related types
export enum VideoStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface VideoGenerationJob {
  id: string;
  userId: string;
  avatarId: string;
  scriptText: string;
  audioUrl?: string;
  videoUrl?: string;
  status: VideoStatus;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Subscription and billing related types
export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

// Usage limits and quotas
export interface UsageQuota {
  userId: string;
  videosGenerated: number;
  videosAllowed: number;
  resetDate: Date;
} 