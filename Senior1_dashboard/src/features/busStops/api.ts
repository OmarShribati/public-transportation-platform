import { BaseService } from "@/lib/baseServices";

export const StopsService = new BaseService("/admin/stops", "stops");

export const StopAPI = {
  create: (data:object) => StopsService.create(data),
  update: (data:object , id:number | string) => StopsService.update(id, data),
  list: () => StopsService.list(),
  delete: (id: number | string) => StopsService.delete(id),
  deactivate: (id: number | string) => StopsService.delete(id),

};
