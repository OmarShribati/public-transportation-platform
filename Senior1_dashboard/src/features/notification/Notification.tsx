import { FormBuilder } from '@/components/form/FormBuilder';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { UserAPI } from '../users/api';
import { DriverAPI } from '../users/drivers/api';
import { NotificationAPI } from './api';

export const Notification = () => {
    const { t } = useTranslation();

    const validationSchema = Yup.object().shape({
        title: Yup.string().required(t('required')),
        body: Yup.string().required(t('required')),
        target_group: Yup.string().required(t('required')),
        selected_ids: Yup.array().when('target_group', {
            is: (val: string) => val === 'specific_users' || val === 'specific_drivers',
            then: (schema) => schema.min(1, t('please_select_at_least_one')),
            otherwise: (schema) => schema.notRequired(),
        }),
    });

    const fields = (formik: any): any[][] => [
        [{
            name: "title",
            label: "Notification Title",
            type: "text",
            placeholder: "Enter notification title...",
            required: true,
        }],
        [{
            name: "body",
            label: "Message Body",
            type: "textarea",
            placeholder: "Type your message here...",
            required: true,
        }],
        [{
            name: "target_group",
            label: "Send To",
            type: "select",
            options: [
                { value: "all", label: "All Users & Drivers" },
                { value: "all_users", label: "All Passengers" },
                { value: "all_drivers", label: "All Drivers" },
                { value: "specific_users", label: "Specific Passengers" },
                { value: "specific_drivers", label: "Specific Drivers" },
            ],
            placeholder: "Select target audience",
        }],
        ...(formik?.values?.target_group === "specific_users" ? [[{
            name: "selected_ids",
            label: "Select Passengers",
            type: "selectMulti",
            url: () => UserAPI.list(),
            optionLabel: "name",
            optionValue: "id",
            placeholder: "Search and select passengers...",
        }]] : []),
        ...(formik?.values?.target_group === "specific_drivers" ? [[{
            name: "selected_ids",
            label: "Select Drivers",
            type: "selectMulti",
            url: () => DriverAPI.list(),
            optionLabel: "name",
            optionValue: "id",
            placeholder: "Search and select drivers...",
        }]] : []),
    ];


    return (
        <div className="w-full min-h-screen bg-[#08090a] text-white pb-20">
            <div className="px-6 md:px-16 py-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-10">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                            Send <span className="text-emerald-500 italic underline decoration-emerald-500/30">Notification</span>
                        </h1>
                        <p className="text-gray-400 max-w-md">
                            Broadcast messages to your users and drivers efficiently.
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl bg-[#111214] p-8 rounded-3xl border border-white/5 shadow-2xl">
                    <FormBuilder
                        fields={fields(Formik)}
                        initialValues={{
                            title: "",
                            body: "",
                            target_group: "all",
                            selected_ids: [],
                        }}
                        validationSchema={validationSchema}
                        query={(values) => {
                            const payload = {
                                title: values.title,
                                body: values.body,
                                target: values.target_group,
                                ids: values.target_group.includes('specific') ? values.selected_ids : [],
                            };

                            return NotificationAPI.send(payload);
                        }}

                    />
                </div>
            </div>
        </div>
    );
};