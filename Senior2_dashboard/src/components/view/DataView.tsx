import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import Table from "./Table";
import { Link } from "@tanstack/react-router";
import { t } from "i18next";
import { Plus } from "lucide-react";
import Loader from "../loader/Loader";

type ViewType = "table" | "card";

type DataViewProps<T> = {
  viewType: ViewType;
  columns?: ColumnDef<T>[];
  queryFn: (queryParams?: any) => Promise<any>;
  queryKey: string;
  link?: string;
  addButtonLabel?: string;
  tableTitle?: string;
  renderOptions?: (row: T) => React.ReactNode;
  renderCard?: (item: T, index: number) => React.ReactNode;
  className?: string;
  queryParams?: any;
  dataKey?: string;
};

export const DataView = <T,>({
  viewType,
  columns,
  queryFn,
  queryKey,
  link = "",
  addButtonLabel = "",
  tableTitle = "",
  renderCard,
  className,
  queryParams = {},
  renderOptions,
  dataKey,
}: DataViewProps<T>) => {

  const query = useQuery({
    queryKey: [queryKey, queryParams],
    queryFn: () => queryFn(queryParams),
  });

  const data = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;

    if (dataKey && query.data[dataKey]) {
      return query.data[dataKey];
    }

    const firstKey = Object.keys(query.data)[0];
    if (firstKey && Array.isArray(query.data[firstKey])) {
      return query.data[firstKey];
    }

    return [];
  }, [query.data, dataKey]);

  if (query.isLoading) {
    return <Loader className="w-full flex justify-center items-center" />;
  }

  if (viewType === "card") {
    return (
      <>
        {tableTitle && (
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold">{t(tableTitle)}</h1>

            {link && (
              <Link
                to={link}
                className="flex items-center gap-2 px-4 py-2 border rounded-xl"
              >
                <Plus size={18} /> {t(addButtonLabel)}
              </Link>
            )}
          </div>
        )}

        {data.length === 0 && (
          <div className="text-center p-4">
            {t("no data to show!")}
          </div>
        )}

        <div className={className || "grid grid-cols-3 gap-4"}>
          {data.map((item: any, index: number) =>
            renderCard ? (
              <div key={item.id || item.stop_id || index}>
                {renderCard(item, index)}
              </div>
            ) : null
          )}
        </div>
      </>
    );
  }

  return columns ? (
    <Table<T>
      data={data}
      columns={columns}
      isLoading={query.isLoading}
      link={link}
      addButtonLabel={addButtonLabel}
      tableTitle={tableTitle}
      renderOptions={renderOptions}
    />
  ) : null;
};