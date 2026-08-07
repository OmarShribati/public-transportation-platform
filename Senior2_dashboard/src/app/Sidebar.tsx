import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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

export const Sidebar = ({ isOpen, pages, isRTL, isMobile = false, setSidebarOpen }: SidebarProps) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { t } = useTranslation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const toggleGroup = (name: string) => {
        setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const filterRoutes = (routes: any[], term: string) => {
        if (!term) return routes;
        const lowerCaseTerm = term.toLowerCase();
        return routes.map(item => {
            const translatedName = t(item.name).toLowerCase();
            if (item.children) {
                const filteredChildren = item.children.filter((child: any) => t(child.name).toLowerCase().includes(lowerCaseTerm));
                if (translatedName.includes(lowerCaseTerm) || filteredChildren.length > 0) return { ...item, children: filteredChildren };
                return null;
            }
            return translatedName.includes(lowerCaseTerm) ? item : null;
        }).filter(Boolean);
    };

    const filteredRoutes = filterRoutes(pages, searchTerm);
    const isGroupActive = (item: any) => item.children?.some((child: any) => currentPath.includes(child.path));

    return (
        <>
            <aside
                className={clsx(
                    "fixed top-4 bottom-4 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-[100]",
                    "bg-[#0c0e10]/80 backdrop-blur-xl border border-emerald-500/10 shadow-[20px_0_50px_rgba(0,0,0,0.8)]",
                    "flex flex-col overflow-hidden rounded-[2.5rem]",
                    isRTL ? "right-4" : "left-4",
                    isOpen ? "w-72" : "w-24",
                    isMobile && !isOpen && (isRTL ? "translate-x-[150%]" : "-translate-x-[150%]")
                )}
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

                <div className="relative flex-1 px-4 mt-8 overflow-y-auto overflow-x-hidden no-scrollbar">

                    <div className={clsx("mb-8 transition-all duration-500", isOpen ? "opacity-100" : "opacity-0 invisible h-0")}>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder={t("Search Systems...")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-3 pr-4 pl-12 text-xs bg-white/5 rounded-2xl border border-white/5 text-emerald-50 placeholder-emerald-900/50 focus:outline-none focus:border-emerald-500/30 focus:bg-emerald-500/5 transition-all"
                            />
                            <Search className="absolute w-4 h-4 text-emerald-700 group-focus-within:text-emerald-400 top-1/2 -translate-y-1/2 left-4 transition-colors" />
                        </div>
                    </div>

                    <nav className="space-y-3">
                        {filteredRoutes.map((item: any) => {
                            const isGroup = !!item.children;
                            const active = currentPath === item.path;
                            const groupActive = isGroupActive(item);
                            const isOpenGroup = openGroups[item.name] || groupActive || (searchTerm && isGroup);

                            const baseClasses = clsx(
                                "group relative flex items-center gap-4 p-4 rounded-[1.5rem] text-sm font-semibold transition-all duration-500",
                                (active || groupActive)
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                    : "text-gray-500 hover:bg-white/5 hover:text-emerald-300"
                            );

                            return (
                                <div key={item.name} className="relative">
                                    {(active || groupActive) && (
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,1)] z-20" />
                                    )}

                                    {isGroup ? (
                                        <>
                                            <button onClick={() => isOpen ? toggleGroup(item.name) : setSidebarOpen?.(true)} className={clsx(baseClasses, "w-full justify-between")}>
                                                <div className="flex items-center gap-4">
                                                    <item.icon className={clsx("w-6 h-6 transition-transform duration-500", (active || groupActive) ? "text-emerald-400" : "group-hover:rotate-12")} />
                                                    {isOpen && <span className="tracking-tight">{t(item.name)}</span>}
                                                </div>
                                                {isOpen && (isOpenGroup ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />)}
                                            </button>

                                            <div className={clsx(
                                                "overflow-hidden transition-all duration-700 ease-in-out",
                                                isOpen && isOpenGroup ? "max-h-96 opacity-100 mt-2 ml-6 border-l border-emerald-500/10" : "max-h-0 opacity-0"
                                            )}>
                                                {item.children.map((child: any) => (
                                                    <Link key={child.name} to={child.path} className={clsx(
                                                        "block p-3 pl-6 text-xs transition-all duration-300 rounded-xl mb-1",
                                                        currentPath === child.path ? "text-emerald-400 bg-emerald-500/5 font-bold" : "text-gray-500 hover:text-emerald-200"
                                                    )}>
                                                        {t(child.name)}
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <Link to={item.path} className={baseClasses}>
                                            <item.icon className={clsx("w-6 h-6 transition-all duration-500", active ? "text-emerald-400 scale-110" : "group-hover:scale-110 group-hover:text-emerald-400")} />
                                            {isOpen && <span className="tracking-tight">{t(item.name)}</span>}
                                            {!isOpen && (
                                                <div className="absolute left-20 bg-[#0c0e10] border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                                                    {t(item.name)}
                                                </div>
                                            )}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 mt-auto">
                    <div className={clsx(
                        "bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] transition-all duration-500 flex items-center",
                        isOpen ? "p-4 gap-4" : "p-3 justify-center"
                    )}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            PTP
                        </div>
                        {isOpen && (
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-emerald-50 tracking-tighter">PTP</span>
                                <span className="text-[10px] text-emerald-700 font-bold uppercase">Transportaion Platform</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {isMobile && isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={() => setSidebarOpen?.(false)} />
            )}
        </>
    );
};