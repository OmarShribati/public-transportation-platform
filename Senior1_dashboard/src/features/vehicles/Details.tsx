import React, { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VehiclesAPI } from "./api";
import toast from 'react-hot-toast';
import {
  Car, User, Activity, MapPin, Navigation, Gauge, Route, AlertTriangle, Clock, Cpu, CheckCircle2
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
  const queryClient:any = useQueryClient();
  const [socketData, setSocketData] = useState<any>(null);

  const [deviceCode, setDeviceCode] = useState("");
  const [isSubmittingDevice, setIsSubmittingDevice] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => VehiclesAPI.details(id),
  });

  const vehicle = data?.vehicle;

  const existingDeviceCode = vehicle?.device_code || vehicle?.device?.device_code || vehicle?.scanner_device?.device_code;
  const hasDevice = Boolean(existingDeviceCode);

  useEffect(() => {
    if (existingDeviceCode) {
      setDeviceCode(existingDeviceCode);
    }
  }, [existingDeviceCode]);

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
            latest_location: payload?.location
          }
        };
      });
    };

    socket.onclose = () => console.log("🔌 Socket Disconnected");
    socket.onerror = (err) => console.error("❌ Socket Error:", err);

    return () => socket.close();
  }, [id, queryClient]);

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceCode.trim()) {
      toast.error('الرجاء إدخال كود الجهاز');
      return;
    }

    try {
      setIsSubmittingDevice(true);
      
      await VehiclesAPI.createDevice({
        device_code: deviceCode,
        vehicle_id: Number(id)
      });

      toast.success('تم ربط الجهاز بنجاح');
      queryClient.invalidateQueries(['vehicle', id]);
      
    } catch (error: any) {
      console.error("Device Creation Error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء إضافة الجهاز';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingDevice(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-blue-500 animate-pulse">Connecting to Fleet...</div>;
  if (!vehicle) return <div className="p-10 text-center text-red-500">Vehicle Not Found.</div>;

  const liveLocation = socketData || vehicle.latest_location;
  const activeTrip = vehicle.active_trip;

  return (
    <div className="min-h-screen bg-[#08090a] p-6 lg:p-12 text-white">

      <div className="flex flex-col items-start justify-between gap-6 mb-10 md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-20 h-20 border bg-blue-600/20 rounded-3xl border-blue-500/30">
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        <div className="space-y-8 lg:col-span-2">
          <div className="bg-[#111214] border border-white/5 rounded-[3rem] overflow-hidden h-[500px] shadow-2xl relative">
            <GoogleMapDrawing
              height="100%"
              value={liveLocation ? [{ lat: liveLocation.latitude, lng: liveLocation.longitude }] : []}
            />
            <div className="absolute bottom-6 left-6 bg-[#08090a]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Current Coordinates</p>
              <p className="font-mono text-xs text-emerald-500">
                {liveLocation?.latitude?.toFixed(6)}, {liveLocation?.longitude?.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricCard icon={<Gauge size={20} />} label="Speed" value={`${liveLocation?.speed_kmh || 0} km/h`} />
            <MetricCard icon={<Navigation size={20} />} label="Heading" value={`${liveLocation?.heading || 0}°`} />
            <MetricCard icon={<Route size={20} />} label="Off Route" value={`${liveLocation?.distance_to_route_meters?.toFixed(0) || 0} m`} />
            <MetricCard icon={<Activity size={20} />} label="Status" value={liveLocation?.is_off_route ? "Warning" : "On Track"} />
          </div>
        </div>

        <div className="space-y-8">

          <div className="bg-[#111214] border border-white/5 p-8 rounded-[3rem]">
            <h3 className="flex items-center gap-2 mb-6 text-xl font-bold">
              <User className="text-blue-500" size={20} /> Driver Information
            </h3>
            <div className="space-y-4">
              <InfoRow label="Full Name" value={vehicle.driver?.full_name} />
              <InfoRow label="Phone" value={vehicle.driver?.phone} />
              <InfoRow label="Trip Status" value={activeTrip ? "Currently on Trip" : "Idle"} className="text-emerald-500" />
            </div>
          </div>

          <div className="bg-[#111214] border border-white/5 p-8 rounded-[3rem]">
            <h3 className="flex items-center gap-2 mb-6 text-xl font-bold">
              <MapPin className="text-purple-500" size={20} /> Trip Assets
            </h3>
            <div className="space-y-4">
              <InfoRow label="Route" value={vehicle.route_name} />
              <InfoRow label="Vehicle ID" value={vehicle.vehicle_id} />
              <InfoRow label="Last Update" value={new Date(liveLocation?.recorded_at || Date.now()).toLocaleTimeString()} />
            </div>
          </div>

          {/* قسم الجهاز (عرض فقط إذا كان موجوداً، أو إدخال إذا لم يكن موجوداً) */}
          <div className="bg-[#111214] border border-white/5 p-8 rounded-[3rem]">
            <h3 className="flex items-center gap-2 mb-6 text-xl font-bold">
              <Cpu className={hasDevice ? "text-emerald-500" : "text-blue-500"} size={20} /> 
              {hasDevice ? "Linked Device" : "Link Device"}
            </h3>
            
            <form onSubmit={handleCreateDevice} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Device Code</label>
                  {hasDevice && (
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Connected
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value)}
                  placeholder="e.g. BUS-SCANNER-001"
                  disabled={hasDevice || isSubmittingDevice}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* إخفاء زر الإنشاء بالكامل في حال كان الجهاز مربوطاً */}
              {!hasDevice && (
                <button
                  type="submit"
                  disabled={isSubmittingDevice}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm flex justify-center items-center gap-2"
                >
                  {isSubmittingDevice ? 'Linking...' : 'Link Device'}
                </button>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: any) => (
  <div className="bg-[#111214] border border-white/5 p-5 rounded-3xl text-center">
    <div className="flex justify-center mb-2 text-gray-500">{icon}</div>
    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{label}</p>
    <p className="text-lg font-black text-white">{value}</p>
  </div>
);

const InfoRow = ({ label, value, className = "" }: any) => (
  <div className="pb-3 border-b border-white/5 last:border-0">
    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{label}</p>
    <p className={`text-sm font-bold ${className}`}>{value || "---"}</p>
  </div>
);