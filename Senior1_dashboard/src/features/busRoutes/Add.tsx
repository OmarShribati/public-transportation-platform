import { FormBuilder } from "@/components/form/FormBuilder";
import GoogleMapDrawing from "@/components/shared/Map";
import { useFormikContext } from "formik";
import { Navigation, Waypoints } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StopAPI } from "../busStops/api";
import { RouteAPI } from "./api";
import { RouteVal } from "./validation";

const GlassButton = ({ label, icon, onClick, active }: { label: string, icon?: any, onClick: () => void, active: boolean }) => (
    <button
        onClick={onClick}
        type="button"
        className={`
      group relative px-8 py-4 rounded-2xl transition-all duration-500 overflow-hidden z-20
      ${active
                ? "bg-gradient-to-r from-emerald-500 to-emerald-700 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-105"
                : "bg-[#1a1c1e] border border-white/10 hover:border-green-500/50 shadow-xl"}
    `}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        <div className="flex items-center gap-3 relative z-10">
            <div className={`${active ? "text-white" : "text-green-400"} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className={`font-bold tracking-widest uppercase text-xs ${active ? "text-white" : "text-gray-300"}`}>
                {label}
            </span>
        </div>
    </button>
);

const FormObserver = ({ onChange }: { onChange: (values: any) => void }) => {
    const { values } = useFormikContext();
    useEffect(() => {
        onChange(values);
    }, [JSON.stringify(values), onChange]);
    return null;
};

export const Add = () => {
    const { t } = useTranslation();
    const [showFullRoute, setShowFullRoute] = useState(false);
    const [allStops, setAllStops] = useState<any[]>([]);
    const [currentValues, setCurrentValues] = useState<any>({
        stop_ids: [],
        start_point: null,
        end_point: null,
        route_name: ""
    });

    useEffect(() => {
        StopAPI.list().then((res: any) => {
            console.log(res);


            const data = res?.stops || [];
            console.log("All Stops fetched:", data);
            setAllStops(Array.isArray(data) ? data : []);
        });
    }, []);


    const selectedStopsData = useMemo(() => {
        if (!currentValues?.stop_ids || !allStops.length) return [];

        const filtered = allStops.filter(stop => {

            const stopId = stop.stop_id ?? stop.id;
            return currentValues.stop_ids.some(
                (selectedId: any) => String(selectedId) === String(stopId)
            );
        });

        console.log("Matched Stops:", filtered);
        return filtered;
    }, [allStops, currentValues?.stop_ids]);

    const startP = currentValues?.start_point?.[0];
    const endP = currentValues?.end_point?.[0];

    const polylinePath = useMemo(() => {
        const path: { lat: number; lng: number }[] = [];


        if (startP?.lat) path.push({ lat: Number(startP.lat), lng: Number(startP.lng) });


        selectedStopsData.forEach(s => {

            const lat = s.latitude ?? s.lat ?? s.lat_deg;
            const lng = s.longitude ?? s.lng ?? s.lng_deg;
            if (lat && lng) {
                path.push({ lat: Number(lat), lng: Number(lng) });
            }
        });


        if (endP?.lat) path.push({ lat: Number(endP.lat), lng: Number(endP.lng) });

        return path;
    }, [startP, endP, selectedStopsData]);
    const fields = [
        [
            { name: "route_name", label: "Route Name", type: "text", placeholder: "e.g. Barzza - Maisat", wrapperClass: "col-span-2 md:col-span-1" },
            { name: "price", label: "Ticket Price (SYP)", type: "number", placeholder: "2500", wrapperClass: "col-span-2 md:col-span-1" },
        ],
        [
            {
                name: "stop_ids",
                label: "Select Route Stops",
                type: "selectMulti",
                isMulti: true,
                url: () => StopAPI.list(),
                optionLabel: "name",
                optionValue: "stop_id",
                wrapperClass: "col-span-2"
            },
        ],
        [
            { name: "start_point", label: "Departure Point", type: "map", wrapperClass: "col-span-2 mb-6" },
            { name: "end_point", label: "Arrival Point", type: "map", wrapperClass: "col-span-2" },
        ],
    ];

    return (
        <div className="w-full min-h-screen bg-[#08090a] text-white pb-20">
            <div className="px-6 md:px-16 py-12">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Navigation className="w-6 h-6 text-[#009c6a]" />
                            <span className="text-[#009c6a] font-mono text-sm tracking-[0.3em] uppercase">Fleet Architecture</span>

                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                            New <span className="text-green-500 italic underline decoration-green-500/30">Route</span>
                        </h1>

                    </div>

                    <GlassButton
                        onClick={() => setShowFullRoute(!showFullRoute)}
                        active={showFullRoute}
                        label={showFullRoute ? "Close Preview" : "Preview Path Logic"}
                        icon={<Waypoints className={`w-5 h-5 ${showFullRoute ? 'rotate-180' : ''}`} />}
                    />

                </div>

                <div className="grid grid-cols-1 gap-12">
                    {/* FormBuilder Section */}
                    <div className="bg-[#111214]/95 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 md:p-14 shadow-2xl">
                        <FormBuilder
                            validationSchema={RouteVal}
                            fields={fields}
                            loadingButtonLabel="Deploy & Activate Route"
                            query={(values) => {
                                const s = values.start_point?.[0];
                                const e = values.end_point?.[0];

                                const payload = {
                                    route_name: values.route_name,
                                    price: Number(values.price),
                                    start_latitude: s?.lat ? Number(s.lat.toFixed(6)) : 0,
                                    start_longitude: s?.lng ? Number(s.lng.toFixed(6)) : 0,
                                    end_latitude: e?.lat ? Number(e.lat.toFixed(6)) : 0,
                                    end_longitude: e?.lng ? Number(e.lng.toFixed(6)) : 0,
                                    stop_ids: values.stop_ids
                                };


                                return RouteAPI.create(payload);
                            }}
                        >
                            <FormObserver onChange={setCurrentValues} />
                        </FormBuilder>
                    </div>

                    {/* Google Maps Preview Section */}
                    {showFullRoute && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#1a1c1e] p-6 rounded-3xl border border-white/5">
                                    <span className="text-[10px] text-gray-400 uppercase block mb-1">Start Node</span>
                                    <p className={startP ? "text-blue-400" : "text-red-500 animate-pulse text-xs"}>
                                        {startP ? `Fixed: ${startP.lat.toFixed(3)}, ${startP.lng.toFixed(3)}` : "Not Set"}
                                    </p>
                                </div>
                                <div className="bg-[#1a1c1e] p-6 rounded-3xl border border-white/5">
                                    <span className="text-[10px] text-gray-400 uppercase block mb-1">Waypoints</span>
                                    <p className="text-emerald-400 font-bold text-xl">
                                        {selectedStopsData.length} <span className="text-xs font-normal text-gray-500 italic">linked</span>
                                    </p>
                                </div>
                                <div className="bg-[#1a1c1e] p-6 rounded-3xl border border-white/5">
                                    <span className="text-[10px] text-gray-400 uppercase block mb-1">End Node</span>
                                    <p className={endP ? "text-blue-400" : "text-red-500 animate-pulse text-xs"}>
                                        {endP ? `Fixed: ${endP.lat.toFixed(3)}, ${endP.lng.toFixed(3)}` : "Not Set"}
                                    </p>
                                </div>
                            </div>

                            {/* Map View */}
                            <div className="relative h-[650px] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                <GoogleMapDrawing
                                    height="650px"
                                    value={polylinePath}
                                    onChange={() => { }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}} />
        </div>
    );
};