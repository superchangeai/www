/**
 * Utility for handling API rate limiting with exponential backoff
 */

import apiClient from '../index';

/**
 * Executes an API call with exponential backoff retry logic for rate limiting
 * @param apiCall Function that returns a Promise with the API call
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @param initialDelay Initial delay in milliseconds before retrying (default: 1000)
 * @returns Promise with the API response
 */
export async function withBackoff<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await apiCall();
    } catch (error: any) {
      // Only retry on rate limit errors (status 429)
      if (error.response?.status !== 429 || retries >= maxRetries) {
        throw error;
      }
      
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next retry
      retries++;
      delay *= 2;
      
      console.log(`Rate limit hit. Retrying (${retries}/${maxRetries}) after ${delay}ms delay`);
    }
  }
}

/**
 * Creates a rate-limited version of an API service method
 * @param apiMethod The API method to rate limit
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay in milliseconds
 * @returns Rate-limited version of the API method
 */
export function createRateLimitedApiMethod<T, Args extends any[]>(
  apiMethod: (...args: Args) => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): (...args: Args) => Promise<T> {
  return (...args: Args) => withBackoff(() => apiMethod(...args), maxRetries, initialDelay);
}