export interface DriverType {
  driver_id: number;
  full_name: string;
  email: string;
  phone: string;
  approval_status: "pending" | "approved" | "rejected";
  account_status: "active" | "inactive" | "suspended";
}

export interface VehiclesType {
  vehicle_id: number;
  vehicle_number: string;
  vehicle_type: string;
  ownership: "driver" | "company";
  is_active: boolean;
  is_full: boolean;
  route_id: number | null;
  route_name: string | null;
  driver: DriverType;
  active_trip: any | null;
  latest_location: {
    latitude: number;
    longitude: number;
  } | null;
  created_at: string;
}
