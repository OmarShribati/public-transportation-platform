import { BaseService } from "@/lib/baseServices";

export const DriversApproveOrDeApproveService = new BaseService(
  "/admin/accounts/drivers",
  "auth"
);

export const DriverService = new BaseService("/admin/accounts/driver", "auth");
export const DriversAccService = new BaseService("/admin/drivers", "auth");
export const DriversReqService = new BaseService(
  "/admin/driver-requests",
  "auth"
);

export const DriverAPI = {
  // 1  approve  reg
  approveWithHisVehicle: (d_id: number | string) => {
    return DriversAccService.postWithId(d_id, "/approve", {});
  },

  approveWithOutHisVehicle: (d_id: number | string, data: object) => {
    return DriversAccService.postWithId(d_id, "/approve", data);
  },

  // 2
  activate: (d_id: number | string) => {
    return DriverService.postWithId(d_id, "/activate", {});
  },
  deactivate: (d_id: number | string) => {
    return DriverService.postWithId(d_id, "/deactivate", {});
  },

  // 3

  approveDeactivationRequest: (d_id: number | string) => {
    return DriverService.postWithId(d_id, "/approve-deactivation", {});
  },
  rejectDeactivationRequest: (d_id: number | string) => {
    return DriverService.postWithId(d_id, "/reject-deactivation", {});
  },

  rejectDriver: (d_id: number | string) => {
    return DriversAccService.postWithId(d_id, "/reject", {});
  },

  list: () => DriversReqService.list(),

  update: (data: object, id: number | string) => DriverService.update(id, data),
};
