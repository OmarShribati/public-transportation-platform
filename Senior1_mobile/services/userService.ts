import { BaseService } from "@/libs/baseService";

export const UserAccountService = new BaseService(
  "/accounts/passenger/profile",
  "auth",
);
export const UserPaymentService = new BaseService("/payment/my-card/", "auth");
export const UserTransactionService = new BaseService(
  "/payment/my-card/subscription-transactions/",
  "auth",
);
export const UserTransactionOnBusService = new BaseService(
  "/payment/my-card/transactions/",
  "auth",
);
export const UserNotificationService = new BaseService(
  "/notifications/",
  "auth",
);
export const UserNotificationReadService = new BaseService(
  "/notifications/read-all/",
  "auth",
);
export const UserNotificationUnReadService = new BaseService(
  "/notifications/unread-count/",
  "auth",
);

export const UserAPI = {
  updateProfile: (data: object) => UserAccountService.patch(data),
  getProfile: () => UserAccountService.get(),
  getNotification: () => UserNotificationService.get(),
  getNotificationCount: () => UserNotificationUnReadService.get(),
  markAllAsRead: () => UserNotificationReadService.create({}),

  getPaymentInfo: () => UserPaymentService.get(),
  getTransactionHistory: () => UserTransactionService.get(),
  getTransactionHistoryonbus: () => UserTransactionOnBusService.get(),
};
