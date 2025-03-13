interface User {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
declare enum AvatarType {
    STATIC = "static",
    AI_GENERATED = "ai_generated",
    UPLOADED = "uploaded"
}
interface Avatar {
    id: string;
    userId: string;
    type: AvatarType;
    url: string;
    createdAt: Date;
}
declare enum VideoStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
interface VideoGenerationJob {
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
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
declare enum SubscriptionTier {
    FREE = "free",
    BASIC = "basic",
    PREMIUM = "premium",
    ENTERPRISE = "enterprise"
}
interface Subscription {
    id: string;
    userId: string;
    tier: SubscriptionTier;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
}
interface UsageQuota {
    userId: string;
    videosGenerated: number;
    videosAllowed: number;
    resetDate: Date;
}

export { type ApiResponse, type AuthResponse, type Avatar, AvatarType, type Subscription, SubscriptionTier, type UsageQuota, type User, type VideoGenerationJob, VideoStatus };
