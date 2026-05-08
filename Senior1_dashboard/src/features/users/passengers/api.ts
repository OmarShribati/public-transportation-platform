import { BaseService } from "@/lib/baseServices";

export const PassengersService = new BaseService("/admin/accounts/passenger", "auth");

export const PassengerAPI = {
  activate: (p_id: number | string) => {
    return PassengersService.postWithId(p_id, "/activate", {});
  },
  deactivate: (p_id: number | string) => {
    return PassengersService.postWithId(p_id, "/deactivate", {});
  },
  update: (data:object , id:number | string) => PassengersService.update(id, data),

};
