// import { getUserData } from "@/routes/routes";
// import { LogOut } from "lucide-react";
// import { useEffect, useRef, useState } from 'react';
// import Lang from "./Lang";
// import { useTranslation } from "react-i18next";


// export const Profile = () => {
//     const [open, setOpen] = useState(false);
//     const dropdownRef = useRef<HTMLDivElement>(null);
//     const userData = getUserData();
//     const {t} = useTranslation()
//     useEffect(() => {
//         function handleClickOutside(event: MouseEvent) {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setOpen(false);
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [dropdownRef]);

//     const user = {
//         name: userData.name,
//         phone: userData.phone,
//         avatar: userData.avatar_url ?? "https://i.pravatar.cc/150?img=32",
//     };

//     return (
//         <div className="relative" ref={dropdownRef}>
//             <button
//                 onClick={() => setOpen((prev) => !prev)}
//                 className={`
//                     flex items-center gap-2 p-1 rounded-full 
//                     bg-transparent hover:bg-cyan-700/50 
//                     transition-all duration-300
//                     ${open ? 'ring-2 ring-cyan-500/50' : ''}
//                 `}
//             >
//                 <img
//                     src={user.avatar}
//                     className="w-10 h-10 rounded-full border-2 border-cyan-400/70 shadow-lg"
//                     alt={user.name}
//                 />
//             </button>

//             {open && (
//                 <div
//                     className={`
//                         absolute rtl:left-0 ltr:right-0 mt-3 w-64 rounded-xl p-4 
//                         bg-gray-900/90 backdrop-blur-md 
//                         border border-cyan-400/50 
//                         shadow-2xl shadow-cyan-500/30
//                         z-50
//                     `}
//                 >
//                     <div className="flex items-center gap-3 p-2">
//                         <img
//                             src={user.avatar}
//                             className="w-12 h-12 rounded-full border-2 border-cyan-400"
//                             alt={user.name}
//                         />

//                         <div className="leading-tight">
//                             <p className="text-white font-semibold text-lg">{user.name}</p>
//                             <p className="text-gray-400 text-sm">{user.phone}</p>
//                         </div>
//                     </div>

//                     <div className="border-t border-cyan-400/30 my-3"></div>


//                     <Lang />

//                     <div className="border-t border-cyan-400/30 my-3"></div>

//                     <button
//                         className="
//                             flex items-center justify-center gap-3 w-full px-3 py-2 rounded-lg
//                             text-red-500 hover:text-white 
//                             bg-red-900/20 hover:bg-red-600/70 
//                             transition duration-200 font-bold
//                             shadow-md shadow-red-500/20
//                         "
//                         onClick={() => {}}
//                     >
//                         <LogOut className="w-5" />
                    
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };


import React from 'react'

export const Profile = () => {
  return (
    <div>Profile</div>
  )
}
