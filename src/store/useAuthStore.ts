import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Portal Types ──────────────────────────────────────────────────────────────

export type PortalType = 'org-owner' | 'branch' | 'trainer' | 'member';

// ── Role Constants (mirrors backend) ─────────────────────────────────────────

export const UserRole = {
  ORGANIZATION_OWNER: 'ORGANIZATION_OWNER',
  BRANCH_OWNER: 'BRANCH_OWNER',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  MANAGER: 'MANAGER',
  RECEPTIONIST: 'RECEPTIONIST',
  SALES_STAFF: 'SALES_STAFF',
  ACCOUNTANT: 'ACCOUNTANT',
  TRAINER: 'TRAINER',
  MEMBER: 'MEMBER',
  OWNER: 'OWNER',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/** Returns the home route for a given portalType */
export function getPortalHome(portalType: PortalType): string {
  switch (portalType) {
    case 'org-owner': return '/org/dashboard';
    case 'trainer':   return '/trainer/dashboard';
    case 'member':    return '/member/dashboard';
    case 'branch':
    default:          return '/';
  }
}

// ── Auth User ─────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  orgId: string;
  branchId: string | null;
  memberId?: string | null;
  permissions: string[];
  phone?: string | null;
  photoUrl?: string | null;
  portalType: PortalType;
}

// ── Permission helper ─────────────────────────────────────────────────────────

export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: AuthUser | null, permissions: string[]): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

function setAuthCookies(authenticated: boolean, role?: string, portalType?: PortalType) {
  if (typeof document === 'undefined') return;
  const maxAge = 'Max-Age=31536000'; // 1 year
  const base = `path=/; SameSite=Strict; ${maxAge}`;

  if (authenticated && role && portalType) {
    document.cookie = `gymflow_auth=true; ${base}`;
    document.cookie = `gymflow_role=${role}; ${base}`;
    document.cookie = `gymflow_portal=${portalType}; ${base}`;
  } else {
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `gymflow_auth=; path=/; SameSite=Strict; ${expired}`;
    document.cookie = `gymflow_role=; path=/; SameSite=Strict; ${expired}`;
    document.cookie = `gymflow_portal=; path=/; SameSite=Strict; ${expired}`;
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        setAuthCookies(true, user.role, user.portalType);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => {
        // Re-sync cookies when user profile is refreshed from /auth/me
        setAuthCookies(true, user.role, user.portalType);
        set({ user });
      },

      logout: () => {
        setAuthCookies(false);
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
      // Re-sync the cookies whenever the store is rehydrated from localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state.user) {
          setAuthCookies(true, state.user.role, state.user.portalType);
        }
      },
    },
  ),
);
