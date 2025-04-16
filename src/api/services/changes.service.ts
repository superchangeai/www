import apiClient from '../index';

export interface Change {
  id: number;
  source_id: number;
  snapshot_id1: number;
  snapshot_id2: number;
  diff: {
    summary: string;
  };
  classification: 'breaking' | 'security' | 'performance' | 'new_feature' | 'minor_fix' | 'other';
  explanation: string;
  timestamp: string;
}

export const changesService = {
  /**
   * Get all changes with optional pagination and filtering
   */
  getAll: async (params?: { limit?: number; classification?: string; changelogId?: string }) => {
    const response = await apiClient.get<Change[]>('/changes', { params });
    return response.data;
  },

  /**
   * Get a specific change by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get<Change>(`/changes/${id}`);
    return response.data;
  }
};