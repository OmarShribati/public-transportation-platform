import { BaseService } from "@/lib/baseServices";

export const DashboardService = new BaseService("/admin/statistics", "auth");

export const DashboardAPI = {
  list: () => DashboardService.list()
};
