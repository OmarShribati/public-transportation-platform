import { DataView } from "@/components/view/DataView";
import { Options } from "@/components/view/Options";
import { ColumnDef } from "@tanstack/react-table";
import { TransactionsAPI } from "./api";

export interface TransactionType {
  transaction_id: number;
  card_id: number;
  card_number: string;
  amount: string;
  merchant_name: string;
  zone_name: string;
  payment_method: string;
  created_at: string;
}

export const Transactions = () => {
  const getColumns = (): ColumnDef<TransactionType>[] => [
    {
      accessorKey: "transaction_id",
      header: "ID",
      cell: (info) => <span className="font-bold text-gray-500">#{info.getValue() as number}</span>,
    },
    {
      accessorKey: "card_number",
      header: "Card Number",
      cell: (info) => <span className="font-mono text-indigo-600">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "merchant_name",
      header: "Merchant",
      cell: (info) => <span className="font-semibold text-gray-800">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "zone_name",
      header: "Zone",
      cell: (info) => <span className="text-gray-600">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (info) => (
        <span className="font-bold text-emerald-600">
          {Number(info.getValue()).toLocaleString()} SYP
        </span>
      ),
    },
    {
      accessorKey: "payment_method",
      header: "Method",
      cell: (info) => (
        <span className="capitalize text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date & Time",
      cell: ({ getValue }) => {
        const val = getValue();
        if (!val) return "-";
        const date = new Date(val as string);
        return <span className="text-gray-500 text-sm">{date.toLocaleString('en-GB')}</span>;
      },
    },
  ];

  return (
    <DataView
      viewType="table"
      queryKey="Transactions"
     
      dataKey="transactions"
      tableTitle="Transactions Management"
      addButtonLabel=""
      link=""
      queryFn={() => TransactionsAPI.list()}
      columns={getColumns()}
    />
  );
};