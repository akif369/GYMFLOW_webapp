'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { getPortalHome } from '@/lib/roles';
import type { PortalType } from '@/lib/roles';

interface RoleGuardProps {
  /** The portal type this layout serves */
  allowedPortals: PortalType[];
  /** What to render while auth is being checked */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * RoleGuard: wraps portal layouts that have portal-type restrictions.
 *
 * Works in tandem with the Next.js middleware — middleware is the primary
 * enforcement layer; this component provides a secondary client-side guard
 * for edge cases where the middleware cookie may lag (e.g. after a role change).
 *
 * Does NOT redirect unauthenticated users — that is AuthGuard's job.
 */
export default function RoleGuard({ allowedPortals, fallback, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const checked = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || checked.current) return;
    checked.current = true;

    const isAllowed = allowedPortals.includes(user.portalType);
    if (!isAllowed) {
      // Silently redirect to the user's correct portal
      router.replace(getPortalHome(user.portalType));
    }
  }, [isAuthenticated, user, allowedPortals, router]);

  // Render nothing until we've confirmed the user is allowed
  if (!user || !allowedPortals.includes(user.portalType)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
