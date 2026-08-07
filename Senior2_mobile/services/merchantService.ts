import { BaseService } from "@/libs/baseService";

export const MerchantCardLookupService = new BaseService(
  "/payment/cards/lookup/",
  "auth",
);
export const MerchantTopUpService = new BaseService(
  "/payment/zone-subscription/",
  "auth",
);
export const MerchantZoneSubscriptionService = new BaseService(
  "/payment/zones/",
  "auth",
);

export const MerchantAPI = {
  lookupCard: (params: object) => MerchantCardLookupService.list(params),
  showZoneSubscription: () => MerchantZoneSubscriptionService.list(),
  topUpCard: (data: object) => MerchantTopUpService.create(data),
};
