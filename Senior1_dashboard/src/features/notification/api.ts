import { BaseService } from "@/lib/baseServices";

export const NotificationsService = new BaseService(
  "/admin/notifications",
  "complaints"
);

export const NotificationAPI = {
  send: (data:object) => NotificationsService.create(data),
};
