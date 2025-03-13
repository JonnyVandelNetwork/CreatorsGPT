// Token storage keys
const ACCESS_TOKEN_KEY = 'creatorsgpt_access_token';
const REFRESH_TOKEN_KEY = 'creatorsgpt_refresh_token';
const USER_KEY = 'creatorsgpt_user';

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Store authentication tokens and user data
export function setAuth(tokens: AuthTokens, user: User): void {
  if (typeof window === 'undefined') return;
  
  console.log('Setting auth tokens and user data:');
  console.log('- accessToken:', tokens.accessToken);
  console.log('- refreshToken:', tokens.refreshToken);
  console.log('- user:', JSON.stringify(user));
  
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  console.log('Auth data stored in localStorage');
}

// Get the access token
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  console.log('Retrieved access token:', token ? `${token.substring(0, 10)}...` : null);
  return token;
}

// Get the refresh token
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  console.log('Retrieved refresh token:', token ? `${token.substring(0, 10)}...` : null);
  return token;
}

// Get the user data
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem(USER_KEY);
  console.log('Retrieved user JSON:', userJson);
  
  if (!userJson) return null;
  
  try {
    const user = JSON.parse(userJson) as User;
    console.log('Parsed user object:', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

// Check if the user is authenticated
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Remove all authentication data
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  
  console.log('Removing all authentication data from localStorage');
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  console.log('Authentication data removed');
} 