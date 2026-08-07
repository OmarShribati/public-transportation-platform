import {
  Bell,
  LayoutDashboard,
  Users,
  MapPin,
  Route,
  Truck,
  Layers,
  Store,
  Receipt,
  MessageSquareWarning,
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
    name: "Zone",
    path: "/zone",
    icon: Layers
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
    name: "Merchants",
    path: "/merchants",
    icon: Store
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: Receipt
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