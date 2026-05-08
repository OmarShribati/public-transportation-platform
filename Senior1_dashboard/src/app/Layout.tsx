import { allPages } from '@/routes/pages';
import { Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import { Sidebar } from './Sidebar';
import clsx from 'clsx';

const Layout = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSpacingClass = () => {
    if (isMobile) return "px-4";
    if (isRTL) {
      return sidebarOpen ? "mr-72" : "mr-24";
    }
    return sidebarOpen ? "ml-72" : "ml-24";
  };

  return (
    <div className="relative min-h-screen bg-[#060708] selection:bg-emerald-500/30 font-sans">
      
      <Sidebar
        isOpen={sidebarOpen}
        pages={allPages}
        isRTL={isRTL}
        isMobile={isMobile}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={clsx(
          "flex flex-col min-h-screen transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          getSpacingClass()
        )}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 mt-28 px-6 pb-12">
          <div 
            className={clsx(
              "w-full transition-all duration-1000",
              "animate-in fade-in slide-in-from-bottom-4"
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-900/5 blur-[120px]" />
      </div>
    </div>
  );
};

export default Layout;