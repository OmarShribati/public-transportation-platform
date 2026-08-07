import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { Profile } from "./Profile";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  return (
    <header
      className={clsx(
        "fixed top-4 z-[90] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        sidebarOpen
          ? "right-4 left-[20rem]" 
          : "right-4 left-[7.5rem]" 
      )}
    >
      <div
        className={clsx(
          "mx-auto flex items-center justify-between px-6 h-20 rounded-[2rem]",
          "bg-[#0c0e10]/60 backdrop-blur-xl border border-emerald-500/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)]",
          "transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        )}
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="relative p-3 transition-all duration-300 border  group rounded-2xl bg-emerald-500/5 border-emerald-500/10 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 active:scale-90"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 transition-transform duration-500 group-hover:rotate-90" />
            ) : (
              <Menu className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
            )}

            {!sidebarOpen && (
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-20" />
            )}
          </button>

          <div className="flex-col hidden md:flex">
            <span className="text-[10px] text-emerald-700 font-black uppercase tracking-[0.2em]">System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-sm italic font-bold text-gray-100">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="h-8 w-[1px] bg-white/5 mx-2 hidden sm:block" />
          <div className="flex items-center gap-1 md:gap-3">
            <div className="w-10 h-10 md:h-auto md:w-auto">
              <Profile />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;