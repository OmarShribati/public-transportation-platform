import { BaseService } from "@/lib/baseServices";

export const VehiclesService = new BaseService("/admin/vehicles", "vehicles");
export const VehiclesDeviceService = new BaseService("/payment/devices/", "vehicles");

export const VehiclesAPI = {
  create: (data:object) => VehiclesService.create(data),
  createDevice: (data:object) => VehiclesDeviceService.create(data),
  list: () => VehiclesService.list(),
  delete: (id: number | string) => VehiclesService.delete(id),
  assignToRoute: (v_id: number | string, data:object) => {
    return VehiclesService.postWithId(v_id, "/route",data);
  },
   details: (id: number | string) => VehiclesService.get(id),
};
