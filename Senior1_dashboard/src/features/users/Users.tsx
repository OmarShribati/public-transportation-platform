import { useState, useMemo } from "react";
import { DataView } from "@/components/view/DataView";
import { ColumnDef } from "@tanstack/react-table";
import { UserAPI } from "./api";
import { Options } from "@/components/view/Options";
import { ActivateOrDeactivate } from "./passengers/ActivateOrDeactivate";
import { PassengerAPI } from "./passengers/api";
import { PassengerType } from "./interface";
import { Edit } from "./passengers/Edit";
import { DriverAPI } from "./drivers/api";
import { useRouter } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { PaymentCard } from "@/components/shared/PaymentCard";

export const Users = () => {
    const [activeTab, setActiveTab] = useState<"passengers" | "drivers">("passengers");
    const router = useRouter();
    const getColumns = (): ColumnDef<any>[] => {
        const baseColumns: ColumnDef<any>[] = [
            {
                accessorKey: "full_name",
                header: "User",
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00AA72] flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(0,170,114,0.3)] border border-white/10">
                            {row.original.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-main">{row.original.full_name}</span>
                            <span className="text-[11px] text-gray-500 font-mono tracking-tighter italic">{row.original.email}</span>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "phone",
                header: "Phone Number",
                cell: info => <span className="text-main/80 font-mono italic">{info.getValue() as string}</span>
            },

            {
                accessorKey: "account_status",
                header: "Status",
                cell: ({ row }) => {
                    const data = row.original;
                    const isActive = data.account_status === "active";

                    return (
                        <ActivateOrDeactivate
                            id={data.id}
                            isActive={isActive}
                            queryKey={activeTab === "passengers" ? "PassengerList" : "DriverList"}
                            onToggle={(id, currentStatus) => {
                                const targetAPI = activeTab === "passengers" ? PassengerAPI : DriverAPI;
                                return currentStatus ? targetAPI.deactivate(id) : targetAPI.activate(id);
                            }}
                        />
                    );
                }
            }
        ];

        if (activeTab === "drivers") {
            baseColumns.push(
                {
                    accessorKey: "approval_status",
                    header: "Approval Status",
                    cell: ({ getValue }) => {
                        const status = (getValue() as string)?.toLowerCase();
                        const statusConfig: Record<string, string> = {
                            approved: "border-green-500/50 text-[#4CAF50] bg-green-500/10",
                            rejected: "border-red-500/50 text-[#D32F2F] bg-red-500/10",
                            pending: "border-amber-500/50 text-[#FFB300] bg-amber-500/10",
                        };

                        const currentStyle = statusConfig[status] || "border-gray-500/50 text-gray-500 bg-gray-500/10";

                        return (
                            <span className={`px-3 py-0.5 rounded-sm text-[10px] font-black uppercase border shadow-[0_0_5px_rgba(0,0,0,0.1)] transition-all ${currentStyle}`}>
                                {status}
                            </span>
                        );
                    }
                }
                ,
                {
                    accessorKey: "vehicle",
                    header: "Vehicle Details",
                    cell: ({ row }) => row.original.vehicle ? (
                        <div className="flex flex-col border-l-2 border-[#00AA72]/30 pl-3">
                            <span className="text-sm font-bold text-main">{row.original.vehicle.vehicle_type}</span>
                            <span className="text-[10px] text-highlight font-mono tracking-widest">{row.original.vehicle.vehicle_number}</span>
                        </div>
                    ) : (
                        <span className="text-gray-500 text-xs italic opacity-50 px-3">—</span>
                    )
                }



            );
        }

        return baseColumns;
    };

    const columns = useMemo(() => getColumns(), [activeTab]);

    return (
       <>
        <div className="p-8 min-h-screen ">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-main tracking-tighter uppercase italic">
                            {activeTab === "passengers" ? "Passengers" : "Fleet"} <span className="text-[#00AA72]">Hub</span>
                        </h2>
                        <p className="text-gray-500 text-xs font-medium tracking-widest uppercase italic">Management Interface</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {activeTab === "drivers" && (
                            <button
                                onClick={() => router.navigate({ to: '/drivers/requests' })}
                                className="flex items-center gap-2 px-5 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white rounded-sm border border-amber-500/20 transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                            >
                                <Clock size={14} className="animate-pulse" />
                                Pending Requests
                            </button>
                        )}

                        <div className="flex bg-sidebarBg p-1 rounded-md border border-white/5 shadow-2xl">
                            <button
                                onClick={() => setActiveTab("passengers")}
                                className={`px-8 py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-all duration-500 ${activeTab === "passengers"
                                    ? "bg-[#00AA72] text-white shadow-[0_0_15px_rgba(0,170,114,0.4)]"
                                    : "text-gray-500 hover:text-main"
                                    }`}
                            >
                                Passengers
                            </button>
                            <button
                                onClick={() => setActiveTab("drivers")}
                                className={`px-8 py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-all duration-500 ${activeTab === "drivers"
                                    ? "bg-[#00AA72] text-white shadow-[0_0_15px_rgba(0,170,114,0.4)]"
                                    : "text-gray-500 hover:text-main"
                                    }`}
                            >
                                Drivers
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl shadow-xl shadow-black/20 overflow-hidden border border-white/5">
                    <DataView<any>
                        key={activeTab}
                        viewType="table"
                        queryKey={activeTab === "passengers" ? "PassengerList" : "DriverList"}
                        queryFn={async () => {
                            const res = await UserAPI.list();
                            return activeTab === "passengers" ? res.passengers : res.drivers;
                        }}
                        renderOptions={(row: any) => (
                           
                            <Options
                                type={['editModal' , 'details']}
                                id={row.id}
                                queryKey={activeTab === "passengers" ? "PassengerList" : "DriverList"}
                                editModalContent={<Edit row={row} />}
                                detailsRoute={activeTab === "drivers" ? `/drivers/${row.id}` : `/passengers/${row.id}`}
                                searchParams={{
                                    row
                                }}
                            />
                        )}
                        columns={columns}
                        tableTitle={activeTab === "passengers" ? "Passenger Control" : "Driver Control"}
                    />
                </div>
            </div>
        </div>
       </>
    );
};