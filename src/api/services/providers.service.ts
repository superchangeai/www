import apiClient from '../index';

export interface Provider {
  id: number;
  name: string;
  category_id: number;
  sources?: {
    url: string;
    last_snapshot_at: string;
  }[];
  changes?: number;
}

export const providersService = {
  /**
   * Get all providers
   */
  getAll: async (params?: { category?: string }) => {
    const response = await apiClient.get<Provider[]>('/providers', { params });
    return response.data;
  },

  /**
   * Get a specific provider by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get<Provider>(`/providers/${id}`);
    return response.data;
  },

  /**
   * Get providers by category
   */
  getByCategory: async (categoryId: number) => {
    const response = await apiClient.get<Provider[]>(`/providers/category/${categoryId}`);
    return response.data;
  }
};