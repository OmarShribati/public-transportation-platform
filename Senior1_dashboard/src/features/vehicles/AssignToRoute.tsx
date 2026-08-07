import React from 'react';
import { FormBuilder } from "@/components/form/FormBuilder";
import { RouteAPI } from "../busRoutes/api"; 
import { VehiclesAPI } from "./api"; 
import { Route } from "lucide-react";
import { VehiclesVal } from './validation';

interface AssignProps {
  v_id: string | number;
  v_number?: string;
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
  );
};