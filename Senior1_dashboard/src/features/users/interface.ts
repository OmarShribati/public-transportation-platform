
export interface VehicleType {
    id: number;
    vehicle_type: string;
    vehicle_number: string;
    ownership: "driver" | "company"; 
    is_active: boolean;
    route_id: number | null;
  }
  
  interface BaseUser {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    account_status: "active" | "inactive" | "suspended";
    created_at: string;
  }
  
  
  export interface PassengerType extends BaseUser {
    account_type: "passenger";
  }
  
  
  export interface DriverType extends BaseUser {
    account_type: "driver";
    approval_status: "pending" | "approved" | "rejected";
    deactivation_requested: boolean;
    deactivation_request_status: "none" | "pending" | "completed";
    vehicle_id: number;
    vehicle: VehicleType;
  }
  
  
  export interface UsersResponse {
    passengers: PassengerType[];
    drivers: DriverType[];
  }
  
  
  export type UserType = PassengerType | DriverType;