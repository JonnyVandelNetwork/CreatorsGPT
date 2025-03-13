import { ApiClient } from './api-client';
import { setAuth, getRefreshToken, User, AuthTokens, removeToken } from '@/lib/auth';
import { MockApi } from './mock-api';

interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface SignInRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
}

// Check if mock API is enabled
const isMockApiEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true';

export class AuthService {
  static async signUp(data: SignUpRequest): Promise<User> {
    try {
      // Clear any existing auth data
      removeToken();
      
      let response: AuthResponse;
      
      if (isMockApiEnabled) {
        // Use mock API
        response = await MockApi.signUp(data);
      } else {
        // Use real API
        response = await ApiClient.post<AuthResponse>('/auth/register', data, {
          requiresAuth: false,
        });
      }
      
      // Set new auth data
      setAuth(
        { 
          accessToken: response.access_token, 
          refreshToken: response.access_token // Using access token as refresh token for now
        },
        response.user
      );
      
      return response.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
  
  static async signIn(data: SignInRequest): Promise<User> {
    try {
      // Clear any existing auth data
      console.log('Clearing existing auth data before sign in');
      removeToken();
      
      let response: AuthResponse;
      
      if (isMockApiEnabled) {
        // Use mock API
        console.log('Using mock API for sign in with email:', data.email);
        response = await MockApi.signIn(data);
        console.log('Mock API sign in response:', JSON.stringify(response));
      } else {
        // Use real API
        console.log('Using real API for sign in');
        response = await ApiClient.post<AuthResponse>('/auth/login', data, {
          requiresAuth: false,
        });
        console.log('Real API sign in response:', JSON.stringify(response));
      }
      
      // Debug: Check response structure
      console.log('Auth response structure check:');
      console.log('- accessToken type:', typeof response.access_token);
      console.log('- accessToken value:', response.access_token);
      console.log('- user type:', typeof response.user);
      console.log('- user.id type:', typeof response.user.id);
      console.log('- user.id value:', response.user.id);
      
      // Set new auth data
      console.log('Setting auth data with tokens and user');
      setAuth(
        { 
          accessToken: response.access_token, 
          refreshToken: response.access_token // Using access token as refresh token for now
        },
        response.user
      );
      
      return response.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }
  
  static async refreshToken(): Promise<string> {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      let response: RefreshTokenResponse;
      
      if (isMockApiEnabled) {
        // Use mock API
        response = await MockApi.refreshToken(refreshToken);
      } else {
        // Use real API
        response = await ApiClient.post<RefreshTokenResponse>(
          '/auth/refresh',
          { refreshToken },
          { requiresAuth: false }
        );
      }
      
      return response.accessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }
  
  static logout(): void {
    removeToken();
    // In a real app, you might also want to call an API endpoint to invalidate the token on the server
  }
} 