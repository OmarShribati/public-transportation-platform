import { allPages } from '@/routes/pages';
import { Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import { Sidebar } from './Sidebar';

const Layout = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="relative">
      <div className="flex text-black navbar-sticky main-container bg-mainBg">
        <Sidebar
          isOpen={sidebarOpen}
          pages={allPages}
          isRTL={isRTL}
          isMobile={isMobile}
          setSidebarOpen={setSidebarOpen}
        />
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-30  bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`min-h-screen w-full transition-all duration-500 ${!isMobile && (isRTL ? (sidebarOpen ? "pr-64" : "pr-20") : (sidebarOpen ? "pl-64" : "pl-20"))}`}
        >
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="p-6 mx-6 text-main animate__fadeIn mt-8 animate__animated rounded-3xl bg-mainBg backdrop-blur-md border border-white/20 shadow-[10px_0px_20px_5px_rgba(255,255,255,0.1)]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
