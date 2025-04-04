import apiClient from '../index';

export const profileService = {

   /**
   * Retrieve a user with the current existing session
   */

   getProfile: async () => {
      try {
         const response = await apiClient.get('/profile');
         return response.data;
      } catch (error) {
         console.error('Error fetching profile:', error);
         throw error;
      }
   },


   /**
   * Update a user
   */

   updateProfile: async (data: any) => {
      try {
         const response = await apiClient.put('/profile', data);
         return response.data;
      } catch (error) {
         console.error('Error updating profile:', error);
         throw error;
      }
   },

   /** 
   * Retrieve identities linked to a user
   */

   getIdentities: async () => {
      try {
         const response = await apiClient.get('/profile/identities');
         return response.data;
      } catch (error) {
         console.error('Error fetching identities:', error);
         // Log more detailed information about the error
         if (error.isAxiosError) {
           console.error('Axios error details:', {
             message: error.message,
             status: error.response?.status,
             statusText: error.response?.statusText,
             data: error.response?.data,
             config: {
               url: error.config?.url,
               method: error.config?.method,
               headers: error.config?.headers
             }
           });
         }
         // Check if it's a session error and handle it specifically
         if (error.response?.data?.message === 'No active session found') {
           throw new Error('You need to be logged in to view identities');
         }
         throw error;
      }
   },

   /**
    * Link a provider identity to a user
    * @param {string} provider - The provider to link (e.g., 'github', 'google')
    * @returns {Promise<any>} - The linked identity
    */

   linkIdentity: async (provider: string) => {
      try {
         const response = await apiClient.post('/profile/identities', { provider });
         return response.data;
      } catch (error) {
         console.error('Error linking identity:', error);
         throw error;
      }
   },
   /**
    * Unlink a Github identity from a user
    */
   unlinkIdentity: async (id: number) => {
      try {
         // The backend expects the full identity object, but we only have the ID
         // We'll let the backend handle finding the identity by ID
         const response = await apiClient.delete(`/profile/identities/${id}`);
         return response.data;
      } catch (error) {
         console.error('Error unlinking identity:', error);
         throw error;
      }
   },

   deleteProfile: async () => {
      try {
         // The backend will extract userId from the authenticated request
         const response = await apiClient.delete('/profile');
         return response.data;
      } catch (error) {
         console.error('Error deleting profile:', error);
         throw error;
      }
   },
   resetPassword: async (email: string) => {
      try {
         const response = await apiClient.post('/profile/reset-password', { email });
         return response.data;
      } catch (error) {
         console.error('Error resetting password:', error);
         throw error;
      }
   }

}