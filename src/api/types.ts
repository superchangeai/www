/**
 * Interface for profile data
 */
export interface ProfileData {
  name?: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
  email_confirmed_at?: boolean | string;
  identities?: Identity[];
  last_sign_in_at?: string;
}

/**
 * Interface for identity data
 */
export interface Identity {
  id: number;
  provider: string;
}

/**
 * Type for Axios error with detailed information
 */
export type DetailedAxiosError = {
  isAxiosError: boolean;
  message: string;
  response?: {
    status?: number;
    statusText?: string;
    data?: any;
  };
  config?: {
    url?: string;
    method?: string;
    headers?: any;
  };
};

/**
 * Helper function to handle API errors consistently
 * @param error - The error object
 * @param errorMessage - Custom error message
 */
export const handleApiError = (error: unknown, errorMessage: string): never => {
  console.error(errorMessage, error);
  
  // Log detailed information for Axios errors
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as DetailedAxiosError;
    
    console.error('API error details:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      config: {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        headers: axiosError.config?.headers
      }
    });
    
    // Handle specific error cases
    if (axiosError.response?.data?.message === 'No active session found') {
      throw new Error('You need to be logged in to perform this action');
    }
  }
  
  throw error;
};