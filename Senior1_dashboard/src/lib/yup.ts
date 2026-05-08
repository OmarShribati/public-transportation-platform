import * as Yup from "yup";
import { t } from "i18next";
import { errorMapper } from "@/error/errorMapper";

export const handleYupValidation = (err: unknown, feature = "global") => {
  if (err instanceof Yup.ValidationError) {
    const errors: Record<string, string> = {};

    err.inner.forEach((e) => {
      if (e.path) {
        errors[e.path] = errorMapper(e.message || "required", feature, t);
      }
    });

    return errors;
  }
  return { general: t("errors.default") };
};
