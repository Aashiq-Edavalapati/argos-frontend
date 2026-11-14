import { create } from 'zustand';
import { apiFetch, setAuthToken, getAuthToken } from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  
  login: (userData, token) => {
    if (token) setAuthToken(token);
    set({ 
      user: userData, 
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    setAuthToken(null);
    set({ 
      user: null, 
      isAuthenticated: false 
    });
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });

      // Check if token is in URL (Google OAuth redirect fallback)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
          setAuthToken(urlToken);
          // Clean the token from the URL bar without reloading
          urlParams.delete('token');
          const newSearch = urlParams.toString();
          const cleanUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }

      const res = await apiFetch('/api/me', {
        method: "GET",
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          set({ user: data, isAuthenticated: true, isCheckingAuth: false });
          return true;
        }
      }
    } catch (error) {
      console.warn("Auth check failed:", error);
    }
    
    set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    return false;
  },
  
  updateUser: (updates) => set((state) => ({
    user: { ...state.user, ...updates }
  })),
}));

export default useAuthStore;
