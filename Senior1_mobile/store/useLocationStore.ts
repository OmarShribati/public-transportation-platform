import { create } from 'zustand';

interface LocationState {
  location: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  setLocation: (location: any) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  setLocation: (location) => set({ location }),
}));