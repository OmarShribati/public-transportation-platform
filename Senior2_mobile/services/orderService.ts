
import { BaseService } from "@/libs/baseService";

export const OrderService = new BaseService("/passenger/trips/search", "auth");
export const RouteService = new BaseService("/passenger/routes", "auth");

export const OrderAPI = {
  makeOrder: (data: any) => OrderService.create(data),
  showRouteDetails: (id: any) => RouteService.get(id),
};




