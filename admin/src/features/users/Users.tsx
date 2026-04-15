import { DataView } from "@/components/view/DataView";
import { Options } from "@/components/view/Options";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
// import { Edit } from "./Edit";
import { UserAPI } from "./api";
// import type { UserType } from "./interface";

export const Users = () => {
    const { t } = useTranslation();

    const getColumns = (): ColumnDef<any>[] => [
        {
            accessorKey: "avatar_url",
            header: "User",
            cell: ({ row }) => {
                const data = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <img
                            src={data.avatar_url || "/default-avatar.png"}
                            alt={data.name}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                        />

                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{data.name}</span>
                            <span className="text-sm text-gray-500">{data.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "phone",
            header: "Phone Number",
            cell: info => info.getValue(),
        },
        {
            accessorKey: "account_type",
            header: "Account Type",
            cell: info => {
                const value = info.getValue() as any["account_type"];
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-white text-sm font-medium
              ${value === "employee" ? "bg-blue-600" : "bg-green-600"}
            `}
                    >
                        {t(value)}
                    </span>
                );
            },
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: info => (
                <span className="text-gray-700">{info.getValue() as string}</span>
            ),
        },
    ];

    return (
        <>
            <DataView<any>
                viewType="table"
                queryKey="UserList"
                queryFn={(page ) => UserAPI.list(page)}
                columns={getColumns()}
                tableTitle="Users List"
            />
        </>
    );
};
