import { FormBuilder } from "@/components/form/FormBuilder";
import { MerchantsAPI } from "./api";
import { Store, Info, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";

export const Add = () => {
  const fields = [
    [
      {
        name: "full_name",
        label: "Merchant Name",
        type: "text",
        placeholder: "Enter merchant name",
        wrapperClass: "col-span-1",
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "text",
        placeholder: "Enter phone number",
        wrapperClass: "col-span-1",
      },
    ],
    [
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "merchant@example.com",
        wrapperClass: "col-span-1",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        wrapperClass: "col-span-1",
      },
    ],
    [
      {
        name: "address",
        label: "Address",
        type: "text",
        placeholder: "Enter full address",
        wrapperClass: "col-span-2",
      },
    ],
  ];

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <Store size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Create New <span className="text-blue-500">Merchant</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-12 font-medium">
            Add a new merchant account and credentials to the system.
          </p>
        </div>

        <Link 
          to="/merchants" 
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Back to Merchants</span>
        </Link>
      </div>

      <div className={clsx(
        "relative p-10 rounded-[3rem]",
        "bg-[#0c0e10]/40 backdrop-blur-3xl border border-white/[0.03]",
        "shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_0_80px_rgba(255,255,255,0.01)]"
      )}>
        
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Info size={120} className="text-blue-500/10" />
        </div>

        <FormBuilder
          fields={fields}
          loadingButtonLabel="Create Merchant"
          query={(values) => {
            const body = {
              full_name: values.full_name,
              address: values.address,
              phone: values.phone,
              email: values.email,
              password: values.password,
            };
            return MerchantsAPI.create(body);
          }}
          className="grid gap-8"
        />
      </div>

    </div>
  );
};