import { DataView } from "@/components/view/DataView";
import { Options } from "@/components/view/Options";
import { ColumnDef } from "@tanstack/react-table";
import { RouteType } from "./interface";
import { RouteAPI } from "./api";

export const BusRoutes = () => {

    const getColumns = (): ColumnDef<RouteType>[] => [
        {
            accessorKey: "route_name",
            header: "Route Name",
            cell: info => <span className="font-bold text-blue-400">{info.getValue() as string}</span>
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: info => <span>{Number(info.getValue()).toLocaleString()} SYP</span>
        },
        {
            accessorKey: "path.distance_meters",
            header: "Distance",
            cell: info => {
                const meters = info.getValue() as number;
                return <span>{(meters / 1000).toFixed(2)} km</span>;
            }
        },
        {
            id: "stops_count",
            header: "Stops",
            cell: ({ row }) => {

                const count = row.original.path?.waypoints?.filter(w => w.type === 'stop').length || 0;
                return <span className="badge bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">{count} Stops</span>;
            }
        },
        {
            id: "zone_name",
            header: "Zone",
            cell: ({ row }) => {
                const zone = row.original.zone_name;
                return <span className="badge bg-blue-500/10 text-blue-500 px-2 py-1 rounded">{zone || "N/A"}</span>;
            }
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({ getValue }) => {
                const val = getValue();
                if (!val) return "-";
                const date = new Date(val as string);
                return <span className="text-gray-400 text-sm">{date.toLocaleDateString('en-GB')}</span>;
            },
        },
    ];

    return (
        <DataView
            viewType="table"
            queryKey="Routes"
            renderOptions={(row: RouteType) => (
                <Options
                    type={['delete', 'details']}
                    id={row.route_id}
                    searchParams={{
                        row
                    }}

                    detailsRoute={`/routes/${row.route_id}`}
                    query={RouteAPI.delete}
                    queryKey="Routes"
                />
            )}
            dataKey="routes"
            tableTitle="Routes Management"
            addButtonLabel="Add New Route"
            link="/routes/add"
            queryFn={() => RouteAPI.list()}
            columns={getColumns()}
        />
    );
};