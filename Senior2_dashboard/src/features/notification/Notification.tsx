import { FormBuilder } from '@/components/form/FormBuilder';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { NotificationAPI } from './api';

export const Notification = () => {
    const { t } = useTranslation();

    const validationSchema = Yup.object().shape({
        title: Yup.string().required(t('required')),
        body: Yup.string().required(t('required')),
       
    });

    const fields =  [
        [{
            name: "title",
            label: "Notification Title",
            type: "text",
            placeholder: "Enter notification title...",
            required: true,
            wrapperClass: "col-span-2 md:col-span-1"
            
        }],
        [{
            name: "body",
            label: "Message Body",
            type: "textarea",
            placeholder: "Type your message here...",
            required: true,
            wrapperClass: "col-span-2 md:col-span-1"
        }],
     
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

                <div className=" bg-[#111214] p-8 rounded-3xl border border-white/5 shadow-2xl">
                    <FormBuilder
                        fields={fields}
                        initialValues={{
                            title: "",
                            body: "",
                        }}
                        validationSchema={validationSchema}
                        query={(values) => {
                            const payload = {
                                title: values.title,
                                body: values.body,
                              };

                            return NotificationAPI.send(payload);
                        }}

                    />
                </div>
            </div>
        </div>
    );
};