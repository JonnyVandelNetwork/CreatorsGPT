import { getToken, removeToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

interface ApiError {
  message: string;
  statusCode: number;
}

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
    } = options;

    // Set up headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Set up request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body if provided
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    // Ensure endpoint starts with a slash if it doesn't already
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Construct the full URL
    // If API_BASE_URL already ends with /api, don't add it again
    const url = API_BASE_URL.endsWith('/api') 
      ? `${API_BASE_URL}${formattedEndpoint}`
      : `${API_BASE_URL}/api${formattedEndpoint}`;

    try {
      console.log(`Making ${method} request to: ${url}`);
      
      // Make the request
      const response = await fetch(url, requestOptions);

      // Handle unauthorized errors
      if (response.status === 401) {
        // Clear token and redirect to login
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        throw new Error('Unauthorized');
      }

      // Parse response
      const data = await response.json();

      // Handle API errors
      if (!response.ok) {
        const error: ApiError = {
          message: data.message || 'An error occurred',
          statusCode: response.status,
        };
        throw error;
      }

      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async get<T>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static async post<T>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  static async put<T>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  static async delete<T>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
} 