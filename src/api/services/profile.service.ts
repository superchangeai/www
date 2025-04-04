import apiClient from '../index';
import { type ProfileData, type Identity, handleApiError } from '../types';

export const profileService = {

   /**
   * Retrieve a user with the current existing session
   * @returns {Promise<ProfileData>} The user profile data
   */

   getProfile: async (): Promise<ProfileData> => {
      try {
         const response = await apiClient.get('/profile');
         return response.data;
      } catch (error: unknown) {
         return handleApiError(error, 'Error fetching profile:');
      }
   },


   /**
   * Update a user
   * @param {ProfileData} data - The profile data to update
   * @returns {Promise<ProfileData>} The updated profile data
   */

   updateProfile: async (data: ProfileData): Promise<ProfileData> => {
      try {
         const response = await apiClient.put('/profile', data);
         return response.data;
      } catch (error: unknown) {
         return handleApiError(error, 'Error updating profile:');
      }
   },

   /** 
   * Retrieve identities linked to a user
   * @returns {Promise<Identity[]>} The list of linked identities
   */

   getIdentities: async (): Promise<Identity[]> => {
      try {
         const response = await apiClient.get('/profile/identities');
         return response.data;
      } catch (error: unknown) {
         return handleApiError(error, 'Error fetching identities:');
      }
   },

   /**
    * Link a provider identity to a user
    * @param {string} provider - The provider to link (e.g., 'github', 'google')
    * @returns {Promise<Identity>} - The linked identity
    */

   linkIdentity: async (provider: string): Promise<Identity> => {
      try {
         const response = await apiClient.post('/profile/identities', { provider });
         return response.data;
      } catch (error: unknown) {
         return handleApiError(error, 'Error linking identity:');
      }
   },
   /**
    * Unlink a Github identity from a user
    * @param {number} id - The ID of the identity to unlink
    * @returns {Promise<void>} - Confirmation of successful unlinking
    */
   unlinkIdentity: async (id: number): Promise<void> => {
      try {
         // The backend expects the full identity object, but we only have the ID
         // We'll let the backend handle finding the identity by ID
         const response = await apiClient.delete(`/profile/identities/${id}`);
         return response.data;
      } catch (error: unknown) {
         return handleApiError(error, 'Error unlinking identity:');
      }
   },

   /**
    * Delete the user's profile
    * @returns {Promise<void>} - Confirmation of successful deletion
    */
   deleteProfile: async (): Promise<void> => {
      try {
         // The backend will extract userId from the authenticated request
         const response = await apiClient.delete('/profile');
         return response.data;
      } catch (error: unknown) {
         return handleApiError(error, 'Error deleting profile:');
      }
   },
   /**
    * Request a password reset for a user
    * @param {string} email - The email address of the user
    * @returns {Promise<void>} - Confirmation of password reset request
    */
   resetPassword: async (email: string): Promise<void> => {
      try {
         const response = await apiClient.post('/profile/reset-password', { email });
         return response.data;
      } catch (error: unknown) {
         return handleApiError(error, 'Error resetting password:');
      }
   }

}