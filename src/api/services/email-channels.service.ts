import apiClient from '../index';

export interface EmailChannel {
  id: number;
  email_to: string;
  email_cc?: string;
  custom_subject?: string;
  verification_token?: string;
  verified_at?: string;
  created_at: string;
  frequency_level: string;
}

export const emailChannelsService = {
  /**
   * Get all email channels
   */
  getAll: async () => {
    const response = await apiClient.get<EmailChannel[]>('/email-channels');
    return response.data;
  },

  /**
   * Get a specific email channel by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get<EmailChannel>(`/email-channels/${id}`);
    return response.data;
  },

  /**
   * Create a new email channel
   */
  create: async (data: { email_to: string; email_cc?: string; custom_subject?: string; frequency_level: string }) => {
    const response = await apiClient.post<EmailChannel>('/email-channels', data);
    return response.data;
  },

  /**
   * Update an existing email channel
   */
  update: async (id: number, data: { email_to?: string; email_cc?: string; custom_subject?: string; frequency_level?: string }) => {
    const response = await apiClient.put<EmailChannel>(`/email-channels/${id}`, data);
    return response.data;
  },

  /**
   * Verify an email channel
   */
  verify: async (token: string) => {
    try {
      const response = await apiClient.get(`/email-channels/verify-email?token=${token}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error verifying email:', error);
      
      // Type guard to check if error is an object with response property
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'status' in error.response) {
        if (error.response.status === 400) {
          throw new Error('Invalid or expired verification token');
        }
      }
      throw new Error('Failed to verify email');
    }
  },

  /**
   * Delete an email channel
   */
  delete: async (id: number) => {
    await apiClient.delete(`/email-channels/${id}`);
  }
};