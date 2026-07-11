import { create } from 'zustand';

interface AppState {
  organizationId: string;
  branchId: string;
  setOrganizationId: (id: string) => void;
  setBranchId: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  organizationId: 'default-org-id', // Stub for development
  branchId: 'default-branch-id',    // Stub for development
  setOrganizationId: (id) => set({ organizationId: id }),
  setBranchId: (id) => set({ branchId: id }),
}));
