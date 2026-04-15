import { AlertTriangle, Bell, CheckCircle, Info, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
const dummyNotifications = [
    { id: 1, type: 'info', message: 'تم تحديث نظام الفوترة بنجاح.', time: 'منذ 5 دقائق' },
    { id: 2, type: 'warning', message: 'مفتاح API الخاص بالتكامل على وشك الانتهاء.', time: 'منذ ساعة' },
    { id: 3, type: 'success', message: 'تم إتمام عملية الدفع الأخيرة.', time: 'منذ يوم' },
    { id: 4, type: 'info', message: 'رسالة ترحيب جديدة من الدعم الفني.', time: 'منذ يومين' },
];

const getTypeStyles = (type: string) => {
    switch (type) {
        case 'success':
            return { icon: <CheckCircle className="w-5 h-5 text-green-400" />, color: 'text-green-400' };
        case 'warning':
            return { icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' };
        case 'info':
        default:
            return { icon: <Info className="w-5 h-5 text-cyan-400" />, color: 'text-cyan-400' };
    }
};

export const Notification = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const NEON_HOVER_CLASS = "hover:shadow-[0_0_10px_rgba(0,255,255,0.5)]";

    const DROPDOWN_STYLE = `
    absolute top-full ltr:right-0 rtl:left-0 mt-3 w-80 
    bg-gray-900/90 backdrop-blur-md 
    rounded-lg border border-cyan-400/50 
    shadow-2xl shadow-cyan-500/30 z-50
  `;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          relative p-2 rounded-xl text-white 
          bg-transparent hover:bg-cyan-700/50 
          transition duration-300 ${NEON_HOVER_CLASS}
        `}
                aria-expanded={isOpen}
            >
                <Bell className="w-6 h-6" />
                {dummyNotifications.length > 0 && (
                    <>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </>
                )}
            </button>

            {isOpen && (
                <div className={DROPDOWN_STYLE}>


                    <div className="flex justify-between items-center p-4 border-b border-cyan-500/30">
                        <h3 className="text-lg font-semibold text-cyan-400">الإشعارات</h3>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-cyan-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>


                    <div className="max-h-80 overflow-y-auto">
                        {dummyNotifications.length > 0 ? (
                            dummyNotifications.map((notif) => {
                                const { icon, color } = getTypeStyles(notif.type);
                                return (
                                    <div
                                        key={notif.id}
                                        className="flex items-start gap-3 p-4 hover:bg-cyan-900/50 border-b border-gray-700/50 transition duration-200"
                                    >
                                        <div className={color}>{icon}</div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="p-4 text-center text-gray-400">لا توجد إشعارات جديدة.</p>
                        )}
                    </div>

                    {/* تذييل القائمة */}
                    {dummyNotifications.length > 0 && (
                        <div className="p-3 text-center border-t border-cyan-500/30">
                            <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
                                مشاهدة كل الإشعارات
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};