/**
 * Role utilities shared across portal layouts.
 * Mirrors backend role constants — keep in sync with rbac.schema.ts.
 */

export type PortalType = 'org-owner' | 'branch' | 'trainer' | 'member';

// ── Role constants ────────────────────────────────────────────────────────────

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

// ── Portal routing ────────────────────────────────────────────────────────────

export function getPortalHome(portalType: PortalType): string {
  switch (portalType) {
    case 'org-owner': return '/org/dashboard';
    case 'trainer':   return '/trainer/dashboard';
    case 'member':    return '/member/dashboard';
    case 'branch':
    default:          return '/';
  }
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  ORGANIZATION_OWNER: 'Organization Owner',
  BRANCH_OWNER: 'Branch Owner',
  BRANCH_MANAGER: 'Branch Manager',
  MANAGER: 'Manager',
  RECEPTIONIST: 'Receptionist',
  SALES_STAFF: 'Sales Staff',
  ACCOUNTANT: 'Accountant',
  TRAINER: 'Trainer',
  MEMBER: 'Member',
  OWNER: 'Owner',
};

export const ROLE_COLORS: Record<string, string> = {
  ORGANIZATION_OWNER: '#f59e0b',
  BRANCH_OWNER: '#8b5cf6',
  BRANCH_MANAGER: '#3b82f6',
  MANAGER: '#3b82f6',
  RECEPTIONIST: '#10b981',
  SALES_STAFF: '#f97316',
  ACCOUNTANT: '#06b6d4',
  TRAINER: '#ec4899',
  MEMBER: '#64748b',
  OWNER: '#f59e0b',
};

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function getRoleColor(role: string): string {
  return ROLE_COLORS[role] ?? '#6b7280';
}

// ── Permission helpers ────────────────────────────────────────────────────────

export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission);
}

export function hasAnyPermission(permissions: string[], required: string[]): boolean {
  return required.some((p) => permissions.includes(p));
}

export function hasAllPermissions(permissions: string[], required: string[]): boolean {
  return required.every((p) => permissions.includes(p));
}

// ── Nav item filtering by permissions ────────────────────────────────────────

export interface NavItemConfig {
  name: string;
  href: string;
  requiredPermissions?: string[];
  /** If true, item is shown to all authenticated users of this portal */
  public?: boolean;
}

export function filterNavByPermissions(
  items: NavItemConfig[],
  permissions: string[],
): NavItemConfig[] {
  return items.filter((item) => {
    if (item.public || !item.requiredPermissions?.length) return true;
    return hasAnyPermission(permissions, item.requiredPermissions);
  });
}

// ── Branch admin nav config ───────────────────────────────────────────────────

export const BRANCH_NAV_CONFIG: NavItemConfig[] = [
  { name: 'Dashboard',    href: '/',             public: true },
  { name: 'Members',      href: '/members',      requiredPermissions: ['member.view'] },
  { name: 'Attendance',   href: '/attendance',   requiredPermissions: ['attendance.view'] },
  { name: 'Memberships',  href: '/memberships',  requiredPermissions: ['member.view'] },
  { name: 'Payments',     href: '/payments',     requiredPermissions: ['payment.view'] },
  { name: 'Trainers',     href: '/trainers',     requiredPermissions: ['trainer.view'] },
  { name: 'PT Sessions',  href: '/pt-sessions',  requiredPermissions: ['pt.view'] },
  { name: 'Workouts',     href: '/workouts',     requiredPermissions: ['workout.view'] },
  { name: 'Leads & CRM',  href: '/leads',        requiredPermissions: ['lead.view'] },
  { name: 'Reports',      href: '/reports',      requiredPermissions: ['report.view'] },
  { name: 'Staff',        href: '/staff',        requiredPermissions: ['staff.view'] },
  { name: 'Settings',     href: '/settings',     requiredPermissions: ['settings.view'] },
];
