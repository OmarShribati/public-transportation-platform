import { t } from "i18next";
import { AuthAPI } from "./api";
import { FormBuilder } from "@/components/form/FormBuilder";
import { LoginVal } from "./validation";

export const Login = () => {

  const fields = [

    [
      {
        name: "username",
        label: "Email",
        type: "text",
        placeholder: "Enter email",
        wrapperClass: "col-span-2",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter password",
        wrapperClass: "col-span-2",
      },
    ],

    [
      {
        name: "bio",
        label: "Biography",
        type: "textarea",
        placeholder: "Write something about yourself",
        wrapperClass: "col-span-2",
      },
      {
        name: "description",
        label: "Rich Description",
        type: "editor",
        wrapperClass: "col-span-2",
      },
    ],

    [
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: [
          { value: "m", label: "Male" },
          { value: "f", label: "Female" },
        ],
        wrapperClass: "col-span-1",
      },
      {
        name: "hobbies",
        label: "Hobbies",
        type: "select",
        isMulti: true,
        options: [
          { value: "football", label: "Football" },
          { value: "music", label: "Music" },
          { value: "reading", label: "Reading" },
        ],
        wrapperClass: "col-span-1",
      },
    ],

    [
      {
        name: "agree",
        label: "I agree to terms",
        type: "checkbox",
        wrapperClass: "col-span-2",
      },
      {
        name: "status",
        label: "Status",
        type: "radio",
        radionName: ["active", "inactive"],
        radionlabel: ["Active", "Inactive"],
        wrapperClass: "col-span-2",
      },
    ],

    [
      {
        name: "profilePicture",
        label: "Profile Picture",
        type: "image",
        wrapperClass: "col-span-2",
      },
      {
        name: "resume",
        label: "Resume (PDF)",
        type: "file",
        wrapperClass: "col-span-2",
      },
    ],

    [
      {
        name: "birthDate",
        label: "Birth Date",
        type: "date",
        wrapperClass: "col-span-1",
      },
      {
        name: "meetingTime",
        label: "Preferred Meeting Time",
        type: "datetime",
        wrapperClass: "col-span-1",
      },
    ],
  ];



  return (
    <div className="max-w-3xl mx-auto mt-20 p-6 border rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-semibold mb-6">{t("User Form Example")}</h2>
      <FormBuilder
        validationSchema={LoginVal}
        fields={fields}
        errorRegistryName="auth"
        query={AuthAPI.login}
        loadingButtonLabel={t("Submit")}
        className="grid grid-cols-1 w-full md:grid-cols-2 gap-4"
      />
    </div>
  );
};