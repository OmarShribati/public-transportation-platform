import { BaseService } from "@/lib/baseServices";

export const AuthService = new BaseService("/auth/login", "auth");

export const AuthAPI = {
  login: (data: any) => AuthService.create(data)
};
