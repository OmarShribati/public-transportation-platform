import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  type ColumnDef,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Pagination } from "./Pagination";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../loader/Loader";

type Props<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  pageCount: number;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  link: string;
  showLinks: boolean;
  addButtonLabel: string;
  tableTitle: string;
  modal: React.ReactNode;
  hasPagination?: boolean;
  tableParams?: any;
  filters?: React.ReactNode;
  renderOptions?: (row: T) => React.ReactNode;
};

export default function Table<T>({
  data,
  columns,
  isLoading = false,
  pageCount,
  pagination,
  setPagination,
  link,
  addButtonLabel,
  tableTitle,
  modal,
  hasPagination = true,
  tableParams,
  filters,
  renderOptions,
}: Props<T>) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isHoveringOptions, setIsHoveringOptions] = useState(false);

  const [rowTop, setRowTop] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  const table = useReactTable({
    data,
    columns,
    pageCount: hasPagination ? pageCount : undefined,
    state: hasPagination ? { pagination } : {},
    onPaginationChange: hasPagination
      ? (updater) => {
        if (typeof updater === "function") {
          setPagination(
            (updater as (old: PaginationState) => PaginationState)(pagination)
          );
        } else {
          setPagination(updater);
        }
      }
      : undefined,
    manualPagination: hasPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    if (hoveredRow && containerRef.current && rowRefs.current[hoveredRow]) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const rowRect = rowRefs.current[hoveredRow]!.getBoundingClientRect();
      setRowTop(rowRect.top - containerRect.top);
    }
  }, [hoveredRow]);

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center h-scrren bg-mainBg/60 backdrop-blur-lg rounded-2xl">

          <Loader className="w-full flex justify-center flex-col items-center" />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-main">
          {t(tableTitle)}
        </h1>

        {modal ? (
          modal
        ) : (
          link && (
            <Link
              to={link}
              className="px-4 py-2 rounded-xl bg-transparent border border-highlight text-highlight 
                  hover:bg-addButton hover:text-sidebar-active transition-colors"
            >
              {t(addButtonLabel)}
            </Link>
          )
        )}
      </div>

      {tableParams && (
        <div className="mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-xl bg-transparent border border-highlight text-highlight hover:bg-highlight hover:text-sidebar-active transition"
          >
            {t("Show Filters")}
          </button>
        </div>
      )}

      {showFilters && (
        <div className="mb-4 p-4 rounded-xl border border-table bg-sidebarBg shadow-md">
          {filters ? filters : <p className="text-main">{t("No filters available")}</p>}
        </div>
      )}

      <div
        // استخدمنا فئات الخلفية والحدود المخصصة للـ Dark Mode
        className="relative overflow-hidden border border-sidebar rounded-2xl bg-tableBg shadow-2xl shadow-black/50"
        ref={containerRef}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-table">
            <thead
              // استخدمنا فئات رأس الجدول والنص المخصصة
              className="bg-tableHeader text-main text-xs uppercase"
            >
              {table.getHeaderGroups().map((headerGroup: any) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 ltr:text-left rtl:text-right font-semibold whitespace-nowrap"
                    >
                      {t(header.column.columnDef.header)}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-table">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-6 text-main"
                  >
                    {t("No Data To Show!")}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    ref={(el) => (rowRefs.current[row.id] = el)}
                    className="group relative hover:bg-sidebarItemHover transition-all pr-16"
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => {
                      if (!isHoveringOptions) setHoveredRow(null);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-sm text-main whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ROW OPTIONS / ACTIONS */}
        {renderOptions && hoveredRow && (
          <AnimatePresence>
            <motion.div
              key={hoveredRow}
              onMouseEnter={() => setIsHoveringOptions(true)}
              onMouseLeave={() => {
                setIsHoveringOptions(false);
                setHoveredRow(null);
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="absolute ltr:right-4 rtl:left-4 mt-1 flex z-20"
              style={{ top: rowTop }}
            >
              <div className="pointer-events-auto">
                {(() => {
                  const row = table.getRowModel().rows.find((r) => r.id === hoveredRow);
                  return row ? renderOptions(row.original) : null;
                })()}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* PAGINATION */}
        {hasPagination && (
          <Pagination
            pageIndex={table.getState().pagination.pageIndex}
            pageCount={table.getPageCount()}
            setPageIndex={(page) => table.setPageIndex(page)}
            isLoading={isLoading}
            showInfo
          />
        )}
      </div>
    </>
  );
}