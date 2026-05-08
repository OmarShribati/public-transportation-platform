import { toast } from "@backpackapp-io/react-native-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FormBuilderInput } from "./FormBuilderInput";

interface Props {
  fields?: any[][] | any;
  initialValues?: Record<string, any>;
  validationSchema?: any;
  query: (data: any) => Promise<void>;
  queryKey?: string | any;
  type?: "wizard" | "normal";
  loadingButtonLabel?: string;
  sectionWrapperClass?: string;
  enableReinitialize?: boolean;
}

export const FormBuilder = ({
  fields = [],
  initialValues = {},
  validationSchema,
  query,
  queryKey,
  type = "normal",
  loadingButtonLabel = "submit",
  sectionWrapperClass = "mb-4",
  enableReinitialize = true,
}: Props) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const flatFields = useMemo(() => {
    if (!fields) return [];
    return Array.isArray(fields[0]) ? fields.flat() : fields;
  }, [fields]);

  useEffect(() => {
    setStep(0);
  }, [fields]);

  const defaultValues = useMemo(() => {
    return flatFields.reduce((acc: any, field: any) => {
      acc[field.name] =
        initialValues[field.name] !== undefined
          ? initialValues[field.name]
          : field.type === "checkbox"
          ? 0
          : "";
      return acc;
    }, {});
  }, [flatFields, initialValues]);

  const normalizeValues = (values: any) => {
    const cleaned = { ...values };

    Object.keys(cleaned).forEach((key) => {
      const value = cleaned[key];
      if (typeof value === "string" && value.startsWith("file://")) {
        cleaned[key] = {
          uri: value,
          name: `${key}.jpg`,
          type: "image/jpeg",
        };
      }
    });

    return cleaned;
  };

  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema,
    enableReinitialize,
    onSubmit: async (values) => {
      const id = toast.loading("Submitting...");
    
      try {
        const cleanedValues = normalizeValues(values);
    
        await query(cleanedValues);
    
        toast.dismiss(id);
        toast.success("Success!");
    
        if (queryKey) queryClient.invalidateQueries(queryKey);
    
        formik.resetForm();
        setStep(0);
    
      } catch (err: any) {
        console.log("err", err.response);
        toast.dismiss(id);
    
        let message = "An error occurred";
    
        if (err?.response?.data) {
          const errorData = err.response.data;
    
          const firstFieldError = Object.values(errorData).flat()[0];
    
          if (typeof firstFieldError === "string") {
            message = firstFieldError;
          } else if (errorData.message) {
            message = errorData.message;
          } else if (errorData.error) {
            message = errorData.error;
          }
        }
    
        toast.error(message);
      }
    },
  });

  useEffect(() => {
    flatFields.forEach((field: any) => {
      if (typeof field.hidden === "function") {
        if (
          field.hidden(formik.values) &&
          formik.values[field.name] !== ""
        ) {
          formik.setFieldValue(field.name, "");
        }
      }
    });
  }, [formik.values, flatFields]);

  const isWizard = type === "wizard";
  const isLastStep = !isWizard || step === fields.length - 1;

  const handleNext = async () => {
    const currentFields = fields[step].map((f: any) => f.name);
    const errors = await formik.validateForm();
    const hasError = currentFields.some((field: any) => errors[field]);

    if (hasError) {
      formik.setTouched(
        Object.fromEntries(currentFields.map((f: any) => [f, true]))
      );
      toast.error("Please fix errors");
      return;
    }

    setStep((prev) => prev + 1);
  };

  return (
    <View className="flex-1">
      {isWizard && (
        <View className="flex-row justify-between px-2 mb-6">
          <TouchableOpacity
            onPress={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className={`px-6 py-3 rounded-2xl ${
              step === 0
                ? "bg-gray-100"
                : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={
                step === 0 ? "text-gray-300" : "text-gray-700"
              }
            >
              Back
            </Text>
          </TouchableOpacity>

          {!isLastStep && (
            <TouchableOpacity
              onPress={handleNext}
              className="px-8 py-3 bg-blue-600 rounded-2xl"
            >
              <Text className="font-bold text-white">Next</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
      >
        <View className="px-1">
          {(isWizard ? fields[step] : flatFields)
            .filter((field: any) => {
              if (typeof field.hidden === "function")
                return !field.hidden(formik.values);
              return !field.hidden;
            })
            .map((field: any, idx: number) => (
              <View
                key={field.name || `field-${idx}`}
                className={field.wrapperClass || sectionWrapperClass}
              >
                <FormBuilderInput field={field} formik={formik} />
              </View>
            ))}
        </View>

        {isLastStep && (
          <TouchableOpacity
            onPress={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            className={`mt-4 w-full py-5 rounded-[22px] items-center shadow-md ${
              formik.isSubmitting ? "bg-gray-400" : "bg-[#1A1C1E]"
            }`}
          >
            {formik.isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-bold tracking-widest text-white uppercase">
                {loadingButtonLabel}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};