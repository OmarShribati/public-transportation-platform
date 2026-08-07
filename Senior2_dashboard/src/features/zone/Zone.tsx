import { DataView } from "@/components/view/DataView";
import { Options } from "@/components/view/Options";
import { ColumnDef } from "@tanstack/react-table";
import { ZoneAPI } from "./api";

export interface ZoneType {
  zone_id: number;
  name: string;
  description: string;
  level: number;
  daily_price: string;
  weekly_price: string;
  monthly_price: string;
}

export const Zone = () => {
  const getColumns = (): ColumnDef<ZoneType>[] => [
    {
      accessorKey: "zone_id",
      header: "ID",
      cell: (info) => <span className="font-bold text-gray-500">#{info.getValue() as number}</span>,
    },
    {
      accessorKey: "name",
      header: "Zone Name",
      cell: (info) => <span className="font-semibold text-gray-900">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info) => <span className="text-gray-600">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "daily_price",
      header: "Daily",
      cell: (info) => <span className="text-gray-700">{Number(info.getValue()).toLocaleString()} SYP</span>,
    },
    {
      accessorKey: "weekly_price",
      header: "Weekly",
      cell: (info) => <span className="text-gray-700">{Number(info.getValue()).toLocaleString()} SYP</span>,
    },
    {
      accessorKey: "monthly_price",
      header: "Monthly",
      cell: (info) => <span className="font-bold text-emerald-600">{Number(info.getValue()).toLocaleString()} SYP</span>,
    },
  ];

  return (
    <DataView
      viewType="table"
      queryKey="Zones"
      dataKey="zones" 
      tableTitle="Zones Management"
      queryFn={() => ZoneAPI.list()}
      columns={getColumns()}
    />
  );
};