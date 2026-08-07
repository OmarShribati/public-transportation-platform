import { BaseService } from "@/lib/baseServices";

export const UserService = new BaseService("/admin/accounts", "auth");

export const UserAPI = {
  list: () => UserService.list(),
  createDriver: (data:object) => UserService.create(data,true),
};
