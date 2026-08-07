import { DataView } from "@/components/view/DataView";
import { Options } from "@/components/view/Options";
import { ColumnDef } from "@tanstack/react-table";
import { MerchantsAPI } from "./api";
export interface MerchantType {
    id: number;
    full_name: string;
    address: string;
    phone: string;
    email: string;
    created_at?: string;
}
export const Merchants = () => {

    const getColumns = (): ColumnDef<MerchantType>[] => [
        {
            accessorKey: "full_name",
            header: "Merchant Name",
            cell: info => <span className="font-bold text-blue-400">{info.getValue() as string}</span>
        },
        {
            accessorKey: "address",
            header: "Address",
            cell: info => <span className="text-gray-300">{info.getValue() as string || "-"}</span>
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: info => <span className="font-mono text-gray-300">{info.getValue() as string}</span>
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: info => <span className="text-gray-400">{info.getValue() as string}</span>
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
            queryKey="Merchants"
            dataKey="merchants"
            tableTitle="Merchants Management"
            addButtonLabel="Add New Merchant"
            link="/merchants/add"
            renderOptions={(row: any) => (
                <Options
                    type={['details']}
                    id={row.id}
                    queryKey={"MerchantsList"}
                    detailsRoute={`/merchat/${row.id}`}
                />
            )}
            queryFn={() => MerchantsAPI.list()}
            columns={getColumns()}
        />
    );
};