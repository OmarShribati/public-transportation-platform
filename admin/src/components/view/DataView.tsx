import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Table from "./Table";
import { Link } from "@tanstack/react-router";
import { t } from "i18next";
import { Pagination } from "./Pagination";
import { Loader2, Plus } from "lucide-react";
import Loader from "../loader/Loader";


type ViewType = "table" | "card";
type PaginationType = "numbered" | "scrolling" | "none";

type ApiResponse<T> = {
  items: T[];
  total: number;
};

type DataViewProps<T> = {
  viewType: ViewType;
  columns?: ColumnDef<T>[];
  queryFn: (
    page: number,
    perPage: number,
    queryParams?: any
  ) => Promise<ApiResponse<T>>;
  queryKey: string;
  onSuccess?: any;
  link?: string;
  showLinks?: boolean;
  addButtonLabel?: string;
  tableTitle?: string;
  renderOptions?: (row: T) => React.ReactNode;
  modal?: React.ReactNode;
  paginationType?: PaginationType;
  renderCard?: (item: T, index: number) => React.ReactNode;
  className?: string;
  queryParams?: any;
  tableParams?: any;
};


function normalizeObject<T extends Record<string, any>>(obj: T): Record<string, any> | null {
  const normalized = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value ?? null])
  );
  return Object.values(normalized).every((v) => v === null) ? null : normalized;
}

export const DataView = <T,>({
  viewType,
  columns,
  queryFn,
  queryKey,
  link = "",
  showLinks = true,
  addButtonLabel = "",
  tableTitle = "",
  modal,
  paginationType = "numbered",
  renderCard,
  className,
  queryParams = {},
  tableParams,
  renderOptions
}: DataViewProps<T>) => {

  const hasPagination = paginationType !== "none";
  const isScrollingPagination = paginationType === "scrolling";

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,

    pageSize: isScrollingPagination ? 14 : 14,
  });

  const [dataItems, setDataItems] = useState<T[]>([]);

  const normalizedParams = useMemo(() => normalizeObject(queryParams || {}), [queryParams]);


  useEffect(() => {
    setPagination((old) => ({ ...old, pageIndex: 0 }));
    if (isScrollingPagination) {
      setDataItems([]);
    }
  }, [normalizedParams, isScrollingPagination]);


  const query = useQuery<ApiResponse<T>, Error>({
    queryKey: hasPagination
      ? [queryKey, pagination.pageIndex, pagination.pageSize, normalizedParams]
      : [queryKey, normalizedParams],
    queryFn: () =>
      queryFn(pagination.pageIndex + 1, pagination.pageSize, normalizedParams || undefined),

    staleTime: 5000,
  });


  useEffect(() => {
    if (query.data && isScrollingPagination && query.data.items) {
      setDataItems(prevItems => {

        if (pagination.pageIndex === 0) {
          return query.data.items;
        }


        if (pagination.pageIndex > 0) {
          const newItems = query.data.items.filter(
            (newItem: any) => !prevItems.some((prevItem: any) => prevItem.id === newItem.id)
          );
          return [...prevItems, ...newItems];
        }

        return prevItems;
      });
    }
  }, [query.data, isScrollingPagination, pagination.pageIndex]);

  const pageCount = hasPagination
    ? Math.ceil((query.data?.total ?? 0) / pagination.pageSize)
    : 1;


  const resolvedItems = useMemo(() => {
    if (isScrollingPagination) {
      return dataItems;
    }

    if (!query.data) return [];
    if ("items" in query.data) {
      if (Array.isArray(query.data.items)) return query.data.items;
      return [query.data.items];
    }
    if (typeof query.data === "object" && query.data !== null) {
      return [query.data];
    }
    return [];
  }, [query.data, isScrollingPagination, dataItems]);


  const fetchNextPage = useCallback(() => {


    if (pagination.pageIndex >= pageCount - 1) {
      return;
    }


    if (query.isFetching) {
      return;
    }




    if (pagination.pageIndex === 0 && resolvedItems.length < pagination.pageSize && resolvedItems.length !== (query.data?.total ?? 0)) {

      return;
    }


    setPagination((old) => ({ ...old, pageIndex: old.pageIndex + 1 }));

  }, [query.isFetching, pagination.pageIndex, pageCount, resolvedItems.length, pagination.pageSize, query.data?.total]);


  const observerTarget = useRef<HTMLDivElement>(null);



  const lastFetchTime = useRef(0);

  useEffect(() => {
    if (!isScrollingPagination) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {


          if (Date.now() - lastFetchTime.current > 500) {
            fetchNextPage();
            lastFetchTime.current = Date.now();
          }
        }
      },

      { root: null, rootMargin: '0px 0px 50px 0px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isScrollingPagination, fetchNextPage]);

 


  if (viewType === "card") {

    const showLoader = query.isLoading && (isScrollingPagination ? resolvedItems.length === 0 : true);

    return (
      <>
        {(query.isLoading && !isScrollingPagination) && (
          <Loader className="w-full flex justify-center flex-col items-center" />

        )}
        {tableTitle && (
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-extrabold text-textMain">{t(tableTitle)}</h1>
            {modal ? (
              modal
            ) : (
              link && (
                <Link
                  to={link}
                  className="flex items-center gap-2 px-4 py-2 text-sm transition bg-transparent border shadow-lg rounded-xl border-textHighlight text-textHighlight hover:bg-textHighlight hover:text-white font-semibold"
                >
                  <Plus size={18} /> {t(addButtonLabel)}
                </Link>
              )
            )}
          </div>
        )}
        {tableParams}

        {/* رسالة عدم وجود بيانات */}
        {resolvedItems.length === 0 && !query.isLoading && (
          <div className="relative mt-2 overflow-x-auto text-center text-textMain p-4 rounded-2xl bg-tableBg border border-border drop-shadow-md">
            {t("no data to show!")}
          </div>
        )}

        {/* عرض البطاقات */}
        <div className={`${className || "grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5"}`}>
          {resolvedItems.length > 0 &&
            resolvedItems.map((item: any, index: number) =>
              renderCard ? (
                <div key={item.id || index}>{renderCard(item, index)}</div>
              ) : null
            )}
        </div>

        {/* ⭐️ ترحيل Scrolling (للـ Card View) */}
        {isScrollingPagination && pagination.pageIndex < pageCount - 1 && (
          <div ref={observerTarget} className="flex justify-center p-4 mt-4">
            <Loader2 className="animate-spin text-highlight" size={24} />
            <span className="ml-2 text-textMain">{t('Loading more')}...</span>
          </div>
        )}

        {/* مؤشر تحميل أساسي للصفحة الأولى */}
        {showLoader && (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-highlight" size={32} />
          </div>
        )}

        {/* رسالة "لا مزيد من النتائج" بعد التمرير */}
        {isScrollingPagination && resolvedItems.length > 0 && pagination.pageIndex >= pageCount - 1 && !query.isFetching && (
          <div className="flex justify-center p-4 mt-4 text-gray-500">
            {t('End of results')}
          </div>
        )}

        {/* ⭐️ ترحيل مرقم (للـ Card View) */}
        {paginationType === "numbered" && (
          <Pagination
            pageIndex={pagination.pageIndex}
            pageCount={pageCount}
            setPageIndex={(page) => setPagination((old) => ({ ...old, pageIndex: page }))}
            isLoading={query.isLoading}
            showInfo
          />
        )}
      </>
    );
  }





  return columns ? (
    <Table<T>
      data={query.data?.items ?? []}
      columns={columns}
      renderOptions={renderOptions}
      isLoading={query.isLoading}
      pageCount={pageCount}
      pagination={pagination}
      setPagination={setPagination}
      link={link}
      tableParams={tableParams}
      showLinks={showLinks}
      addButtonLabel={addButtonLabel}
      tableTitle={tableTitle}
      modal={modal}
      hasPagination={hasPagination}
    />
  ) : null;
};