import { BaseService } from "@/lib/baseServices";

export const ComplaintsService = new BaseService(
  "/admin/complaints",
  "complaints"
);

export const ComplaintAPI = {
  list: () => ComplaintsService.list(),
};
