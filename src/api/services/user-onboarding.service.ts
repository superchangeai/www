import { supabase } from '../../lib/supabase';
import { emailChannelsService } from './email-channels.service';

export const userOnboardingService = {
  /**
   * Create a default email channel for a newly registered user
   * This should only be called during the signup flow, not during login
   */
  createDefaultEmailChannel: async () => {
    try {
      // Get the current user's email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        console.error('Cannot create default email channel: No authenticated user or email found');
        return;
      }

      // Check if the user already has any email channels
      const existingChannels = await emailChannelsService.getAll();
      
      if (existingChannels && existingChannels.length > 0) {
        console.log('User already has email channels, skipping default channel creation');
        return;
      }

      // Create a default email channel with the user's email
      // Skip verification since this email was already verified during signup
      await emailChannelsService.create({
        email_to: user.email,
        frequency_level: 'weekly', // Default frequency
        skip_verification: true // Skip verification for already verified user emails
      });

      console.log('Default email channel created successfully');
    } catch (error) {
      console.error('Error creating default email channel:', error);
    }
  }
};