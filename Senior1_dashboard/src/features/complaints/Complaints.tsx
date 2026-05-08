import { DataView } from '@/components/view/DataView'
import React, { useEffect, useState } from 'react'
import { Complaints as ComplaintsType } from './interface'
import { ComplaintAPI } from './api'
import { ColumnDef } from '@tanstack/react-table'
import { Expand, Image as ImageIcon, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

export const Complaints = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (selectedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedImage]);

    const getColumns = (): ColumnDef<ComplaintsType>[] => [
        {
            accessorKey: "message",
            header: "Complaint Details",
            cell: ({ getValue }) => {
                const message = getValue() as string;
                const [isExpanded, setIsExpanded] = useState(false);

                const characterLimit = 90;
                const isLongText = message.length > characterLimit;

                return (
                    <div className="max-w-[400px] leading-relaxed">
                        <p className="text-slate-700 text-sm inline">
                            {isExpanded || !isLongText
                                ? message
                                : `${message.substring(0, characterLimit)}...`}
                        </p>

                        {isLongText && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="ml-2 text-emerald-600 hover:text-emerald-700 font-bold text-xs inline-flex items-center gap-0.5 hover:underline decoration-emerald-200 transition-all"
                            >
                                {isExpanded ? (
                                    <>Show Less <ChevronUp size={12} /></>
                                ) : (
                                    <>Read More <ChevronDown size={12} /></>
                                )}
                            </button>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "image_url",
            header: "Attachment",
            cell: ({ row }) => {
                const imageUrl = row.original.image_url;
                if (!imageUrl) return (
                    <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-dashed border-slate-200">
                            <ImageIcon size={14} />
                        </div>
                        <span className="text-xs italic">No media</span>
                    </div>
                );

                return (
                    <div className="flex items-center gap-3">
                        <img
                            src={imageUrl}
                            alt="thumbnail"
                            className="w-10 h-10 rounded-lg object-cover cursor-pointer border border-slate-200 hover:ring-2 hover:ring-emerald-400 transition-all shadow-sm"
                            onClick={() => setSelectedImage(imageUrl)}
                        />
                        <button
                            onClick={() => setSelectedImage(imageUrl)}
                            className="group flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full hover:bg-emerald-600 hover:text-white transition-all duration-300"
                        >
                            <Expand size={12} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold tracking-tight">Expand</span>
                        </button>
                    </div>
                );
            }
        },
    ];

    return (
        <>
            <DataView
                viewType="table"
                queryKey="Complaints"
                dataKey="complaints"
                tableTitle="Citizen Complaints Management"
                queryFn={() => ComplaintAPI.list()}
                columns={getColumns()}
            />

            {selectedImage && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
                    style={{ background: 'radial-gradient(circle, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.98) 100%)', backdropFilter: 'blur(12px)' }}
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 z-[1010] bg-white/10 hover:bg-white/20 text-white/70 hover:text-white p-3 rounded-full transition-all duration-200 hover:rotate-90"
                    >
                        <X size={24} />
                    </button>

                    <div
                        className="relative group max-w-5xl max-h-[85vh] animate-in zoom-in-95 duration-300 ease-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-1.5 bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <img
                                src={selectedImage}
                                alt="Attachment full view"
                                className="rounded-xl object-contain max-h-[calc(85vh-1rem)] w-auto h-auto shadow-inner"
                            />
                        </div>
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <a
                                href={selectedImage}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors text-sm font-semibold"
                            >
                                <ExternalLink size={16} />
                                Open Original
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}