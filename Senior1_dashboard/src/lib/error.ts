import { AxiosError } from "axios";
import { t } from "i18next";
import { errorMapper } from "@/error/errorMapper";

export const handleApiError = (err: unknown, feature = "global") => {
  const error = err as AxiosError<{ message?: string }>;
  const backendMessage = error.response?.data?.message;

  if (!backendMessage) return t("errors.default");

  return errorMapper(backendMessage, feature, t);
};
