import apiClient from '../index';
import { handleApiError } from '../types';

export interface Provider {
  id: number;
  name: string;
}

export interface Changelog {
  id: number;
  name: string;
  changelog_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  providers: Provider[];
}

export interface ChangelogWithChanges extends Changelog {
  changes: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PublicChangelog {
  changelog_id: string;
  name: string;
  providers: Provider[];
  changes: any[];
  created_at: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const changelogsService = {
  /**
   * Get all changelogs for the authenticated user
   */
  getAll: async () => {
    try {
      const response = await apiClient.get<Changelog[]>('/changelogs');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch changelogs');
    }
  },

  /**
   * Get a specific changelog and its changes by ID
   */
  getById: async (id: number, params?: { page?: number; limit?: number; classification?: string }) => {
    try {
      const response = await apiClient.get<ChangelogWithChanges>(`/changelogs/${id}`, { params });
      console.log(response.data); 
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch changelog with ID ${id}`);
    }
  },

  /**
   * Get a specific changelog by ID
   */
  get: async (id: number) => {
    try {
      const response = await apiClient.get<Changelog>(`/changelogs/id/${id}`);
      console.log(response.data); 
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch changelog with ID ${id}`);
    }
  },

  /**
   * Create a new changelog
   */
  create: async (data: { name: string; provider_ids: number[] }) => {
    try {
      const response = await apiClient.post<Changelog>('/changelogs', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create changelog');
    }
  },

  /**
   * Update an existing changelog.
   * Can update name, list or providers, or is_public status.
   * Takes an id as key, not a changelog_id
   */
  update: async (id: number, data: { name?: string; provider_ids?: number[]; is_public?: boolean; }) => {
    try {
      const response = await apiClient.put<Changelog>(`/changelogs/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to update changelog with ID ${id}`);
    }
  },

  /**
   * Delete a changelog
   */
  delete: async (id: number) => {
    try {
      await apiClient.delete(`/changelogs/${id}`);
      return true;
    } catch (error) {
      throw handleApiError(error, `Failed to delete changelog with ID ${id}`);
    }
  },

  /**
   * Generate a share URL for a changelog
   * Takes an id as key, not a changelog_id
   */
  share: async (id: number) => {
    try {
      const response = await apiClient.post<{ share_url: string }>(`/changelogs/${id}/share`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to generate share URL for changelog with ID ${id}`);
    }
  },

  /**
   * View a public changelog by its changelog_id
   */
  getPublic: async (changelogId: string, params?: { page?: number; limit?: number; classification?: string }) => {
    try {
      const response = await apiClient.get<PublicChangelog>(`/changelogs/public/${changelogId}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch public changelog with ID ${changelogId}`);
    }
  },
  /**
   * Check if a changelog is public
   */
  isPublic: async (changelogId: string) => {
    try {
      const response = await apiClient.get<{ is_public: boolean }>(`/changelogs/public/${changelogId}/is_public`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch public status for changelog with ID ${changelogId}`);
    }
  }
};