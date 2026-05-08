import React, { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VehiclesAPI } from "./api";
import {
  Car, User, Activity, Calendar, MapPin, Navigation, Gauge, Route, AlertTriangle, Clock
} from 'lucide-react';
import GoogleMapDrawing from '@/components/shared/Map';

const Badge = ({ children, variant = "default" }: any) => {
  const styles = {
    default: "bg-white/5 text-gray-400 border-white/10",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    danger: "bg-red-500/10 text-red-500 border-red-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={`px-3 py-1 rounded-xl text-[10px] font-black border uppercase inline-flex items-center ${styles[variant as keyof typeof styles]}`}>
      {children}
    </span>
  );
};

export const Details = () => {
  const { id } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const [socketData, setSocketData] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => VehiclesAPI.details(id),
  });

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('access_token');
    const wsUrl = `ws://127.0.0.1:8000/ws/admin/vehicles/${id}/tracking/?token=${token}`;

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      console.log("📍 Live Update received:", payload);

      setSocketData(payload);
      queryClient.setQueryData(['vehicle', id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          vehicle: {
            ...oldData.vehicle,
            latest_location: payload
          }
        };
      });
    };

    socket.onclose = () => console.log("🔌 Socket Disconnected");
    socket.onerror = (err) => console.error("❌ Socket Error:", err);

    return () => socket.close();
  }, [id, queryClient]);

  if (isLoading) return <div className="p-10 text-center animate-pulse text-blue-500">Connecting to Fleet...</div>;
  if (!data?.vehicle) return <div className="p-10 text-center text-red-500">Vehicle Not Found.</div>;

  const vehicle = data.vehicle;
  const liveLocation = socketData || vehicle.latest_location;
  const activeTrip = vehicle.active_trip;

  return (
    <div className="min-h-screen bg-[#08090a] p-6 lg:p-12 text-white">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center border border-blue-500/30">
            <Car size={40} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter">
              {vehicle.vehicle_type} <span className="text-blue-500">#{vehicle.vehicle_number}</span>
            </h1>
            <div className="flex gap-3 mt-3">
              <Badge variant={vehicle.is_active ? "success" : "danger"}>
                {vehicle.is_active ? "Online" : "Offline"}
              </Badge>
              {liveLocation?.is_off_route && <Badge variant="danger">Off Route Alert</Badge>}
              <Badge variant="info">Live Tracking Active</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#111214] border border-white/5 rounded-[3rem] overflow-hidden h-[500px] shadow-2xl relative">
            <GoogleMapDrawing
              height="100%"
              value={liveLocation ? [{ lat: liveLocation.latitude, lng: liveLocation.longitude }] : []}
            />
            <div className="absolute bottom-6 left-6 bg-[#08090a]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Current Coordinates</p>
              <p className="text-xs font-mono text-emerald-500">
                {liveLocation?.latitude?.toFixed(6)}, {liveLocation?.longitude?.toFixed(6)}
              </p>
            </div>
          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={<Gauge size={20} />} label="Speed" value={`${liveLocation?.speed_kmh || 0} km/h`} />
            <MetricCard icon={<Navigation size={20} />} label="Heading" value={`${liveLocation?.heading || 0}°`} />
            <MetricCard icon={<Route size={20} />} label="Off Route" value={`${liveLocation?.distance_to_route_meters?.toFixed(0) || 0} m`} />
            <MetricCard icon={<Activity size={20} />} label="Status" value={liveLocation?.is_off_route ? "Warning" : "On Track"} />
          </div>
        </div>


        <div className="space-y-8">

          <div className="bg-[#111214] border border-white/5 p-8 rounded-[3rem]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="text-blue-500" size={20} /> Driver Information
            </h3>
            <div className="space-y-4">
              <InfoRow label="Full Name" value={vehicle.driver?.full_name} />
              <InfoRow label="Phone" value={vehicle.driver?.phone} />
              <InfoRow label="Trip Status" value={activeTrip ? "Currently on Trip" : "Idle"} className="text-emerald-500" />
            </div>
          </div>


          <div className="bg-[#111214] border border-white/5 p-8 rounded-[3rem]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-purple-500" size={20} /> Trip Assets
            </h3>
            <div className="space-y-4">
              <InfoRow label="Route" value={vehicle.route_name} />
              <InfoRow label="Vehicle ID" value={vehicle.vehicle_id} />
              <InfoRow label="Last Update" value={new Date(liveLocation?.recorded_at || Date.now()).toLocaleTimeString()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: any) => (
  <div className="bg-[#111214] border border-white/5 p-5 rounded-3xl text-center">
    <div className="text-gray-500 mb-2 flex justify-center">{icon}</div>
    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{label}</p>
    <p className="text-lg font-black text-white">{value}</p>
  </div>
);

const InfoRow = ({ label, value, className = "" }: any) => (
  <div className="border-b border-white/5 pb-3 last:border-0">
    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{label}</p>
    <p className={`text-sm font-bold ${className}`}>{value || "---"}</p>
  </div>
);