import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies and auth
});

// Import Supabase client
import { supabase } from '../lib/supabase';

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Skip authentication for public routes
    if (config.url && isPublicRoute(config.url)) {
      return config;
    }
    
    // Add authentication for protected routes
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to determine if a route is public
function isPublicRoute(url: string): boolean {
  // Define your public routes here
  const publicRoutes = [
    '/public',
    '/changes',
    '/public-changelogs',
    // Add more public routes later
  ];
  
  return publicRoutes.some(route => url.startsWith(route));
}

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;