import React from 'react';
import { FormBuilder } from "@/components/form/FormBuilder";
import { RouteAPI } from "../busRoutes/api"; // تأكد من المسار الصحيح للـ API
import { VehiclesAPI } from "./api"; // الـ API الخاص بالمركبات
import { Route } from "lucide-react";
import { VehiclesVal } from './validation';

interface AssignProps {
  v_id: string | number;
  v_number?: string; // اختياري لعرض رقم المركبة بالفورم
}

export const AssignToRoute = ({ v_id, v_number }: AssignProps) => {
  
  const fields = [
    [
      {
        name: "route_id",
        label: "Select Target Route",
        type: "select", 
        url: () => RouteAPI.list(),
        optionLabel: "route_name",
        optionValue: "route_id",
        placeholder: "Choose a route for this vehicle...",
        wrapperClass: "col-span-2",
      },
    ],
  ];

  return (
    <div className="bg-[#111214] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Route size={120} />
      </div>

      <div className="relative z-10">
        <div className="mb-8">
          <h3 className="text-2xl font-black tracking-tight text-white mb-2">
            Assign Vehicle to Route
          </h3>
          <p className="text-gray-500 text-sm">
            Target Vehicle: <span className="text-blue-400 font-mono font-bold">{v_number || `#${v_id}`}</span>
          </p>
        </div>

        <FormBuilder
          fields={fields}
          loadingButtonLabel="Confirm Assignment"
          
          validationSchema={VehiclesVal}
          query={(values) => {
            return VehiclesAPI.assignToRoute(v_id, values);
          }}
        />
      </div>
    </div>
  );
};