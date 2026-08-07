import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bus,
  MapPin,
  MessageSquare,
  Route,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { DashboardAPI } from './api';

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-[#111]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden"
  >
    <div className={`absolute -right-4 -top-4 opacity-5 text-${color}-500`}>
      <Icon size={120} />
    </div>
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 bg-${color}-500/10 rounded-2xl text-${color}-500`}>
        <Icon size={24} />
      </div>
      <span className="text-gray-400 font-semibold text-sm">{title}</span>
    </div>
    <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
    <p className="text-gray-500 text-xs mt-2 flex items-center gap-1 font-medium italic">
      {subtext}
    </p>
  </motion.div>
);

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardAPI.list().then((res) => {
      setData(res);
      setLoading(false);
    }).catch(err => console.error("Error fetching dashboard data", err));
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen bg-[#080808] flex items-center justify-center text-emerald-500 font-black">LOADING DASHBOARD...</div>;
  }

  const driverStatusData = [
    { name: 'Active', value: data.accounts.drivers_active, color: '#10b981' },
    { name: 'Inactive', value: data.accounts.drivers_inactive, color: '#ef4444' },
  ];

  const busStatusData = [
    { name: 'Assigned', value: data.vehicles.vehicles_assigned_to_route, color: '#10b981' },
    { name: 'Idle', value: data.vehicles.vehicles_total - data.vehicles.vehicles_assigned_to_route, color: '#334155' },
  ];

  const topRoutesData = data.trips.top_routes_by_trips.map((r: any) => ({
    name: r.route_name,
    trips: r.total_trips,
    active: r.active_trips
  }));

  return (
    <div className="p-8 space-y-8 bg-[#080808] min-h-screen text-white">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Passengers"
          value={data.accounts.passengers_total}
          icon={Users}
          color="emerald"
          subtext={`${data.accounts.passengers_active} currently active`}
        />
        <StatCard
          title="Total Fleet"
          value={data.vehicles.vehicles_total}
          icon={Bus}
          color="emerald"
          subtext={`${data.vehicles.government_vehicles} Government / ${data.vehicles.driver_owned_vehicles} Private`}
        />
        <StatCard
          title="Complaints"
          value={data.complaints.complaints_total}
          icon={MessageSquare}
          color="rose"
          subtext={`${data.complaints.complaints_last_7_days} in the last week`}
        />
        <StatCard
          title="Routes"
          value={data.network.routes_total}
          icon={Route}
          color="emerald"
          subtext={`${data.network.routes_with_active_trips} routes have active trips`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-[#111]/60 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Top Active Routes</h2>
              <p className="text-gray-500 text-sm italic mt-1">Comparison between total trips and current active trips</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">Total Trips</div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-500">Active Now</div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={topRoutesData}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#444" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '15px' }} />
                <Area type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorTrips)" />
                <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111]/60 border border-white/5 p-8 rounded-[2.5rem] flex flex-col">
          <h2 className="text-xl font-bold mb-2">Driver Status</h2>
          <p className="text-gray-500 text-xs mb-8">Real-time availability</p>
          <div className="h-[250px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={driverStatusData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                  {driverStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{data.accounts.drivers_total}</span>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Drivers</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-sm text-gray-400 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> Active</span>
              <span className="font-bold">{data.accounts.drivers_active}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-sm text-gray-400 flex items-center gap-2"><div className="w-2 h-2 bg-rose-500 rounded-full" /> Inactive</span>
              <span className="font-bold text-rose-400">{data.accounts.drivers_inactive}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111]/60 border border-white/5 p-8 rounded-[2.5rem]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Vehicle Distribution</h2>
            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-3 py-1 rounded-full font-bold">Fleet: {data.vehicles.vehicles_total}</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={busStatusData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                  {busStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <p className="text-[10px] text-emerald-500/60 uppercase font-black">Assigned</p>
              <p className="text-2xl font-bold">{data.vehicles.vehicles_assigned_to_route}</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
              <p className="text-[10px] text-gray-500 uppercase font-black">Unassigned</p>
              <p className="text-2xl font-bold">{data.vehicles.vehicles_total - data.vehicles.vehicles_assigned_to_route}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/10 p-8 rounded-[2.5rem] flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">Fleet Utilization</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Currently, {((data.vehicles.vehicles_assigned_to_route / data.vehicles.vehicles_total) * 100).toFixed(0)}% of your fleet is active on routes.
              {data.network.stops_inactive} stops are currently out of service.
            </p>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(data.vehicles.vehicles_assigned_to_route / data.vehicles.vehicles_total) * 100}%` }}
                transition={{ duration: 1.5 }}
                className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#111]/60 border border-white/5 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><MapPin /></div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Stops</p>
                <p className="text-xl font-black">{data.network.stops_active}</p>
              </div>
            </div>
            <div className="bg-[#111]/60 border border-white/5 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><AlertCircle /></div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pending Requests</p>
                <p className="text-xl font-black">{data.accounts.pending_deactivation_requests}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}