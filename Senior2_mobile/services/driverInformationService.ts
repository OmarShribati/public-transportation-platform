
import { BaseService } from "@/libs/baseService";

export const DriverAccountService = new BaseService("/accounts/driver/profile", "auth");
export const DriverAccountDeactivationReqService = new BaseService("/accounts/driver/deactivation-request", "auth");
export const DriverTripStartService = new BaseService("/driver/trip/start", "auth");
export const DriverTripEndService = new BaseService("/driver/trip/stop", "auth");
export const DriverTripUpdateService = new BaseService("/driver/vehicle/status", "auth");
export const DriverLocationService = new BaseService("/driver/location", "auth");

export const DriverAPI = {
  getInfo: () => DriverAccountService.list(),
  startTrip: () => DriverTripStartService.create({}),
  endTrip: () => DriverTripEndService.create({}),
  updateVehicleStatus: (data:object) => DriverTripUpdateService.patch(data),
  makeDeactivationReq: () => DriverAccountDeactivationReqService.create({}),
  updateProfile: (data:object) => DriverAccountService.patch(data),
  sendLocation: (data:object) => DriverLocationService.create(data),
};




