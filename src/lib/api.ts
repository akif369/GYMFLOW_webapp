import axios, { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useNetworkStore } from '@/store/useNetworkStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — refresh token on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

/**
 * Returns true ONLY when the server explicitly rejected the refresh with an
 * auth error (401 / 403). A network error (server down, timeout, ECONNREFUSED)
 * has no `response`, so we must NOT logout — tokens are still valid and will
 * work again once the server comes back online.
 */
function isHardAuthError(error: unknown): boolean {
  return (
    isAxiosError(error) &&
    error.response !== undefined &&
    (error.response.status === 401 || error.response.status === 403)
  );
}

api.interceptors.response.use(
  (response) => {
    // Clear network error state if a request succeeds
    useNetworkStore.getState().setServerDown(false);
    return response;
  },
  async (error) => {
    // If there is no response, it's a network error (server down, timeout, etc.)
    if (isAxiosError(error) && error.response === undefined) {
      useNetworkStore.getState().setServerDown(true);
    } else {
      useNetworkStore.getState().setServerDown(false);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      const { refreshToken, setAccessToken, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          { refreshToken },
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        setAccessToken(newAccessToken);

        // Also update refreshToken in store
        useAuthStore.setState({ refreshToken: newRefreshToken });

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (isHardAuthError(refreshError)) {
          // Server explicitly rejected the refresh token (revoked / genuinely expired)
          // → tokens are truly invalid, must log the user out
          logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        // Network / timeout error (server down) → keep tokens intact.
        // The user resumes seamlessly once the server comes back online.

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
