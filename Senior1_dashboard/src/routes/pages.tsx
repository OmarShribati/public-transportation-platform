import {
  Bell,
  LayoutDashboard,
  MapPin,
  MessageSquareWarning,
  Route,
  Truck,
  Users
} from "lucide-react";

export const allPages = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Users",
    path: "/users",
    icon: Users
  },
  {
    name: "Stops",
    path: "/stops",
    icon: MapPin
  },
  {
    name: "Routes",
    path: "/routes",
    icon: Route
  },
  {
    name: "Vehicles",
    path: "/vehicles",
    icon: Truck
  },
  {
    name: "Complaints",
    path: "/complaints",
    icon: MessageSquareWarning
  },
  {
    name: "Notification",
    path: "/send/notification",
    icon: Bell
  },

];