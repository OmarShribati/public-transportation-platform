import { BaseService } from "@/lib/baseServices";

export const NotificationsService = new BaseService(
  "/notifications/broadcast/passengers/",
  "complaints"
);

export const NotificationAPI = {
  send: (data:object) => NotificationsService.create(data),
};
