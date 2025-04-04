/**
 * Example service implementing both caching and rate limiting
 * for the providers API endpoint
 */

import { createCachedApiService } from './cached.service';
import { createRateLimitedApiMethod } from '../utils/rate-limiting';
import apiClient from '../index';

// Define provider interface based on the API response structure
export interface Provider {
  id: number;
  name: string;
  url: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Create a cached service for the providers endpoint with a longer cache duration (10 minutes)
const cachedProvidersService = createCachedApiService<Provider[]>('/providers', 10 * 60 * 1000);

// Create rate-limited versions of direct API calls
const rateLimitedGetProviders = createRateLimitedApiMethod(
  async () => {
    const response = await apiClient.get<Provider[]>('/providers');
    return response.data;
  }
);

const rateLimitedGetProviderById = createRateLimitedApiMethod(
  async (id: number) => {
    const response = await apiClient.get<Provider>(`/providers/${id}`);
    return response.data;
  }
);

/**
 * Enhanced providers service with both caching and rate limiting
 */
export const cachedProvidersService = {
  /**
   * Get all providers with caching and rate limiting
   * Uses cache first, falls back to rate-limited API call
   */
  getAll: async () => {
    try {
      // Try to get from cache first
      return await cachedProvidersService.get();
    } catch (error) {
      // If cache fails, use rate-limited direct API call
      console.log('Cache access failed, using rate-limited API call');
      return await rateLimitedGetProviders();
    }
  },

  /**
   * Get a specific provider by ID with rate limiting
   * This method doesn't use caching as it's for individual items
   */
  getById: async (id: number) => {
    return await rateLimitedGetProviderById(id);
  },

  /**
   * Clear the cache for providers
   */
  clearCache: () => {
    cachedProvidersService.clearCache();
  }
};