import { FormBuilder } from '@/components/form/FormBuilder';
import { Debug } from '@/components/shared/Debug'
import React from 'react'
import { PassengersVal } from './validation';
import { PassengerAPI } from './api';

export const Edit = ({ row }: any) => {
    const initialValues = {
        full_name: row?.full_name ?? '',
        phone: row?.phone ?? '',
    };
    const fields = [
        [
            {
                name: "full_name",
                label: "Full name",
                type: "text",
                placeholder: "Edit full name",
                wrapperClass: "col-span-2",
            },
            {
                name: "phone",
                label: "Phone number",
                type: "text",
                placeholder: "Edit phone number",
                wrapperClass: "col-span-2",
            },
        ],
    ];
    return (
        <>
            <FormBuilder
                fields={fields}
                enableReinitialize={true}
                loadingButtonLabel="Confirm Update"
                initialValues={initialValues}
                queryKey={"PassengerList"}
                validationSchema={PassengersVal}
                query={(values) => PassengerAPI.update(values, row?.id)}
            />
        </>
    )
}
