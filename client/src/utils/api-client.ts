import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');

interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends ApiError {
  retryAfter: number;
  
  constructor(message: string, retryAfter: number = 60) {
    super(message || 'Too many requests, please try again later', 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

class ApiClient {
  // Store ongoing requests to prevent duplicate requests during retries
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  private getHeaders(requireAuth = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      // Use the Authorization header from axios defaults if it exists
      const authHeader = axios.defaults.headers.common['Authorization'] as string | undefined;
      if (!authHeader) {
        throw new Error('No authentication token available');
      }
      headers['Authorization'] = authHeader;
    }

    return headers;
  }

  private async handleResponse<T>(response: Promise<AxiosResponse<T>>, resource = 'Resource'): Promise<T> {
    try {
      const { data } = await response;
      return data;
    } catch (error) {
      console.error('API Error:', error);

      if (!axios.isAxiosError(error)) {
        throw new ApiError('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
      }

      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      // Handle network errors
      if (!axiosError.response) {
        throw new NetworkError(
          axiosError.message || 'Unable to connect to the server'
        );
      }

      const status = axiosError.response.status;
      const message = axiosError.response.data?.message || axiosError.message || 'An error occurred';
      const errorCode = axiosError.response.data?.error || 'API_ERROR';

      // Handle specific error cases
      switch (status) {
        case 401:
          if (!window.location.pathname.includes('/sign-in')) {
            localStorage.removeItem('token');
            // Use a custom event to handle redirects
            window.dispatchEvent(new CustomEvent('auth:signout', {
              detail: { redirectUrl: window.location.pathname }
            }));
          }
          throw new ApiError('Unauthorized access', 401, 'UNAUTHORIZED');
            
        case 404:
          throw new NotFoundError(resource);
            
        case 429:
          // Get retry-after header, defaulting to 60 seconds if not present
          const retryAfter = parseInt(axiosError.response.headers?.['retry-after'] ?? '60', 10);
          throw new RateLimitError(message, retryAfter);

        default:
          throw new ApiError(
            message,
            status,
            errorCode
          );
      }
    }
  }

  async get<T>(url: string, requireAuth = true, params?: any, resource = 'Resource', retryCount = 0): Promise<T> {
    const cacheKey = `GET:${url}:${JSON.stringify(params)}`;
    
    // Return existing request if one is already in progress to prevent duplicate calls
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    const requestPromise = (async () => {
      try {
        const response = this.handleResponse(
          axios.get(`${API_URL}${url}`, {
            headers: this.getHeaders(requireAuth),
            params,
          }),
          resource
        );
        return await response;
      } catch (error) {
        if (error instanceof Error && error.message === 'No authentication token available') {
          window.dispatchEvent(new CustomEvent('auth:signout', {
            detail: { redirectUrl: window.location.pathname }
          }));
        }
        
        // Handle rate limiting with exponential backoff
        if (error instanceof RateLimitError && retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), error.retryAfter * 1000);
          console.log(`Rate limited. Retrying in ${delay / 1000} seconds...`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.get<T>(url, requireAuth, params, resource, retryCount + 1);
        }
        
        throw error;
      } finally {
        // Remove from pending requests when done
        this.pendingRequests.delete(cacheKey);
      }
    })();
    
    // Store the promise in pendingRequests
    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async post<T>(url: string, data?: any, requireAuth = true, headers?: Record<string, string>, resource = 'Resource', retryCount = 0): Promise<T> {
    try {
      return await this.handleResponse(
        axios.post(`${API_URL}${url}`, data, {
          headers: {
            ...this.getHeaders(requireAuth),
            ...headers,
          },
        }),
        resource
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'No authentication token available') {
        window.dispatchEvent(new CustomEvent('auth:signout', {
          detail: { redirectUrl: window.location.pathname }
        }));
      }
      
      // Handle rate limiting with exponential backoff
      if (error instanceof RateLimitError && retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), error.retryAfter * 1000);
        console.log(`Rate limited. Retrying in ${delay / 1000} seconds...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.post<T>(url, data, requireAuth, headers, resource, retryCount + 1);
      }
      
      throw error;
    }
  }

  async put<T>(url: string, data?: any, requireAuth = true, resource = 'Resource', retryCount = 0): Promise<T> {
    try {
      return await this.handleResponse(
        axios.put(`${API_URL}${url}`, data, {
          headers: this.getHeaders(requireAuth),
        }),
        resource
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'No authentication token available') {
        window.dispatchEvent(new CustomEvent('auth:signout', {
          detail: { redirectUrl: window.location.pathname }
        }));
      }
      
      // Handle rate limiting with exponential backoff
      if (error instanceof RateLimitError && retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), error.retryAfter * 1000);
        console.log(`Rate limited. Retrying in ${delay / 1000} seconds...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.put<T>(url, data, requireAuth, resource, retryCount + 1);
      }
      
      throw error;
    }
  }

  async delete<T>(url: string, requireAuth = true, resource = 'Resource', retryCount = 0): Promise<T> {
    try {
      return await this.handleResponse(
        axios.delete(`${API_URL}${url}`, {
          headers: this.getHeaders(requireAuth),
        }),
        resource
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'No authentication token available') {
        window.dispatchEvent(new CustomEvent('auth:signout', {
          detail: { redirectUrl: window.location.pathname }
        }));
      }
      
      // Handle rate limiting with exponential backoff
      if (error instanceof RateLimitError && retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), error.retryAfter * 1000);
        console.log(`Rate limited. Retrying in ${delay / 1000} seconds...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.delete<T>(url, requireAuth, resource, retryCount + 1);
      }
      
      throw error;
    }
  }
}

export const apiClient = new ApiClient(); 