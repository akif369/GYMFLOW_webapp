import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  orgId: string;
  branchId: string | null;
  permissions: string[];
  phone?: string | null;
  photoUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

/** Set a lightweight auth presence cookie readable by Next.js middleware (Edge runtime). */
function setAuthCookie(authenticated: boolean) {
  if (typeof document === 'undefined') return;
  if (authenticated) {
    // Session cookie — no explicit expiry, cleared when browser closes OR on logout
    document.cookie = 'gymflow_auth=true; path=/; SameSite=Strict';
  } else {
    // Clear by setting expiry in the past
    document.cookie = 'gymflow_auth=; path=/; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        setAuthCookie(true);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user }),

      logout: () => {
        setAuthCookie(false);
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'gymatrix-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Re-sync the cookie whenever the store is rehydrated from localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) setAuthCookie(true);
      },
    },
  ),
);
