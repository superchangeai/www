import apiClient from '../index';

export interface AlertSubscription {
  id: number;
  channels: { email_channel_id: number; email_to: string, frequency_level: string }[];
  providers: Array<{
    id: number;
    name: string;
  }>;
  classifications: string[];
  created_at: string;
}

export const alertSubscriptionsService = {
  /**
   * Get all alert subscriptions
   */
  getAll: async () => {
    const response = await apiClient.get<AlertSubscription[]>('/alert-subscriptions');
    return response.data;
  },

  /**
   * Create a new alert subscription
   */
  create: async (subscription: {
    email_channel_id: number;
    providers: number[];
    classifications: string[];
  }) => {
    const response = await apiClient.post('/alert-subscriptions', subscription);
    return response.data;
  },

  /**
   * Delete an alert subscription
   */
  delete: async (id: number) => {
    await apiClient.delete(`/alert-subscriptions/${id}`);
  }
};