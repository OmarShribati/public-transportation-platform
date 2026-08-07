import {
  FormBuilderInput,
  toast,
  useFormik
} from "@/constant/MainImport";
import { errorMapper } from "@/error/errorMapper";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FormikProvider } from "formik";
import { t } from "i18next";
import { ReactNode, useState } from "react";

interface FieldConfig {
  name?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  options?: any[];
  displayFields?: string[];
  isMulti?: boolean;
  funType?: string;
  wrapperClass?: string;
  hidden?: boolean | ((values: any) => boolean);
}

interface Props {
  fields?: FieldConfig[][];
  errorRegistryName?: string;
  queryKey?: string | any;
  initialValues?: Record<string, any>;
  validationSchema?: any;
  className?: string;
  query: (data: any) => Promise<void>;
  loadingButtonLabel?: string;
  loadingButtonClassName?: string;
  enableReinitialize?: boolean;
  navigate?: string;
  sectionWrapperClass?: string;
  children?: ReactNode;
}

export const FormBuilder = ({
  fields = [],
  enableReinitialize = false,
  initialValues = {},
  validationSchema,
  className = "",
  errorRegistryName = "",
  query,
  queryKey,
  loadingButtonLabel = "Submit",
  loadingButtonClassName = "mt-4 w-full rounded-full bg-[#009C6A] text-white px-6 py-3 text-sm font-semibold shadow-lg transition duration-300",
  navigate: navigateTo,
  sectionWrapperClass = "grid grid-cols-1 md:grid-cols-2 gap-4",
  children,
}: Props) => {
  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const flatFields = fields.flat();

  const defaultValues = flatFields.reduce((acc: any, field: any) => {
    if (initialValues[field.name] !== undefined) {
      acc[field.name] = initialValues[field.name];
    } else if (field.type === "select" && field.isMulti) {
      acc[field.name] = [];
    } else if (field.type === "checkbox") {
      acc[field.name] = false;
    } else {
      acc[field.name] = "";
    }
    return acc;
  }, {});

  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema,
    enableReinitialize,
    onSubmit: async (values) => {
      const toastId = toast.loading("submitting");
      try {
        await query(values);
        toast.success("submitted successfully", { id: toastId });
        formik.resetForm();
        if (navigateTo) navigate({ to: navigateTo });
        if (queryKey) queryClient.invalidateQueries(queryKey);
      } catch (err: any) {
        toast.dismiss(toastId);
        let message = "Server error";
        if (err.response) {
          const { data } = err.response;
          if (data?.errors) {
            const errorsArray: any = Object.values(data.errors).flat();
            if (errorsArray.length >= 0) message = errorsArray[0];
          } else if (data?.error) message = data.error;
        } else if (err.message) message = err.message;
        toast.error(errorMapper(message, errorRegistryName, t));
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, setFieldValue: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFieldValue(field, file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviews((prev) => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <div className={className}>
          {flatFields
            .filter((field: any) => (typeof field.hidden === "function" ? !field.hidden(formik.values) : !field.hidden))
            .map((field, idx) => (
              <div key={field.name || idx} className={field.wrapperClass || sectionWrapperClass}>
                <FormBuilderInput
                  field={field}
                  formik={formik}
                  previews={previews}
                  handleFileChange={handleFileChange}
                />
              </div>
            ))}
        </div>

        {children} 

        <div className="mt-6">
          <button type="submit" className={loadingButtonClassName} disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "submitting" : loadingButtonLabel}
          </button>
        </div>
      </form>
    </FormikProvider>
  );
};