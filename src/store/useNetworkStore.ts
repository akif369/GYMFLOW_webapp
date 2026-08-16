import { create } from 'zustand';

interface NetworkState {
  isServerDown: boolean;
  setServerDown: (status: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isServerDown: false,
  setServerDown: (status) => set({ isServerDown: status }),
}));
