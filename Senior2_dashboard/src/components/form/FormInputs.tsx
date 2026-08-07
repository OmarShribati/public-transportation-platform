import React, { useEffect, useState } from "react";
import { DatePicker } from "../../constant/MainImport";
import { t } from "i18next";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";
import GoogleMapDrawing from "../shared/Map";

interface Option {
    value: any;
    label: string;
}

interface FieldConfig {
    shapeType?: any;
    name: string;
    type: string;
    label?: string;
    placeholder?: string;
    options?: any[];
    url?: any;
    optionLabel?: string;
    optionValue?: string;
    displayFields?: string[];
    isMulti?: boolean;
    radionName?: string[];
    rangeType?: 'number' | 'date';
    radionlabel?: string[];
    onChange?: (value: any) => void;
}

interface Props {
    field: FieldConfig;
    formik: any;
    previews?: { [key: string]: string | null | any };
    handleFileChange?: (
        event: React.ChangeEvent<HTMLInputElement>,
        field: string,
        setFieldValue: (field: string, value: any) => void
    ) => void;
}



export const FormBuilderInput = ({
    field,
    formik,
    previews = {},
    handleFileChange,
}: Props) => {

    const {
        name,
        type,
        label,
        placeholder,
        options = [],
        url,
        optionLabel = "name",
        optionValue = "id",
        displayFields = [],
        isMulti = false,
        radionName = [],
        radionlabel = [],
    } = field;

    const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const hasError = formik.touched[name] && formik.errors[name];


    const loadApiOptions: any = async (
        inputValue: string,
        loadedOptions: Option[],
        additional: { page: number }
    ) => {
        console.log(loadedOptions);

        if (!url) return { options: [], hasMore: false, additional: { page: 1 } };

        const perPage = 15;
        let res;

        if (typeof url === "function") {
            res = await url(additional.page, perPage, inputValue);
        } else {
            const params: any = { page: additional.page, perPage };
            if (inputValue) params.search = inputValue;
            res = await fetch(url + "?" + new URLSearchParams(params)).then((r) =>
                r.json()
            );
        }

        const items = res.items || [];
        const newOptions: Option[] = items.map((item: any) => ({
            value: item[optionValue],
            label: item[optionLabel],
        }));

        return {
            options: newOptions,
            hasMore: res.currentPage < res.totalPages,
            additional: { page: additional.page + 1 },
        };
    };

    useEffect(() => {
        const value = formik.values[name];


        if (!value || typeof value !== 'string') {
            setSelectedDateTime(null);
            return;
        }

        let dateToSet: Date | null = null;

        if (type === "time") {

            const [hours, minutes, seconds = 0] = value.split(":").map(Number);



            dateToSet = new Date(2000, 0, 1, hours, minutes, seconds);

        } else if (type === "date") {

            const [year, month, day] = value.split("-").map(Number);
            dateToSet = new Date(year, month - 1, day);
        } else if (type === "datetime") {


            dateToSet = new Date(value);


            if (isNaN(dateToSet.getTime())) {
                const [datePart, timePart] = value.split(" ") || [];
                if (datePart && timePart) {
                    const [year, month, day] = datePart.split("-").map(Number);
                    const [hours, minutes] = timePart.split(":").map(Number);
                    dateToSet = new Date(year, month - 1, day, hours, minutes);
                }
            }
        }


        if (dateToSet && !isNaN(dateToSet.getTime())) {
            setSelectedDateTime(dateToSet);
        } else {
            setSelectedDateTime(null);
        }

    }, [formik.values[name], name, type]);

    const inputClass = `
    w-full px-4 py-3 rounded-2xl 
      placeholder-text-sidebar-text text-lg
    bg-tableBg text-main transition-all duration-300
    ${hasError
            ? `border border-red-500/50 shadow-[0_0_15px_rgba(255,0,0,0.4)]`
            : `border border-border-table shadow-[0_0_10px_rgba(0,0,0,0.1)]`
        }
    focus:outline-none focus:ring-2 focus:ring-text-highlight
`;

    const labelClass = "mb-2 block text-sm text-main font-medium ";
    const errorClass = "text-sm mt-1 text-red-500";

    const renderInput = () => {
        switch (type) {
            case "text":
            case "number":
            case "email":
            case "password":
                return (
                    <div className="relative">
                        <input
                            id={name}
                            {...formik.getFieldProps(name)}
                            type={type === "password" ? (showPassword ? "text" : "password") : type}
                            placeholder={placeholder || ""}
                            className={inputClass}
                        />
                    </div>
                );

            case "textarea":
                return (
                    <textarea
                        id={name}
                        {...formik.getFieldProps(name)}
                        placeholder={placeholder || ""}
                        className={inputClass + " resize-none h-32"}
                    />
                );
            case "select":
            case "selectMulti": {

                const customStyles = {
                    control: (base: any, state: any) => ({
                        ...base,
                        background: 'var(--color-table-bg)',
                        minHeight: '52px',
                        borderRadius: '1rem',
                        borderColor: state.isFocused ? 'var(--color-text-highlight)' : 'var(--color-border)',
                        boxShadow: state.isFocused ? '0 0 0 2px var(--color-text-highlight)' : '0 0 10px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s',
                    }),
                    menu: (base: any) => ({
                        ...base,
                        background: 'var(--color-table-bg)',
                        zIndex: 50,
                        borderRadius: '1rem',
                        overflow: 'hidden'
                    }),
                    option: (base: any, state: any) => ({
                        ...base,
                        background: state.isSelected ? 'var(--color-text-highlight)' : state.isFocused ? 'var(--color-text-highlight-300)' : 'transparent',
                        color: state.isSelected ? 'white' : 'var(--color-text-main)',
                        cursor: 'pointer',
                    }),
                    multiValue: (base: any) => ({
                        ...base,
                        backgroundColor: 'var(--color-text-highlight)',
                        borderRadius: '0.75rem',
                    }),
                    multiValueLabel: (base: any) => ({
                        ...base,
                        color: 'white',
                    }),
                };


                const [fetchedOptions, setFetchedOptions] = useState<any[]>([]);
                const isAsync = !!field.url;

                useEffect(() => {
                    if (isAsync && typeof field.url === 'function') {
                        field.url().then((res: any) => {

                            const data = res.data || res;
                            const dataArray = Array.isArray(data)
                                ? data
                                : Object.values(data).find(val => Array.isArray(val)) || [];
                            setFetchedOptions(dataArray);
                        }).catch(err => console.error("API Error:", err));
                    }
                }, [field.url]);


                const rawData = isAsync ? fetchedOptions : (options || []);


                const selectOptions = rawData.map((item: any) => ({
                    value: item[field.optionValue] ?? item.stop_id ?? item.id ?? item.value,
                    label: field.displayFields && field.displayFields.length
                        ? field.displayFields.map((f: string) => item[f]).join(" ")
                        : item[field.optionLabel] ?? item.name ?? item.label ?? item.value,
                }));


                const currentValue = formik.values[name];
                const selectedValue = isMulti
                    ? selectOptions.filter((opt) => Array.isArray(currentValue) && currentValue.includes(opt.value))
                    : selectOptions.find((opt) => opt.value === currentValue) || null;

                return (
                    <Select
                        isMulti={isMulti}
                        options={selectOptions}
                        value={selectedValue}
                        placeholder={t(placeholder || "choose")}
                        noOptionsMessage={() => "لا توجد نتائج"}
                        isSearchable={true}
                        isClearable={true}
                        styles={customStyles}
                        onChange={(selected: any) => {
                            const val = isMulti
                                ? (selected ? selected.map((opt: any) => opt.value) : [])
                                : selected?.value;

                            formik.setFieldValue(name, val);
                            if (field.onChange) field.onChange(val);
                        }}
                    />
                );
            }

            case "radio":
                return (
                    <div className="flex gap-4">
                        {radionName.map((val, i) => (
                            <label key={i} className="flex items-center gap-2 text-main">
                                <input
                                    type="radio"
                                    name={name}
                                    value={val}
                                    checked={formik.values[name] === val}
                                    onChange={() => formik.setFieldValue(name, val)}

                                    className="form-radio h-5 w-5 text-highlight border-border-table focus:ring-highlight"
                                />
                                {t(radionlabel[i] || val)}
                            </label>
                        ))}
                    </div>
                );
            case "range":
                const isDateRange = field.rangeType === 'date';


                const fromName = name;
                const toName = name.replace(/^s_/, 'e_');

                return (
                    <div className="flex flex-col md:flex-row gap-4 items-center w-full">

                        <div className="flex-1 w-full">
                            {isDateRange ? (
                                <DatePicker
                                    selected={formik.values[fromName] ? new Date(formik.values[fromName]) : null}
                                    onChange={(date) => formik.setFieldValue(fromName, date?.toISOString().slice(0, 10))}
                                    placeholderText={t("from")}
                                    className={inputClass}
                                    dateFormat="yyyy-MM-dd"
                                />
                            ) : (
                                <input
                                    type="number"
                                    placeholder={t("min_value")}
                                    {...formik.getFieldProps(fromName)}
                                    className={inputClass}
                                />
                            )}
                        </div>

                        <span className="text-main font-bold"> - </span>

                        <div className="flex-1 w-full">
                            {isDateRange ? (
                                <DatePicker
                                    selected={formik.values[toName] ? new Date(formik.values[toName]) : null}
                                    onChange={(date) => formik.setFieldValue(toName, date?.toISOString().slice(0, 10))}
                                    placeholderText={t("to")}
                                    className={inputClass}
                                    dateFormat="yyyy-MM-dd"
                                />
                            ) : (
                                <input
                                    type="number"
                                    placeholder={t("max_value")}
                                    {...formik.getFieldProps(toName)}
                                    className={inputClass}
                                />
                            )}
                        </div>
                    </div>
                );
            case "checkbox":
                return (
                    <label className="inline-flex items-center cursor-pointer gap-2 select-none">
                        <span
                            className={`
                                        w-5 h-5 flex-shrink-0 rounded border-2 
                                        flex items-center justify-center
                                        
                                        ${formik.values[name] === 1 ? "bg-highlight border-none" : "bg-tableBg border-border-table"} 
                                        transition-colors
                                    `}
                            onClick={() =>
                                formik.setFieldValue(name, formik.values[name] === 1 ? 0 : 1)
                            }
                        >
                            {formik.values[name] === 1 && (
                                <svg
                                    className="w-3 h-3 text-mainBg"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </span>
                        <span className="text-main">{t(label || name)}</span>
                    </label>
                );


            case "file":
            case "image":
                const isPDF = type === "file";
                return (
                    <div className="relative flex flex-col items-center">

                        <div className="mb-4">
                            {previews[name] ? (
                                isPDF ? (
                                    <a
                                        href={previews[name]}
                                        target="_blank"
                                        className="text-blue-500 underline"
                                    >
                                        {previews[name]?.split("/").pop()}
                                    </a>
                                ) : (
                                    <img
                                        src={previews[name]}
                                        alt={name}
                                        className="w-32 h-32 object-cover rounded-full border-4 border-addButton shadow-lg"
                                    />
                                )
                            ) : (
                                <div className="w-32 h-32 bg-tableHeader rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                                    {t("No Image")}
                                </div>
                            )}
                        </div>


                        <input
                            type="file"
                            id={name}
                            name={name}
                            accept={isPDF ? "application/pdf" : "image/*"}
                            onChange={(e) => handleFileChange?.(e, name, formik.setFieldValue)}
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => document.getElementById(name)?.click()}
                            className="mt-4 px-8 py-3 bg-addButton text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 font-semibold"
                        >
                            {t("choose")} {isPDF ? t("file") : t("photo")}
                        </button>
                    </div>
                );

            case "date":
            case "time":
            case "datetime":
                return (
                    <DatePicker
                        selected={selectedDateTime}
                        onChange={(date) => {
                            if (!date) return;
                            let formatted = "";
                            if (type === "date") {
                                formatted = date.toISOString().slice(0, 10);
                            } else if (type === "datetime") {
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(2, "0");
                                const dd = String(date.getDate()).padStart(2, "0");
                                const hh = String(date.getHours()).padStart(2, "0");
                                const min = String(date.getMinutes()).padStart(2, "0");
                                formatted = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
                            } else if (type === "time") {
                                const hh = String(date.getHours()).padStart(2, "0");
                                const min = String(date.getMinutes()).padStart(2, "0");
                                const sec = String(date.getSeconds()).padStart(2, "0");
                                formatted = `${hh}:${min}:${sec}`;
                            }

                            formik.setFieldValue(name, formatted);
                            setSelectedDateTime(date);
                        }}
                        showTimeSelect={type === "datetime" || type === "time"}
                        showTimeSelectOnly={type === "time"}
                        timeIntervals={1}
                        dateFormat={
                            type === "date"
                                ? "yyyy-MM-dd"
                                : type === "datetime"
                                    ? "yyyy-MM-dd HH:mm"
                                    : "HH:mm:ss"
                        }
                        className={inputClass}
                    />
                );


            case "map":

                return (
                    <div className="rounded-2xl overflow-hidden border border-border-table shadow-lg">
                        <GoogleMapDrawing
                            value={formik.values[name] || []}
                            shapeType={field.shapeType || "polygon"}
                            onChange={(points) => formik.setFieldValue(name, points)}
                            height="450px"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (





        <div className="mb-6">

            {label && type !== "checkbox" && (
                <label htmlFor={name} className={labelClass}>{label}</label>
            )}

            {renderInput()}


            {(formik.touched[`${name}_from`] && formik.errors[`${name}_from`]) && (
                <div className={errorClass}>{t(formik.errors[`${name}_from`])}</div>
            )}
            {(formik.touched[`${name}_to`] && formik.errors[`${name}_to`]) && (
                <div className={errorClass}>{t(formik.errors[`${name}_to`])}</div>
            )}
        </div>
    );
};