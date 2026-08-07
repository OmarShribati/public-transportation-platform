import clsx from 'clsx';
import {
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
  User
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-3 p-1.5 pr-4 rounded-2xl transition-all duration-300 outline-none group",
          isOpen ? "bg-emerald-500/10 border-emerald-500/20" : "hover:bg-emerald-500/5 border-transparent"
        )}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            AD
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0c0e10] rounded-full" />
        </div>

        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-gray-100 leading-none mb-1 group-hover:text-emerald-400 transition-colors">
            Adnan Alahsram
          </span>
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
            Admin
          </span>
        </div>

        <ChevronDown
          size={14}
          className={clsx(
            "text-gray-500 transition-transform duration-500",
            isOpen && "rotate-180 text-emerald-500"
          )}
        />
      </button>

      <div
        className={clsx(
          "absolute top-[calc(100%+12px)] rtl:left-0 ltr:right-0 z-[100] min-w-[240px]",
          "bg-[#0c0e10]/90 backdrop-blur-2xl border border-emerald-500/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)]",
          "transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="p-5 border-b border-white/5 bg-emerald-500/[0.02] rounded-t-[2rem]">
          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-1">Active Session</p>
          <p className="text-sm font-bold text-emerald-50 truncate">omar.shribati@tech.sy</p>
        </div>

        <div className="p-2 space-y-1">
          <button className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/5 transition-all">
            <User size={18} className="text-gray-600 group-hover:text-emerald-500 transition-colors" />
            <span className="text-sm font-semibold text-gray-400 group-hover:text-gray-100">Profile Details</span>
          </button>

          <button className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/5 transition-all">
            <Settings size={18} className="text-gray-600 group-hover:text-emerald-500 transition-colors" />
            <span className="text-sm font-semibold text-gray-400 group-hover:text-gray-100">Preferences</span>
          </button>

          <button className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/5 transition-all">
            <ShieldCheck size={18} className="text-gray-600 group-hover:text-emerald-500 transition-colors" />
            <span className="text-sm font-semibold text-gray-400 group-hover:text-gray-100">Security</span>
          </button>
        </div>

        <div className="p-2 border-t border-white/5 mt-1">
          <button className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 transition-all text-rose-500">
            <div className="p-1.5 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
              <LogOut size={16} />
            </div>
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};