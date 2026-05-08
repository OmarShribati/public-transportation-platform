import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
    pageIndex: number;
    pageCount: number;
    setPageIndex: (page: number) => void;
    isLoading?: boolean;
    showInfo?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
    pageIndex,
    pageCount,
    setPageIndex,
    isLoading = false,
    showInfo = false,
}) => {
    const { t } = useTranslation();

    const prevPage = () => setPageIndex(Math.max(pageIndex - 1, 0));
    const nextPage = () => setPageIndex(Math.min(pageIndex + 1, pageCount - 1));

    const renderPages = () => {
        const pages: React.ReactNode[] = [];
        const windowSize = 2;

        const addPageButton = (page: number) => (
            <button
                key={page}
                onClick={() => setPageIndex(page)}
                disabled={isLoading}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-shadow ${
                    page === pageIndex
                        ? "bg-mainBg text-highlight shadow-lg"
                        : "bg-tableBg text-main hover:bg-mainBg hover:text-highlight"
                }`}
            >
                {page + 1}
            </button>
        );

        const addDots = (key: string) => (
            <span key={key} className="px-2 cursor-default select-none text-main">
                ...
            </span>
        );

        pages.push(addPageButton(0));

        if (pageIndex - windowSize > 1) pages.push(addDots("dots-start"));

        for (let i = Math.max(1, pageIndex - windowSize); i <= Math.min(pageCount - 2, pageIndex + windowSize); i++) {
            if (i !== 0 && i !== pageCount - 1) pages.push(addPageButton(i));
        }

        if (pageIndex + windowSize < pageCount - 2) pages.push(addDots("dots-end"));

        if (pageCount > 1) pages.push(addPageButton(pageCount - 1));

        return pages;
    };

    return (
        <div className="sticky left-0 right-0 flex items-center justify-between px-4 py-3 bg-mainBg shadow-inner">
            {showInfo && (
                <div className="text-sm text-main">
                    {t ? `${t("page")} ${pageIndex + 1} ${t("from")} ${pageCount}` : `Page ${pageIndex + 1} of ${pageCount}`}
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={prevPage}
                    disabled={pageIndex === 0 || isLoading}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-tableBg hover:bg-mainBg text-main hover:text-highlight disabled:opacity-50 transition-colors"
                >
                    <ArrowBigLeft className="w-5 h-5" />
                </button>

                {renderPages()}

                <button
                    onClick={nextPage}
                    disabled={pageIndex >= pageCount - 1 || isLoading}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-tableBg hover:bg-mainBg text-main hover:text-highlight disabled:opacity-50 transition-colors"
                >
                    <ArrowBigRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
