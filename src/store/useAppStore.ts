import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  organizationId: string | null;
  branchId: string | null;
  setOrganizationId: (id: string) => void;
  setBranchId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      organizationId: null,
      branchId: null,
      setOrganizationId: (id) => set({ organizationId: id }),
      setBranchId: (id) => set({ branchId: id }),
    }),
    {
      name: 'gymatrix-app',
    }
  )
);
