import { FormBuilder } from '@/components/form/FormBuilder';
import { Link, useParams, useSearch } from '@tanstack/react-router'
import React from 'react'
import { useTranslation } from 'react-i18next' 
import { StopVal } from './validation';
import { StopAPI } from './api';
import clsx from 'clsx';
import { ArrowLeft, Info, MapPin } from 'lucide-react';

export const edit = () => {
  const { t } = useTranslation();
  const data = useSearch({ strict: false });
  const { id } = useParams({ strict: false });

  const initialValues = {
    name: data?.name ?? '',
    geofence_area: (data?.latitude && data?.longitude) 
      ? [{ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) }] 
      : [],
  };

  const fields = [
    [
      {
        name: "name",
        label: t("Name"),
        type: "text",
        placeholder: t("Enter name"),
        wrapperClass: "col-span-2",
      },
    ],
    [
      {
        name: "geofence_area",
        label: t("Location"),
        type: "map", 
        wrapperClass: "col-span-2",
      },
    ],
  ];

  return (
    <>
     <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <MapPin size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Update <span className="text-emerald-500">Transit Stop</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-12 font-medium">
            Define system nodes and geographic boundaries for the fleet.
          </p>
        </div>

        <Link 
          to="/stops" 
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Back to Fleet</span>
        </Link>
      </div>

       <div className={clsx(
        "relative p-10 rounded-[3rem]",
        "bg-[#0c0e10]/40 backdrop-blur-3xl border border-white/[0.03]",
        "shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_0_80px_rgba(255,255,255,0.01)]"
      )}>
        
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Info size={120} className="text-emerald-500/10" />
        </div>

        <FormBuilder
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={StopVal}
        fields={fields}
        loadingButtonLabel={t("Update Stop")}
        query={(values) => {
          const coords = values.geofence_area?.[0];
          
          if (!coords) {
            alert(t("Please select a location on the map"));
            return Promise.reject();
          }

          const body = {
            name: values.name,
            latitude: Number(coords.lat).toFixed(6),
            longitude: Number(coords.lng).toFixed(6),
            is_active: data?.is_active ?? true 
          };
          return StopAPI.update(body, id || data?.id);
        }}
        className="grid gap-4"
      />
      </div>

    </div>
    
    </>
    
  )
}