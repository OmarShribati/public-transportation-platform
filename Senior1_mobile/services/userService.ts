import { BaseService } from "@/libs/baseService";

export const UserAccountService = new BaseService(
  "/accounts/passenger/profile",
  "auth"
);

export const UserAPI = {
  updateProfile: (data: object) => UserAccountService.patch(data),
  getProfile: () => UserAccountService.get(),
};
