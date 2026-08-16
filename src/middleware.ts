import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/reset-password', '/forgot-password'];

// Static asset prefixes to always allow through
const STATIC_PREFIXES = ['/_next', '/favicon', '/logo', '/icons', '/site.webmanifest', '/apple-touch-icon'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets and Next.js internals
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Read auth state from the persisted Zustand localStorage key
  // Next.js middleware runs on the Edge — localStorage is unavailable,
  // so we rely on a lightweight auth cookie we set on login.
  const authCookie = request.cookies.get('gymflow_auth')?.value;
  const isAuthenticated = authCookie === 'true';

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // ── Already logged in → redirect away from login ──────────────────────────
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ── Not logged in → redirect to login with return URL ─────────────────────
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
