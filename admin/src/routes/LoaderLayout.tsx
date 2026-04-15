import { Outlet, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

const LoaderLayout = () => {
  const [isLoad, setLoad] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      const timer = setTimeout(() => setLoad(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setLoad(false);
    }
  }, [location]);

  if (isLoad && location.pathname === '/') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#010a08]">
        {/* Animations Styles */}
        <style>{`
          @keyframes draw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes fillIn {
            from { fill-opacity: 0; stroke-opacity: 1; }
            to { fill-opacity: 1; stroke-opacity: 0; }
          }
          @keyframes pop {
            to { transform: scale(1); }
          }
          
          .signal-path {
            stroke-dasharray: 300;
            stroke-dashoffset: 300;
            animation: draw 2s cubic-bezier(0.4, 0, 0.2, 1) forwards, 
                       fillIn 0.8s ease-in-out 1.8s forwards;
          }
          
          .signal-dot {
            transform-box: fill-box;
            transform-origin: center;
            transform: scale(0);
            animation: pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 2.2s forwards;
          }
        `}</style>

        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full animate-pulse"></div>
          
          <svg
            className="w-40 h-40 relative z-10"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 30 L50 15 L90 30 V45 L50 30 L10 45 V30 Z"
              className="signal-path stroke-emerald-500 fill-emerald-500"
              strokeWidth="1.5"
              fillOpacity="0"
            />

            <path
              d="M10 55 L50 40 L90 55 V70 L50 55 L10 70 V55 Z"
              className="signal-path stroke-emerald-400 fill-emerald-400"
              strokeWidth="1.5"
              fillOpacity="0"
              style={{ animationDelay: '0.3s, 2.1s' }}
            />

            <circle
              cx="50"
              cy="85"
              r="7"
              className="signal-dot fill-green-400 shadow-lg shadow-emerald-500/50"
            />
          </svg>
        </div>

        <span className="mt-8 text-emerald-500 font-black text-xs tracking-[0.5em] animate-pulse">
          INITIALIZING SYSTEM
        </span>
        
        <div className="mt-4 w-32 h-[2px] bg-emerald-900 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 animate-[loading_3s_ease-in-out]"></div>
        </div>
        
        <style>{`
          @keyframes loading {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
};

export default LoaderLayout;