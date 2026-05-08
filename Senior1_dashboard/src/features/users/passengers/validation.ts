import * as Yup from "yup";

export const PassengersVal = Yup.object({
  full_name: Yup.string().required("name is required"),
  phone: Yup.string().required("phone is required"),
});
