/**
 * Example service implementing both caching and rate limiting
 * for the changes API endpoint
 */

import { createCachedApiService } from './cached.service';
import { createRateLimitedApiMethod } from '../utils/rate-limiting';
import apiClient from '../index';
import type { Change } from './changes.service';

// Create a cached service for the changes endpoint
const cachedChangesService = createCachedApiService<Change[]>('/changes');

// Create rate-limited versions of direct API calls
const rateLimitedGetChanges = createRateLimitedApiMethod(
  async (params?: { limit?: number; classification?: string }) => {
    const response = await apiClient.get<Change[]>('/changes', { params });
    return response.data;
  }
);

const rateLimitedGetChangeById = createRateLimitedApiMethod(
  async (id: number) => {
    const response = await apiClient.get<Change>(`/changes/${id}`);
    return response.data;
  }
);

/**
 * Enhanced changes service with both caching and rate limiting
 */
export const cachedChangesService = {
  /**
   * Get all changes with caching and rate limiting
   * Uses cache first, falls back to rate-limited API call
   */
  getAll: async (params?: { limit?: number; classification?: string }) => {
    try {
      // Try to get from cache first
      return await cachedChangesService.get(params);
    } catch (error) {
      // If cache fails, use rate-limited direct API call
      console.log('Cache access failed, using rate-limited API call');
      return await rateLimitedGetChanges(params);
    }
  },

  /**
   * Get a specific change by ID with rate limiting
   * This method doesn't use caching as it's for individual items
   */
  getById: async (id: number) => {
    return await rateLimitedGetChangeById(id);
  },

  /**
   * Clear the cache for changes
   * @param params Optional query parameters to clear specific cache entry
   */
  clearCache: (params?: { limit?: number; classification?: string }) => {
    cachedChangesService.clearCache(params);
  }
};