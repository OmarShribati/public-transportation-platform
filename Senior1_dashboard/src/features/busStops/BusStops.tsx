import { DataView } from "@/components/view/DataView";
import { Options } from "@/components/view/Options";
import { ColumnDef } from "@tanstack/react-table";
import { StatusToggle } from "./StatusToggle";
import { StopAPI } from "./api";
import type { StopType } from "./interface";

export const BusStops = () => {

  const getColumns = (): ColumnDef<StopType>[] => [
    { 
      accessorKey: "name", 
      header: "Stop Name", 
      cell: info => <span className="font-bold text-gray-100">{info.getValue() as string}</span> 
    },
    {
      accessorKey: "created_at",
      header: "Registration Date",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{date.toLocaleString('en-GB')}</span>;
      },
    },
    {
      accessorKey: "is_active",
      header: "System Status",
      cell: ({ row }) => (
        <StatusToggle
          id={row.original.stop_id}
          isActive={row.original.is_active}
          queryKey="Stops"
        />
      ),
    },
  ];

  return (
    <DataView
      viewType="table"
      queryKey="Stops"
      renderOptions={(row: StopType) => (
        <Options
          type={['edit', 'delete']}
          id={row.stop_id}
          searchParams={{
            name: row.name,
            latitude: row.latitude,
            longitude: row.longitude,
            is_active: row.is_active
          }}
          editRoute={`/stops/edit/${row.stop_id}`}
          query={StopAPI.delete}
          queryKey="Stops"
        />
      )}
      dataKey="stops"
      tableTitle="Transit Stops Control" 
      addButtonLabel="Create New Stop"
      link="/stops/add"
      queryFn={() => StopAPI.list()}
      columns={getColumns()}
    />
  );
};