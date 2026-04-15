import React, { useEffect, useState } from "react";
import { t } from "i18next";
import { Trash2 } from "lucide-react";
import { FormBuilderInput } from "@/constant/MainImport";

interface RepeaterFieldProps {
  name: string;
  field: any;
  formik: any;
  label?: any;
}

const FormRepeater = ({ name, field, formik, label }: RepeaterFieldProps) => {
  const values = formik.values;
  const fieldValue = getValueByPath(values, name) || [];
  
  const [isExpanded, setIsExpanded] = useState(!field.startCollapsed);

  useEffect(() => {
    const currentList = getValueByPath(formik.values, name) || [];
    if (!field.startCollapsed && currentList.length === 0) {
      const count = field.defaultCount || 1;
      const newValues = { ...formik.values };
      const defaultArray = Array.from({ length: count }, () => ({}));
      set(newValues, name, defaultArray);
      formik.setValues(newValues);
    }
  }, []);
  // في FormRepeater.tsx - دالة مساعدة جديدة
  const createDefaultItem = (options: any[]) => {
    const defaultItem: Record<string, any> = {};
    options.forEach(opt => {
      if (opt.type === "checkbox") {
        defaultItem[opt.name] = 0; // القيمة الافتراضية لـ checkbox
      } else if (opt.type === "number") {
        defaultItem[opt.name] = 0; // مثلاً للأرقام
      } else {
        defaultItem[opt.name] = "";
      }
    });
    return defaultItem;
  };
  useEffect(() => {
    const currentList = getValueByPath(formik.values, name) || [];
    if (!field.startCollapsed && currentList.length === 0) {
      const count = field.defaultCount || 1;
      const newValues = { ...formik.values };
      const defaultArray = Array.from({ length: count }, () => createDefaultItem(field.options)); // 🚨 هذا التعديل صحيح وموجود الآن
      set(newValues, name, defaultArray);
      formik.setValues(newValues);
    }
  }, [field.options, field.startCollapsed, formik.values, name]); // 🚨 أضف dependencies

  // في FormRepeater - handleAdd:
  const handleAdd = () => {
    const currentList = getValueByPath(values, name) || [];
    const newValues = { ...values };

    if (!isExpanded) {
      const count = field.defaultCount || 1;
      set(newValues, name, Array.from({ length: count }, () => createDefaultItem(field.options))); // 🚨 التعديل
      formik.setValues(newValues);
      setIsExpanded(true);
      return;
    }

    set(newValues, name, [...currentList, createDefaultItem(field.options)]); // 🚨 التعديل
    formik.setValues(newValues);
  };

  const handleRemove = (index: number) => {
    const currentList = getValueByPath(values, name) || [];
    if (currentList.length <= 1) return;
    const updated = currentList.filter((_: any, i: number) => i !== index);
    const newValues = { ...values };
    set(newValues, name, updated);
    formik.setValues(newValues);
  };

  if (!isExpanded) {
    return (
      <div className="mb-4">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex mt-4 items-center gap-2 px-5 py-2.5 text-sm font-medium bg-addButton text-white rounded-full shadow hover:brightness-110 transition-all"
        >
          + {field.label || t('add_new')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fieldValue.map((_: any, index: number) => (
        <div
          key={index}
          className="relative p-6 space-y-4 transition-all duration-300 bg-navBg hover:shadow-md"
        >
          {field.options?.map((subField: any) => {
            const subFieldName = `${name}[${index}].${subField.name}`;
            const updatedField = { ...subField, name: subFieldName };

            if (subField.type === "repeater") {
              return (
                <FormRepeater
                  key={subFieldName}
                  name={subFieldName}
                  field={updatedField}
                  formik={formik}
                  label={subField.label}
                />
              );
            }

            return (
              <FormBuilderInput
                key={subFieldName}
                field={updatedField}
                formik={formik}
              />
            );
          })}

          {index > 0 && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-0 p-2 text-white transition-all rounded-full shadow ltr:right-3 rtl:left-3 bg-deleteButton hover:scale-105 hover:brightness-110"
              title={t("remove")}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex mt-2 items-center gap-2 px-5 py-2.5 text-sm font-medium bg-addButton text-white rounded-full shadow hover:brightness-110 transition-all"
      >
        + {t(label)}
      </button>
    </div>
  );
};

export default FormRepeater;

// دوال مساعدة
function getValueByPath(obj: any, path: string) {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .reduce((acc, part) => acc && acc[part], obj);
}

function set(obj: any, path: string, value: any) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let temp = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!temp[parts[i]]) temp[parts[i]] = {};
    temp = temp[parts[i]];
  }
  temp[parts[parts.length - 1]] = value;
}
