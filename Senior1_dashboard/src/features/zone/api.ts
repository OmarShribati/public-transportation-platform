import { BaseService } from "@/lib/baseServices";

export const ZoneService = new BaseService("/payment/zones", "vehicles");

export const ZoneAPI = {
  list: () => ZoneService.list(),
};
