import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../loader/Loader";

type Props<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  link: string;
  addButtonLabel: string;
  tableTitle: string;
  renderOptions?: (row: T) => React.ReactNode;
};

export default function Table<T>({
  data,
  columns,
  isLoading = false,
  link,
  addButtonLabel,
  tableTitle,
  renderOptions,
}: Props<T>) {
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any, index) => row.id?.toString() || row.stop_id?.toString() || `${index}`,
  });

  console.log("data", data);

  return (
    <div className="w-full p-4 lg:p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{t(tableTitle)}</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and control data with ease
          </p>
        </div>

        {link && (
          <Link
            to={link}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#00A46E] text-white font-bold hover:bg-[#00D492] shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
          >
            <span className="text-xl">+</span> {t(addButtonLabel)}
          </Link>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative rounded-[2rem] border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        <table className="min-w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-white/[0.02]">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-8 py-6 text-left text-gray-500 text-xs uppercase tracking-widest font-black">
                    {t(header.column.columnDef.header as string)}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="relative">
            <AnimatePresence>
              {data.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/[0.03]"
                >
                  <td
                    colSpan={table.getAllColumns().length + (renderOptions ? 1 : 0)}
                    className="px-8 py-20 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-gray-500 font-medium text-lg">No data available</span>
                      <p className="text-gray-600 text-sm">There are no data to display at the moment.</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                data.map((item, index) => {
                  const row = table.getRowModel().rows[index];
                  const isHovered = hoveredRow === row.id;

                  return (
                    <motion.tr
                      key={row.id}
                      onMouseEnter={() => setHoveredRow(row.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-8 py-5 text-gray-300 font-medium">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}

                      {renderOptions && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 overflow-hidden pointer-events-none">
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ x: "100%", opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "100%", opacity: 0 }}
                                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                className="pointer-events-auto flex items-center bg-[#111]/90 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-2xl"
                              >
                                {renderOptions(row.original)}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>

        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}