export interface Waypoint {
    type: "start" | "stop" | "end";
    order: number;
    latitude: string;
    longitude: string;
    nearest_road_distance_meters: number;
    stop_id?: number; 
    name?: string;    
  }
  
  export interface RoutePath {
    provider: string;
    profile: string;
    distance_meters: number;
    duration_seconds: number;
    waypoints: Waypoint[];
  }
  
  export interface RouteType {
    route_id: number;
    route_name: string;
    start_latitude: string;
    start_longitude: string;
    end_latitude: string;
    end_longitude: string;
    price: string;
    path: RoutePath;
        zone_name?:string

  }