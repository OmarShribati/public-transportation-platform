import React from 'react';
import { Car, Mail, Phone, Calendar, ShieldCheck, CreditCard, Image as ImageIcon, X } from 'lucide-react';
import { useSearch } from '@tanstack/react-router';

export const Details = () => {

    const { row } = useSearch({ strict: false }) as { row: any };
    const renderValue = (value: any) => value || <span className="text-gray-500 italic opacity-50 underline decoration-dotted">Not Provided</span>;

    const InfoCard = ({ icon: Icon, label, value, color = "text-[#00AA72]" }: any) => (
        <div className="bg-sidebarBg/50 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:border-[#00AA72]/30 transition-all duration-500 shadow-xl shadow-black/20">
            <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                <Icon size={20} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{label}</span>
                <span className="text-sm font-bold text-main">{renderValue(value)}</span>
            </div>
        </div>
    );

    return (
        <div className="p-8 min-h-screen space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                <h2 className="text-4xl font-black text-main uppercase italic tracking-tighter">
                    Driver <span className="text-[#00AA72]">Profile</span>
                </h2>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-white/5 w-fit px-3 py-1 rounded-full border border-white/10">
                    ID: {row.id || "N/A"}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard icon={ShieldCheck} label="Full Name" value={row.full_name} />
                        <InfoCard icon={Mail} label="Email Address" value={row.email} />
                        <InfoCard icon={Phone} label="Phone Number" value={row.phone} />
                        <InfoCard icon={Calendar} label="Registration Date" value={row.created_at ? new Date(row.created_at).toLocaleDateString() : null} />
                        <InfoCard icon={ShieldCheck} label="Approval Status" value={row.approval_status} color="text-amber-500" />
                        <InfoCard icon={CreditCard} label="Account Status" value={row.account_status} color="text-blue-500" />
                    </div>

                    <div className="bg-sidebarBg/30 border border-white/5 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-black text-main uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={16} className="text-[#00AA72]" /> Official Documents
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: "ID Card (Front)", url: row.id_card_image_1_url },
                                { label: "ID Card (Back)", url: row.id_card_image_2_url },
                                { label: "Driver License", url: row.license_image_url },
                            ].map((doc, idx) => (
                                <div key={idx} className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                                    {doc.url ? (
                                        <>
                                            <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                                                <span className="text-[10px] font-bold text-white uppercase">{doc.label}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                                            <X size={20} />
                                            <span className="text-[9px] font-bold uppercase tracking-tighter">Missing Document</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#00AA72]/10 border border-[#00AA72]/20 p-6 rounded-2xl relative overflow-hidden">
                        <Car className="absolute -right-4 -bottom-4 w-32 h-32 text-[#00AA72]/10 -rotate-12" />
                        <h3 className="text-sm font-black text-[#00AA72] uppercase tracking-[0.2em] mb-6 flex items-center gap-2 italic">
                            Vehicle Asset
                        </h3>

                        {row.vehicle ? (
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Model / Type</p>
                                    <p className="text-xl font-black text-main italic tracking-tighter">{row.vehicle.vehicle_type}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Plate Number</p>
                                    <p className="text-xl font-mono text-highlight bg-highlight/5 px-2 py-1 rounded w-fit">{row.vehicle.vehicle_number}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Ownership</p>
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-main uppercase">
                                        {row.vehicle.ownership}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 relative z-10">
                                <p className="text-amber-500 text-xs font-black uppercase animate-pulse italic">No Vehicle Assigned</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                            <span>CREATED AT</span>
                            <span>{row.created_at ? new Date(row.created_at).toLocaleTimeString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};