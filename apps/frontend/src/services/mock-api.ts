import { User } from '@/lib/auth';

// Mock user data
const MOCK_USERS: Record<string, { id: string; email: string; firstName: string; lastName: string; password: string }> = {
  'user@example.com': {
    id: 'user_1',
    email: 'user@example.com',
    firstName: 'Demo',
    lastName: 'User',
    password: 'password123'
  },
  'test@example.com': {
    id: 'user_2',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'password123'
  }
};

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate consistent tokens for users
const generateToken = (userId: string) => {
  console.log('Generating token for user ID:', userId);
  const token = `mock_access_token_${userId}_${Date.now()}`;
  console.log('Generated token:', token);
  return token;
};

export class MockApi {
  static async signUp(data: { email: string; password: string; firstName?: string; lastName?: string }): Promise<{
    access_token: string;
    user: User;
  }> {
    await delay(500); // Simulate network delay
    
    // Check if user already exists
    if (MOCK_USERS[data.email]) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      email: data.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      password: data.password
    };
    
    // Store user in mock database
    MOCK_USERS[data.email] = newUser;
    
    // Generate token
    const token = generateToken(newUser.id);
    
    // Return response
    return {
      access_token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    };
  }
  
  static async signIn(data: { email: string; password: string }): Promise<{
    access_token: string;
    user: User;
  }> {
    await delay(500); // Simulate network delay
    
    // Check if user exists
    const user = MOCK_USERS[data.email];
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check password
    if (user.password !== data.password) {
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    // Return response
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }
  
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    await delay(500); // Simulate network delay
    
    // Check if token is valid
    if (!refreshToken.startsWith('mock_')) {
      throw new Error('Invalid refresh token');
    }
    
    // Generate new token
    const newToken = refreshToken.replace('refresh', 'access');
    
    // Return response
    return {
      accessToken: newToken
    };
  }
  
  static async getVideos(): Promise<{
    videos: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    await delay(500); // Simulate network delay
    
    return {
      videos: [],
      total: 0,
      page: 1,
      limit: 10
    };
  }
}