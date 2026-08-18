import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { PortalType } from '@/store/useAuthStore';

// ── Route configuration ───────────────────────────────────────────────────────

/** Routes accessible without authentication */
const PUBLIC_PATHS = ['/login', '/reset-password', '/forgot-password', '/invite/accept'];

/** Static assets and Next.js internals — always bypass */
const STATIC_PREFIXES = ['/_next', '/favicon', '/logo', '/icons', '/site.webmanifest', '/apple-touch-icon'];

/**
 * Route group prefixes and which portal types are allowed to access them.
 * Order matters — first match wins.
 */
const PORTAL_ROUTES: Array<{ prefix: string; allowedPortals: PortalType[] }> = [
  // Org-owner portal — only org-level roles
  { prefix: '/org', allowedPortals: ['org-owner'] },

  // Trainer portal — only trainers (and org-owners for cross-portal visibility)
  { prefix: '/trainer', allowedPortals: ['trainer', 'org-owner'] },

  // Member portal — only members
  { prefix: '/member', allowedPortals: ['member'] },

  // Invite accept — public (handled above, but listed for documentation)
  // All other routes fall through to the branch portal guard below
];

/** Post-login redirect for each portal type */
function getPortalHome(portalType: PortalType | null): string {
  switch (portalType) {
    case 'org-owner': return '/org/dashboard';
    case 'trainer':   return '/trainer/dashboard';
    case 'member':    return '/member/dashboard';
    case 'branch':
    default:          return '/';
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Always allow static assets and Next.js internals ───────────────────
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // ── 2. Read auth cookies (set by the client-side auth store on login) ─────
  const isAuthenticated = request.cookies.get('gymflow_auth')?.value === 'true';
  const portalType = (request.cookies.get('gymflow_portal')?.value ?? null) as PortalType | null;

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // ── 3. Unauthenticated user ────────────────────────────────────────────────
  if (!isAuthenticated) {
    if (isPublicPath) return NextResponse.next(); // Allow login, reset-password, etc.

    // Redirect to login and remember the intended destination
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Authenticated user hitting a public path ───────────────────────────
  if (isPublicPath) {
    // Send them to their correct portal home (not necessarily '/')
    return NextResponse.redirect(new URL(getPortalHome(portalType), request.url));
  }

  // ── 5. Enforce portal route access ────────────────────────────────────────
  const portalRoute = PORTAL_ROUTES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (portalRoute) {
    const allowed = portalType !== null && portalRoute.allowedPortals.includes(portalType);
    if (!allowed) {
      // Send to their correct portal — never show a 403 to a real user
      return NextResponse.redirect(new URL(getPortalHome(portalType), request.url));
    }
  }

  // ── 6. Branch portal — block trainer/member from accessing admin routes ───
  // If a trainer or member tries to hit an unrecognised path (branch admin routes),
  // redirect them to their portal home.
  if (portalType === 'trainer' && pathname !== '/trainer' && !pathname.startsWith('/trainer/')) {
    return NextResponse.redirect(new URL('/trainer/dashboard', request.url));
  }
  if (portalType === 'member' && pathname !== '/member' && !pathname.startsWith('/member/')) {
    return NextResponse.redirect(new URL('/member/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
