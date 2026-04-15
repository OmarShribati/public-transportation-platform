import { BaseService } from "@/lib/baseServices";

export const AuthService = new BaseService("/accounts/login/", "auth");

export const AuthAPI = {
  login: (data: any) => AuthService.create(data)
  // list: (page = 1, search = "") =>
  //   OrdersService.list({ page, search }),
};
