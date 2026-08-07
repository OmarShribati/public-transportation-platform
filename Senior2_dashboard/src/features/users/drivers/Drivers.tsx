import { useState, useMemo } from "react";
import { DataView } from "@/components/view/DataView";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X, UserPlus, UserMinus, Car } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { DriverAPI } from "./api";
import { FormBuilder } from "@/components/form/FormBuilder";
import { Modal } from "@/components/modal/Modal";
import { Options } from "@/components/view/Options";
import { DriverVehicleVal } from "./validation";

export const Drivers = () => {
    const [activeTab, setActiveTab] = useState<"creation" | "deactivation">("creation");
    const [selectedDriverId, setSelectedDriverId] = useState<number | null | any>(null);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

    const queryClient = useQueryClient();

    const handleAction = async (driverRow: any, action: 'approve' | 'reject') => {
        const id = driverRow.id;

        try {
            if (activeTab === "creation") {
                if (action === 'approve') {
                    if (!driverRow.vehicle || Object.keys(driverRow.vehicle).length === 0) {
                        setSelectedDriverId(id);
                        setIsVehicleModalOpen(true);
                        return;
                    }
                    await DriverAPI.approveWithHisVehicle(id);
                    toast.success("Driver approved with existing vehicle!");
                } else {
                    await DriverAPI.rejectDriver(id);
                    toast.error("Account creation rejected");
                }
            } 
            
            else {
                if (action === 'approve') {
                    await DriverAPI.approveDeactivationRequest(id);
                    toast.success("Account deactivated successfully");
                } else {
                    await DriverAPI.rejectDeactivationRequest(id);
                    toast.error("Deactivation request rejected");
                }
            }

            queryClient.invalidateQueries({ queryKey: ["DriverRequests"] });
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const fields = [
        [
            { name: "vehicle_type", label: "Vehicle Model", type: "text", placeholder: "Bmw", wrapperClass: "col-span-2 md:col-span-1" },
        ],
        [
            { name: "vehicle_number", label: "Plate Number", type: "text", placeholder: "2500AB", wrapperClass: "col-span-2 md:col-span-1" },
        ]
    ];

    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            accessorKey: "full_name",
            header: "Driver",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 font-medium">
                    <div className="w-10 h-10 rounded-full bg-[#00AA72]/10 flex items-center justify-center text-[#00AA72] font-black border border-[#00AA72]/20 shadow-sm">
                        {row.original.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-main leading-tight tracking-tight font-bold">{row.original.full_name}</span>
                        <span className="text-[10px] text-gray-500 font-mono tracking-tighter">{row.original.email}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "vehicle",
            header: "Vehicle Info",
            cell: ({ row }) => row.original.vehicle ? (
                <div className="flex flex-col border-l-2 border-[#00AA72] pl-3 py-1">
                    <span className="text-[11px] font-black text-main uppercase italic">{row.original.vehicle.vehicle_type}</span>
                    <span className="text-[10px] text-highlight font-mono">{row.original.vehicle.vehicle_number}</span>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 w-fit">
                    <Car size={12} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase italic tracking-tighter">Needs Entry</span>
                </div>
            )
        },
        {
            accessorKey: "actions",
            header: "Decision",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleAction(row.original, 'approve')}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-[10px] font-black uppercase transition-all duration-300 border ${
                            activeTab === 'creation' 
                            ? 'bg-[#00AA72]/10 hover:bg-[#00AA72] text-[#00AA72] border-[#00AA72]/20' 
                            : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 border-emerald-500/20'
                        } hover:text-white`}
                    >
                        <Check size={14} strokeWidth={3} /> {activeTab === 'creation' ? 'Approve' : 'Confirm Deactivation'}
                    </button>
                    <button
                        onClick={() => handleAction(row.original, 'reject')}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-sm text-[10px] font-black uppercase transition-all duration-300 border border-rose-500/20"
                    >
                        <X size={14} strokeWidth={3} /> {activeTab === 'creation' ? 'Reject' : 'Keep Account'}
                    </button>
                </div>
            )
        }
    ], [activeTab]);

    return (
        <div className="p-8 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-main tracking-tighter uppercase italic">
                            Request <span className="text-[#00AA72]">Center</span>
                        </h2>
                        <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase italic opacity-70">Fleet Onboarding & Management</p>
                    </div>

                    <div className="flex bg-sidebarBg p-1.5 rounded-lg border border-white/5">
                        <button onClick={() => setActiveTab("creation")} className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === "creation" ? "bg-[#00AA72] text-white" : "text-gray-500"}`}>
                            <UserPlus size={14} /> Creation
                        </button>
                        <button onClick={() => setActiveTab("deactivation")} className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === "deactivation" ? "bg-rose-600 text-white" : "text-gray-500"}`}>
                            <UserMinus size={14} /> Deactivation
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl shadow-2xl shadow-black/40 overflow-hidden border border-white/5 bg-sidebarBg/30 backdrop-blur-sm">
                    <DataView<any>
                        key={activeTab}
                        queryKey="DriverRequests"
                        renderOptions={(row: any) => (
                            <Options
                                type={['details']}
                                id={row.id}
                                searchParams={{ row }}
                                detailsRoute={`/drivers/${row.id}`}
                                queryKey="DriverRequests"
                            />
                        )}
                        queryFn={async () => {
                            const res = await DriverAPI.list();
                            return activeTab === "creation" ? res.account_creation_requests : res.deactivation_requests;
                        }}
                        columns={columns} viewType={"table"}
                    />
                </div>
                
                <Modal
                    isOpen={isVehicleModalOpen}
                    onClose={() => {
                        setIsVehicleModalOpen(false);
                        setSelectedDriverId(null);
                    }}
                    title="Assign Vehicle Details"
                >
                     <FormBuilder
                            queryKey="DriverRequests"
                            validationSchema={DriverVehicleVal}
                            fields={fields}
                            loadingButtonLabel="Activate And Add Vehicle"
                            query={(values) => DriverAPI.approveWithOutHisVehicle(selectedDriverId, values)}
                        />
                </Modal>
            </div>
        </div>
    );
};