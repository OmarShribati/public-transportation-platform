import {
  FormBuilderInput,
  toast,
  useFormik
} from "@/constant/MainImport";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { errorMapper } from "@/error/errorMapper";

interface FieldConfig {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  options?: any[];
  displayFields?: string[];
  isMulti?: boolean;
  funType?: string;
  wrapperClass?: string;
  hidden?: boolean;
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
  type?: "wizard" | "normal";
  enableReinitialize?: boolean;
  navigate?: string;
  sectionWrapperClass?: string;
  
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
  type = "normal",
  loadingButtonLabel = "Submit",
  loadingButtonClassName = "mt-4 w-full rounded-full bg-[#34709D] text-white px-6 py-3 text-sm font-semibold shadow-lg transition duration-300",
  navigate: navigateTo,
  sectionWrapperClass = "grid grid-cols-1 md:grid-cols-2 gap-4",
}: Props) => {
  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({});
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const queryClient = useQueryClient();

  const flatFields = fields.flat();

  
   const defaultValues: any = flatFields.reduce((acc: any, field: any) => {
    if (initialValues[field.name] !== undefined) {
      acc[field.name] = initialValues[field.name];
    } else if (field.type === "select" && field.isMulti) {
      acc[field.name] = [];
    } else if (field.type === "repeater") {
      const emptyObj: Record<string, any> = {};
      field.options?.forEach((opt: any) => {
          // 🚨 التعديل هنا: فحص نوع الحقل الفرعي
          if (opt.type === "checkbox") {
              emptyObj[opt.name] = 0; // اجعل القيمة الافتراضية 0
          } else if (opt.type === "number") {
              emptyObj[opt.name] = 0; // لضمان أن الأرقام تبدأ بـ 0 وليس ""
          } else {
              emptyObj[opt.name] = "";
          }
      });
      acc[field.name] = [emptyObj];
    } else {
      acc[field.name] = "";
    }
    return acc;
  }, {} as Record<string, any>);

  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema,
    enableReinitialize,
    onSubmit: async (values) => {
      const toastId = toast.loading(t("submitting"));
      try {
        await query(values);
        toast.success(t("submitted successfully"), { id: toastId });

        formik.resetForm();
        setStep(0);

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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFieldValue(field, file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const isWizard = type === "wizard";
  const isLastStep = isWizard && step === fields.length - 1;

  const handleNext = async () => {
    const currentFields = fields[step].map((f) => f.name);
    const errors = await formik.validateForm();
    const hasError = currentFields.some((field) => errors[field]);
    if (hasError) {
      formik.setTouched(Object.fromEntries(currentFields.map((f) => [f, true])));
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => step > 0 && setStep(step - 1);
  useEffect(() => {
    if (!formik?.values) return;

    fields.flat().forEach((field: any) => {
      if (typeof field.hidden === "function") {
        const shouldHide = field.hidden(formik.values);

        if (shouldHide && formik.values[field.name]) {
          formik.setFieldValue(field.name, "");
        }
      }
    });
  }, [formik.values]);
  return (
    <>
      {isWizard && (
        <div className="flex justify-between mb-5">
          {step > 0 ? (
            <button
              type="button"
              className="px-6 py-2 text-sm font-medium text-[color:var(--color-text-main)] transition duration-300 ease-in-out bg-[color:var(--color-nav-button)] border border-[color:var(--color-border)] shadow rounded-xl"
              onClick={handleBack}
            >
              {t("back")}
            </button>
          ) : (
            <div />
          )}

          {!isLastStep && (
            <button
              type="button"
              className="px-6 py-2 text-sm font-medium text-white bg-[color:var(--color-Add-Button)] shadow rounded-xl"
              onClick={handleNext}
            >
              {t("next")}
            </button>
          )}
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        <div className={className}>
          {(isWizard ? fields[step] : flatFields)
            .filter((field: any) => {
              if (typeof field.hidden === "function") {
                return !field.hidden(formik.values);
              }
              return !field.hidden;
            })
            .map((field, idx) => (
              <div
                key={field.name || idx}
                className={field.wrapperClass || sectionWrapperClass}
              >
                <FormBuilderInput
                  key={idx}
                  field={field}
                  formik={formik}
                  previews={previews}
                  handleFileChange={handleFileChange}
                />
              </div>
            ))}
        </div>


        {(!isWizard || isLastStep) && (
          <div className="mt-6">
            <button
              type="submit"
              className={loadingButtonClassName}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? t("submitting") : t(loadingButtonLabel)}
            </button>
          </div>
        )}
      </form>
    </>
  );
};
