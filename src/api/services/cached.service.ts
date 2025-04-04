/**
 * Cached API service implementation
 * Uses VueUse's useStorage for caching API responses
 */

import { useStorage } from '@vueuse/core';
import apiClient from '../index';

// Default cache duration in milliseconds (5 minutes)
export const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

// Cache data structure
interface CacheData<T> {
  data: T;
  timestamp: number;
}

/**
 * Creates a cached API service for a specific endpoint
 * @param endpoint The API endpoint to cache
 * @param cacheDuration Optional custom cache duration in milliseconds
 */
export function createCachedApiService<T>(endpoint: string, cacheDuration = DEFAULT_CACHE_DURATION) {
  const getCacheKey = (params?: object) => 
    `api_cache_${endpoint}_${params ? JSON.stringify(params) : ''}`;

  return {
    /**
     * Get data from cache or API
     * @param params Optional query parameters
     */
    get: async (params?: object): Promise<T> => {
      const cacheKey = getCacheKey(params);
      const cachedData = useStorage<CacheData<T> | null>(cacheKey, null);
      
      // Check if cache exists and is still valid
      if (cachedData.value) {
        const { data, timestamp } = cachedData.value;
        if (Date.now() - timestamp < cacheDuration) {
          console.log(`Using cached data for ${endpoint}`);
          return data;
        }
      }
      
      // If no cache or expired, fetch from API
      console.log(`Fetching fresh data for ${endpoint}`);
      const response = await apiClient.get(endpoint, { params });
      
      // Store in cache
      cachedData.value = {
        data: response.data,
        timestamp: Date.now(),
      };
      
      return response.data;
    },
    
    /**
     * Method to manually clear cache
     * @param params Optional query parameters to clear specific cache entry
     */
    clearCache: (params?: object) => {
      const cacheKey = getCacheKey(params);
      const cachedData = useStorage(cacheKey, null);
      cachedData.value = null;
      console.log(`Cache cleared for ${endpoint}`);
    },
    
    /**
     * Method to manually update cache
     * @param data Data to store in cache
     * @param params Optional query parameters
     */
    updateCache: (data: T, params?: object) => {
      const cacheKey = getCacheKey(params);
      const cachedData = useStorage<CacheData<T> | null>(cacheKey, null);
      cachedData.value = {
        data,
        timestamp: Date.now(),
      };
      console.log(`Cache updated for ${endpoint}`);
    }
  };
}