
import { BaseService } from "@/libs/baseService";

export const LoginService = new BaseService("/auth/login", "auth");

export const LoginAPI = {
  login: (data: any) => LoginService.create(data),
};




export const SignupService = new BaseService("/auth/register", "auth");

export const AuthAPI = {
  signup: (data: any) => SignupService.create(data, true),
};


