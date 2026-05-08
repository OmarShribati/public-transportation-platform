import * as Yup from "yup";

export const LoginVal = Yup.object({
  email: Yup.string().required("phone is required"),
  password: Yup.string().required("password is required"),
});
