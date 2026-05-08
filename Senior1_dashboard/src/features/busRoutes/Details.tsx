import GoogleMapDrawing from "@/components/shared/Map";
import { useSearch } from '@tanstack/react-router';
import {
  Calendar,
  Clock,
  Info,
  MapPin,
  Navigation,
  Route as RouteIcon
} from 'lucide-react';

export const Details = () => {
  const { row } = useSearch({ strict: false }) as { row: any };

  if (!row) return <div className="text-white p-10">No data found...</div>;

  
  const mapPath = row.path?.waypoints?.map((w: any) => ({
    lat: Number(w.latitude),
    lng: Number(w.longitude)
  })) || [];

  return (
    <div className="min-h-screen bg-[#08090a] text-white p-6 md:p-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <RouteIcon size={20} />
            <span className="text-xs font-mono uppercase tracking-widest">Route Overview</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            {row.route_name}
          </h1>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl">
          <span className="text-emerald-500 font-bold text-2xl">{Number(row.price).toLocaleString()} SYP</span>
          <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest text-center">Ticket Price</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Distance", value: `${(row.path?.distance_meters / 1000).toFixed(2)} km`, icon: <Navigation size={18} />, color: "text-blue-400" },
          { label: "Duration", value: `${Math.round(row.path?.duration_seconds / 60)} mins`, icon: <Clock size={18} />, color: "text-amber-400" },
          { label: "Waypoints", value: `${row.path?.waypoints?.length || 0} Points`, icon: <MapPin size={18} />, color: "text-purple-400" },
          { label: "Status", value: row.is_active ? "Active" : "Inactive", icon: <Info size={18} />, color: row.is_active ? "text-emerald-400" : "text-red-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111214] border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-colors">
            <div className={`${stat.color} mb-3`}>{stat.icon}</div>
            <p className="text-gray-500 text-xs uppercase tracking-tighter mb-1">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-[500px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <GoogleMapDrawing
              height="500px"
              value={mapPath}
              onChange={() => { }}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-[#111214] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Calendar className="text-gray-500" size={16} />
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Created At</p>
                <p className="text-sm font-mono">{new Date(row.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex-1 bg-[#111214] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Clock className="text-gray-500" size={16} />
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Last Update</p>
                <p className="text-sm font-mono">{new Date(row.updated_at).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111214] rounded-[3rem] p-8 border border-white/5">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Navigation className="text-blue-500" />
            Route Timeline
          </h3>

          <div className="space-y-0">
            {row.path?.waypoints?.map((point: any, index: number) => (
              <div key={index} className="relative pl-8 pb-8 last:pb-0">
                
                {index !== row.path.waypoints.length - 1 && (
                  <div className="absolute left-[11px] top-7 w-[2px] h-full bg-gradient-to-b from-blue-500/50 to-transparent" />
                )}

                
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-[#08090a] z-10 
                  ${point.type === 'start' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                    point.type === 'end' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                      'bg-emerald-500'}`}
                />

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-400">
                      {point.type}
                    </p>
                    <span className="text-[10px] font-mono text-gray-500">Order #{point.order}</span>
                  </div>
                  <p className="font-bold text-sm truncate">
                    {point.name || (point.type === 'start' ? 'Origin Point' : point.type === 'end' ? 'Destination' : 'Station')}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono mt-2">
                    {Number(point.latitude).toFixed(4)}, {Number(point.longitude).toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};