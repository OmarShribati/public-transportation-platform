import { BaseService } from "@/lib/baseServices";

export const RoutesService = new BaseService("/admin/routes", "routes");

export const RouteAPI = {
  create: (data:object) => RoutesService.create(data),
  update: (data:object , id:number | string) => RoutesService.update(id, data),
  list: () => RoutesService.list(),
  delete: (id: number | string) => RoutesService.delete(id),
  deactivate: (id: number | string) => RoutesService.delete(id),

};
