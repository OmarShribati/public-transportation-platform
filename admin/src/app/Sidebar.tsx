import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { ChevronDown, ChevronUp, Search } from "lucide-react"; // إضافة أيقونة البحث
import { useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.svg"
interface SidebarProps {
    isOpen: boolean;
    pages: (
        | { name: string; path: string; icon: React.ElementType }
        | { name: string; icon: React.ElementType; children: { name: string; path: string }[] }
    )[];
    isRTL: boolean;
    isMobile?: boolean;
    setSidebarOpen?: (open: boolean) => void;
}

export const Sidebar = ({
    isOpen,
    pages,
    isRTL,
    isMobile = false,
    setSidebarOpen,
}: SidebarProps) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { t } = useTranslation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    
    // حالة البحث
    const [searchTerm, setSearchTerm] = useState(''); 

    const toggleGroup = (name: string) => {
        setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    // دالة مساعدة لتصفية الروابط بناءً على البحث
    const filterRoutes = (routes: any[], term: string) => {
        if (!term) return routes;
        const lowerCaseTerm = term.toLowerCase();

        return routes.map(item => {
            const translatedName = t(item.name).toLowerCase();
            
            // تصفية المجموعة
            if (item.children) {
                const filteredChildren = item.children.filter((child: any) => 
                    t(child.name).toLowerCase().includes(lowerCaseTerm)
                );
                // إظهار المجموعة إذا كان اسمها يتطابق أو أحد أطفالها يتطابق
                if (translatedName.includes(lowerCaseTerm) || filteredChildren.length > 0) {
                    return { ...item, children: filteredChildren };
                }
                return null;
            }
            
            // تصفية الرابط الفردي
            if (translatedName.includes(lowerCaseTerm)) {
                return item;
            }
            return null;
        }).filter(Boolean); // إزالة القيم الفارغة (null)
    };

    const filteredRoutes = filterRoutes(pages, searchTerm);
    
    // دالة مساعدة لتحديد ما إذا كانت المجموعة الفرعية نشطة
    const isGroupActive = (item: any) => 
        item.children?.some((child: any) => currentPath.includes(child.path));

    return (
        <aside
            className={clsx(
                "h-screen shadow-2xl shadow-black/50 transition-transform duration-500 backdrop-blur-md border-r border-sidebar",
                "bg-sidebarBg flex flex-col justify-between overflow-hidden",
                isMobile ? "fixed top-0 bottom-0 z-900 w-64" : "fixed top-0 z-40",
                isRTL ? "right-0" : "left-0",
                isMobile
                    ? isOpen
                        ? "translate-x-0"
                        : isRTL
                        ? "translate-x-full"
                        : "-translate-x-full"
                    : isOpen
                        ? "w-64 translate-x-0"
                        : "w-16 translate-x-0"
            )}
            style={{ width: isMobile && isOpen ? "16rem" : isOpen ? "16rem" : "4rem" }}
        >
            <div className="flex-1 px-2 mt-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-highlight scrollbar-track-transparent">
                {/* 1. LOGO SECTION */}
                <div className={clsx("mb-4", isOpen ? "py-2" : "py-2 flex items-center justify-center")}>
                    <img 
                        src={logo} 
                        alt="Logo" 
                        className={clsx("transition-all duration-300", isOpen ? "w-[60%] mx-auto" : "w-10 h-10")} 
                    />
                </div>
                
                {/* 2. SEARCH INPUT */}
                {isOpen && (
                    <div className="relative mb-4 px-1">
                        <input
                            type="text"
                            placeholder={t("Search")} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // نمط الحقل الداكن والاحترافي
                            className="w-full py-2 rtl:pr-10 ltr:pl-10 text-sm bg-sidebarItemHover rounded-xl border border-sidebar text-main placeholder-sidebar-text focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition"
                        />
                        <Search className="absolute w-4 h-4 text-sidebar-text top-1/2 -translate-y-1/2 rtl:right-4 ltr:left-4" />
                    </div>
                )}
                
                {/* 3. NAVIGATION ITEMS */}
                <nav className="space-y-1">
                    {filteredRoutes.length === 0 && isOpen ? (
                        <p className="text-sidebar-text text-sm text-center py-4">{t("No results found")}</p>
                    ) : (
                        filteredRoutes.map((item: any) => {
                            const isGroup = !!item.children;
                            const active = currentPath === item.path;
                            const groupActive = isGroupActive(item); 
                            
                            // النمط المشترك للرابط/الزر
                            const baseClasses = clsx(
                                "group relative flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                // حالة النشاط للمجموعة أو الرابط الفردي
                                (active || groupActive)
                                    ? "sidebar-active-bg text-sidebar-active shadow-md"
                                    : "text-sidebar-text hover:bg-sidebarItemHover hover:text-sidebar-hover",
                                isGroup ? "justify-between w-full" : "w-full"
                            );

                            // === المجموعات الفرعية ===
                            if (isGroup) {
                                // فتح المجموعة إذا كانت نشطة أو تم البحث عنها
                                const isOpenGroup = openGroups[item.name] || groupActive || (searchTerm && item.children.length > 0); 

                                return (
                                    <div key={item.name} className="mb-1">
                                        <button
                                            onClick={() => {
                                                if (!isOpen && setSidebarOpen) {
                                                    setSidebarOpen(true);
                                                } else {
                                                    toggleGroup(item.name);
                                                }
                                            }}
                                            className={baseClasses}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={clsx("w-5 h-5 sidebar-icon transition-transform duration-300", active || groupActive ? "text-sidebar-active" : "text-sidebar-icon")} />
                                                {isOpen && <span>{t(item.name)}</span>}
                                            </div>
                                            {isOpen && (isOpenGroup ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}

                                            {/* Tooltip عند الطي */}
                                            {!isOpen && (
                                                <span className={clsx(
                                                    "absolute rtl:right-full ltr:left-full mx-3 z-10 p-2 text-xs text-sidebar-active bg-sidebarItemHover rounded-md shadow-lg opacity-0 transition-opacity duration-300 pointer-events-none",
                                                    "group-hover:opacity-100"
                                                )}>
                                                    {t(item.name)}
                                                </span>
                                            )}
                                        </button>

                                        {/* قائمة الروابط الفرعية */}
                                        <div
                                            className={clsx(
                                                "rtl:pr-5 ltr:pl-5 mt-1 space-y-1 overflow-hidden transition-all duration-500 ease-in-out",
                                                isOpen && isOpenGroup
                                                    ? "max-h-[500px] opacity-100"
                                                    : "max-h-0 opacity-0"
                                            )}
                                        >
                                            {item.children.map((child: any) => {
                                                const childActive = currentPath === child.path;
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        to={child.path}
                                                        onClick={() => {
                                                            if (isMobile && setSidebarOpen) setSidebarOpen(false);
                                                        }}
                                                        className={clsx(
                                                            "block p-2 rounded-lg text-sm transition duration-200",
                                                            childActive
                                                                ? "sidebar-active-bg text-sidebar-active shadow-md rounded-lg" // تم تغيير لون النص إلى active
                                                                : "text-sidebar-text hover:bg-sidebarItemHover"
                                                        )}
                                                    >
                                                        {t(child.name)}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            // === الروابط الفردية ===
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => {
                                        if (isMobile && setSidebarOpen) setSidebarOpen(false);
                                    }}
                                    className={baseClasses}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={clsx("w-5 h-5 transition-transform duration-300", active ? "text-sidebar-active" : "text-sidebar-icon group-hover:text-sidebar-icon-hover")} />
                                        {isOpen && <span className="whitespace-nowrap">{t(item.name)}</span>}
                                    </div>
                                    
                                    {/* Tooltip عند الطي */}
                                    {!isOpen && (
                                        <span className={clsx(
                                            "absolute rtl:right-full ltr:left-full mx-3 z-10 p-2 text-xs text-sidebar-active bg-sidebarItemHover rounded-md shadow-lg opacity-0 transition-opacity duration-300 pointer-events-none",
                                            "group-hover:opacity-100"
                                        )}>
                                            {t(item.name)}
                                        </span>
                                    )}
                                </Link>
                            );
                        })
                    )}
                </nav>
            </div>
            
            {/* Dark Mode Overlay/Backdrop for Mobile View */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[899]"
                    onClick={() => setSidebarOpen && setSidebarOpen(false)}
                ></div>
            )}
        </aside>
    );
};