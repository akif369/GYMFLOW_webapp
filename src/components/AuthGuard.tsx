'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

/**
 * AuthGuard: wraps any page that requires authentication.
 * - If no accessToken in store → redirects to /login
 * - On mount, silently calls /auth/me to validate token and hydrate user profile
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
        .catch(() => {
          // If /auth/me fails (token expired + refresh failed), logout
          logout();
          router.replace('/login');
        });
    }
  }, [mounted, isAuthenticated, accessToken, pathname, router, setUser, logout]);

  if (!mounted || !isAuthenticated || !accessToken) {
    return null;
  }

  return <>{children}</>;
}
