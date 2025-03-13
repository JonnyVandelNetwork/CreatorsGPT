// Token storage keys
const ACCESS_TOKEN_KEY = 'creatorsgpt_access_token';
const USER_DATA_KEY = 'creatorsgpt_user';

// User interface
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Store the JWT token in localStorage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

// Get the JWT token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

// Store user data in localStorage
export const setUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
};

// Get user data from localStorage
export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }
  return null;
};

// Clear all auth data from localStorage
export const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
}; 