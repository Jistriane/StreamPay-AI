/**
 * HTTP Client Service
 * Centralized HTTP client with retry logic, rate limiting, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  retry?: RetryConfig;
  rateLimit?: RateLimitConfig;
  headers?: Record<string, string>;
}

/**
 * HTTP Client with built-in retry logic and rate limiting
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private retryConfig: RetryConfig;
  private rateLimitConfig: RateLimitConfig;
  private requestTimestamps: number[] = [];

  constructor(config: HttpClientConfig = {}) {
    this.retryConfig = config.retry || {
      maxRetries: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
    };

    this.rateLimitConfig = config.rateLimit || {
      maxRequests: 100,
      windowMs: 60000,
    };

    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // Add interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for rate limiting
    this.axiosInstance.interceptors.request.use((config) => {
      this.enforceRateLimit();
      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Log error for debugging
        console.error('[HttpClient] Error:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
        });
        throw error;
      }
    );
  }

  private enforceRateLimit(): void {
    const now = Date.now();
    const windowStart = now - this.rateLimitConfig.windowMs;

    // Remove old timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > windowStart);

    // Check if we've exceeded rate limit
    if (this.requestTimestamps.length >= this.rateLimitConfig.maxRequests) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = oldestRequest + this.rateLimitConfig.windowMs - now;
      if (waitTime > 0) {
        // In production, you might want to queue the request instead
        console.warn(`[HttpClient] Rate limit approaching, waiting ${waitTime}ms`);
      }
    }

    this.requestTimestamps.push(now);
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const axiosError = error as AxiosError;
      const isRetryable =
        !axiosError.response ||
        (axiosError.response.status >= 500 && axiosError.response.status < 600) ||
        axiosError.response.status === 429 ||
        axiosError.code === 'ECONNABORTED';

      if (isRetryable && retryCount < this.retryConfig.maxRetries) {
        const delay =
          this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
        console.warn(
          `[HttpClient] Retry attempt ${retryCount + 1}/${this.retryConfig.maxRetries} after ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry(fn, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * GET request with retry
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(async () => {
      const response = await this.axiosInstance.get<T>(url, config);
      return response.data;
    });
  }

  /**
   * POST request with retry
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(async () => {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response.data;
    });
  }

  /**
   * PUT request with retry
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(async () => {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return response.data;
    });
  }

  /**
   * PATCH request with retry
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(async () => {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return response.data;
    });
  }

  /**
   * DELETE request with retry
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(async () => {
      const response = await this.axiosInstance.delete<T>(url, config);
      return response.data;
    });
  }

  /**
   * Set authorization header
   */
  setAuthHeader(token: string, type = 'Bearer'): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `${type} ${token}`;
  }

  /**
   * Clear authorization header
   */
  clearAuthHeader(): void {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  /**
   * Update default headers
   */
  setHeaders(headers: Record<string, string>): void {
    Object.assign(this.axiosInstance.defaults.headers.common, headers);
  }

  /**
   * Get axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

/**
 * Create singleton instance
 */
export const createHttpClient = (config?: HttpClientConfig): HttpClient => {
  return new HttpClient(config);
};
