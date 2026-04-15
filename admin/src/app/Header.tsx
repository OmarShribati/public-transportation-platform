import { Menu, X } from "lucide-react";
import { Notification } from "./Notification";
import { Profile } from "./Profile";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  return (
    <header
      className="
    sticky top-0 z-50 w-full 
    bg-navBg
    border-none 
  "
    >
      <div className="flex items-center justify-between px-6 h-16">

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="
          p-2 rounded-xl 
          text-sidebar-text 
          hover:bg-navButton 
          hover:text-sidebar-hover 
          transition
        "
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Notification />

          <Profile />
        </div>
      </div>
    </header>

  );
};

export default Header;
