import { BaseService } from "@/lib/baseServices";

export const MerchantsService = new BaseService("/payment/merchants", "transactions");
export const MerchantsAddService = new BaseService("/payment/merchants/", "transactions");

export const MerchantsAPI = {
  list: () => MerchantsService.list(),
  view: (id: number | string) => MerchantsService.get(`${id}/transactions/`),
  create: (data:object) => MerchantsAddService.create(data),

};
