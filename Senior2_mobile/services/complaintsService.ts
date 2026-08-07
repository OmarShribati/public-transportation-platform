
import { BaseService } from "@/libs/baseService";

export const ComplaintsService = new BaseService("/passenger/complaints", "auth");


export const ComplaintAPI = {
  send: (data: any) => ComplaintsService.create(data,true),
};




