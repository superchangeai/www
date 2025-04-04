import apiClient from '../index';

export interface GlobalFeedback {
  feedback: string;
  page: string;
  userId?: string | null;
  timestamp?: string;
}

export interface ChangeFeedback {
  changeId: string;
  feedback: number;
  userId?: string | null;
}

export const feedbackService = {
  /**
   * Submit global feedback about the application
   * @param {string} feedback - The feedback text
   * @param {string} page - The current page where feedback was given
   * @param {string|null} userId - Optional user ID if authenticated
   * @returns {Promise<Object>} The created feedback record
   */
  createGlobalFeedback: async ({ feedback, page, userId }: GlobalFeedback) => {
    const response = await apiClient.post('/feedback/global', {
      feedback,
      page,
      userId
    });
    return response.data;
  },

  /**
   * Submit feedback for a specific change
   * @param {string} changeId - The ID of the change
   * @param {number} feedback - The feedback value (e.g., 1 for helpful, -1 for not helpful)
   * @param {string|null} userId - Optional user ID if authenticated
   * @returns {Promise<Object>} The created feedback record
   */
  createChangeFeedback: async ({ changeId, feedback, userId }: ChangeFeedback) => {
    const response = await apiClient.post(`/feedback/change/${changeId}`, {
      feedback,
      userId
    });
    return response.data;
  }
};