import { BaseService } from "@/lib/baseServices";

export const UserService = new BaseService("/accounts/login/", "auth");

export const UserAPI = {
  list: (page = 1) => UserService.list({ page }),
};
