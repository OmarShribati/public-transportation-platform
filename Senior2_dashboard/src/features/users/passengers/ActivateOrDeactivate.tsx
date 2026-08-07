import React from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface ActivateOrDeactivateProps {
    id: string | number;
    isActive: boolean;
    queryKey: any;

    onToggle: (id: string | number, currentStatus: boolean) => Promise<any>;
}

export const ActivateOrDeactivate: React.FC<ActivateOrDeactivateProps> = ({ id, isActive, queryKey, onToggle }) => {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: () => onToggle(id, isActive),
        onSuccess: () => {
            toast.success("Status updated successfully");

            queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    return (
        <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive}
                    disabled={isPending}
                    onChange={() => mutate()}
                />

                <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer 
          peer-checked:after:translate-x-full peer-checked:after:border-white 
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
          after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all 
          peer-checked:bg-emerald-500 peer-checked:after:bg-white
          shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] peer-checked:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                </div>
            </label>

            <div className="flex items-center min-w-[60px]">
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-highlight" />
                ) : (
                    <span className={`text-[10px] uppercase font-black tracking-widest ${isActive ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {isActive ? "Active" : "Inactive"}
                    </span>
                )}
            </div>
        </div>
    );
};