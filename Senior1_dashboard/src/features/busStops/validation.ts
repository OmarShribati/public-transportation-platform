import * as Yup from "yup";

export const StopVal = Yup.object({
  name: Yup.string().required("phone is required"),
});
