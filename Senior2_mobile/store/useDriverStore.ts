import { DriverAPI } from "@/services/driverInformationService";
import { create } from 'zustand';

interface DriverState {
  driverData: any | null;
  routeData: any | null;
  polyLineCoordinates: { latitude: number; longitude: number }[];
  isLoading: boolean;
  fetchDriverInfo: () => Promise<void>;
}

export const useDriverStore = create<DriverState>((set) => ({
  driverData: null,
  routeData: null,
  polyLineCoordinates: [],
  isLoading: false,

  fetchDriverInfo: async () => {
    set({ isLoading: true });
    try {
      const response = await DriverAPI.getInfo();
      const route = response?.route;

      if (!route || !route.path) {
        set({ isLoading: false });
        return;
      }

      let coords: { latitude: number; longitude: number }[] = [];
      if (route.path.geometry?.coordinates) {
        coords = route.path.geometry.coordinates.map((point: any) => ({
          latitude: Number(point[1]), 
          longitude: Number(point[0]),
        })).filter((p:any) => !isNaN(p.latitude) && p.latitude !== 0);
      }

      const rawWaypoints = route.path.waypoints || [];
      const processedWaypoints = rawWaypoints
        .map((wp: any) => ({
          ...wp,
          latitude: Number(wp.latitude),
          longitude: Number(wp.longitude),
          name: wp.name || (wp.type === 'start' ? 'نقطة البداية' : wp.type === 'end' ? 'نقطة الوصول' : 'موقف')
        }))
        .filter((wp: any) => !isNaN(wp.latitude))
        .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0));

      set({ 
        driverData: response, 
        routeData: { 
          ...route, 
          sortedWaypoints: processedWaypoints 
        },
        polyLineCoordinates: coords,
        isLoading: false 
      });


    } catch (error) {
      console.error("❌ Error in fetchDriverInfo:", error);
      set({ isLoading: false });
    }
  },
}));