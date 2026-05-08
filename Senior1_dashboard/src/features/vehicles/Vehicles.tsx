import { DataView } from "@/components/view/DataView";
import { Options } from "@/components/view/Options";
import { ColumnDef } from "@tanstack/react-table";
import { VehiclesAPI } from "./api";
import type { VehiclesType } from "./interface";
import { AssignToRoute } from "./AssignToRoute";
const Badge = ({ children, variant = "default" }: { 
    children: React.ReactNode, 
    variant?: "default" | "success" | "danger" | "warning" | "info" 
  }) => {
    const styles = {
      default: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      danger: "bg-red-500/10 text-red-500 border-red-500/20",
      warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
  
    return (
      <span className={`
        px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md tracking-wider uppercase
        ${styles[variant]}
      `}>
        {children}
      </span>
    );
  };
export const Vehicles = () => {

    const getColumns = (): ColumnDef<VehiclesType>[] => [
        { 
            accessorKey: "vehicle_number", 
            header: "Plate Number", 
            cell: info => <span className="font-mono font-bold text-blue-400">{info.getValue() as string}</span> 
        },
        { 
            accessorKey: "vehicle_type", 
            header: "Type", 
            cell: info => <span className="capitalize">{info.getValue() as string}</span> 
        },
        { 
            accessorKey: "driver.full_name", 
            header: "Driver", 
            cell: info => (
                <div className="flex flex-col">
                    <span className="font-medium">{info.getValue() as string}</span>
                    <span className="text-[10px] text-gray-500">ID: {info.row.original.driver.driver_id}</span>
                </div>
            )
        },
        { 
            accessorKey: "route_name", 
            header: "Current Route", 
            cell: info => info.getValue() ? (
                <Badge className="bg-blue-500/10 text-blue-500 border-none">{info.getValue() as string}</Badge>
            ) : (
                <span className="text-gray-600 italic text-xs">Not Assigned</span>
            )
        },
        { 
            accessorKey: "is_full", 
            header: "Load", 
            cell: ({ getValue }) => (
                <span className={`text-xs px-2 py-1 rounded-full ${getValue() ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {getValue() ? 'Full' : 'Available'}
                </span>
            )
        },
        { 
            accessorKey: "is_active", 
            header: "Status", 
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getValue() ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                    <span className="text-sm">{getValue() ? 'Online' : 'Offline'}</span>
                </div>
            )
        },
    ];

    return (
        <DataView
            viewType="table"
            queryKey="vehicles"
            renderOptions={(row: VehiclesType) => (
                <Options
                    type={['editModal', 'delete' ,'details']}
                    id={row.vehicle_id}
                    query={VehiclesAPI.delete}
                    queryKey="vehicles"
                    editModalContent={ <AssignToRoute v_id={row.vehicle_id} />}
                    detailsRoute={`/vehicles/${row.vehicle_id}`}
                    />
            )}
            dataKey="vehicles"
            tableTitle="Fleet Management"
            addButtonLabel="Register Vehicle"
            link="/vehicles/add"
            queryFn={() => VehiclesAPI.list()}
            columns={getColumns()}
        />
    );
};