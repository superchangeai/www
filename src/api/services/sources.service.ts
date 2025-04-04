import apiClient from '../index';

export interface Source {
  id: number;
  url: string;
  is_active: boolean;
  last_snapshot_at: string;
  provider_id: number;
  dom_snapshots?: {
    count: number;
  };
}

export const sourcesService = {
  /**
   * Get all sources with optional pagination and total count
   */
  getAll: async (params?: { include_total?: boolean }) => {
    const response = await apiClient.get<Source[]>('/sources', { params });
    return response.data;
  },

  /**
   * Get a specific source by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get<Source>(`/sources/${id}`);
    return response.data;
  },

  /**
   * Create a new source
   */
  create: async (url: string) => {
    const response = await apiClient.post<Source>('/sources', { url });
    return response.data;
  },

  /**
   * Update source status
   */
  updateStatus: async (id: number, isActive: boolean) => {
    const response = await apiClient.put<Source>(`/sources/${id}`, { isActive });
    return response.data;
  },

  /**
   * Delete a source
   */
  delete: async (id: number) => {
    await apiClient.delete(`/sources/${id}`);
  }
};