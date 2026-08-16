'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

/**
 * AuthGuard: wraps any page that requires authentication.
 * - If no accessToken in store → redirects to /login
 * - On mount, silently calls /auth/me to validate token and hydrate user profile
 *
 * IMPORTANT: only logout on hard auth errors (401/403 from the server).
 * Network errors (server down, restart, timeout) must NOT clear the session —
 * the user's tokens are still valid and they should resume automatically
 * once the server comes back online.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, accessToken, setUser, logout } = useAuthStore();
  const hydratedRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !accessToken) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
      return;
    }

    // Hydrate user profile from /auth/me once per mount
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      api
        .get<{ user: Parameters<typeof setUser>[0] }>('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch((err) => {
          // Only logout when the server explicitly rejects with an auth error.
          // Do NOT logout on network errors (server down / restarting) —
          // tokens are still valid and will work when the server comes back.
          const isHardAuthError =
            isAxiosError(err) &&
            err.response !== undefined &&
            (err.response.status === 401 || err.response.status === 403);

          if (isHardAuthError) {
            logout();
            router.replace('/login');
          }
          // Network error → silently ignore, user stays on page,
          // data will load once the server is back.
        });
    }
  }, [mounted, isAuthenticated, accessToken, pathname, router, setUser, logout]);

  if (!mounted || !isAuthenticated || !accessToken) {
    return null;
  }

  return <>{children}</>;
}
