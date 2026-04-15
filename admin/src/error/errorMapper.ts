import { errorRegistry } from "./errorRegistry";
import type { TFunction } from "i18next";

export const errorMapper = (
  message: string,
  feature: string | "global",
  t: TFunction
) => {
  const list = {
    ...errorRegistry.global,
    ...(errorRegistry[feature] || {}),
  };
  console.log(message);
  
  return list[message] ? t(list[message]) : t("هناك خطأ ما");
};
