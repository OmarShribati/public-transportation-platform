import { X } from "lucide-react";
import React from "react";
import ReactDOM from "react-dom";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string
    modalHeight?: string
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, modalHeight }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed  inset-0 z-[9999] flex items-center justify-center bg-opacity-70 backdrop-blur-[5px]"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <div
                className={className || `relative w-full max-w-lg p-8 mx-4 animate-fadeInScale bg-[var(--color-table-bg)] border rounded-3xl shadow-lg`}
                // className="relative w-full max-w-lg p-8 mx-4 animate-fadeInScale bg-[var(--color-table-bg)] border rounded-3xl shadow-lg"
                style={{
                    overflow: "visible",
                    borderColor: "var(--color-border)",
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute p-2 z-[999] rounded-full top-4 ltr:right-4 rtl:left-4 focus:outline-none focus:ring-2"
                    style={{
                        backgroundColor: "var(--color-main-bg)",
                        color: "var(--color-text-main)",
                        transition: "color 0.3s, background-color 0.3s",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "var(--color-icon-hover)";
                        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-text-main)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-main)";
                        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-main-bg)";
                    }}
                >
                    <X className="w-6 h-6 " />
                </button>
                <div
                    id="modal-description"
                    className={`${modalHeight ? modalHeight : 'max-h-[60vh]'}  overflow-y-auto scrollbar-thin text-base leading-relaxed`}
                    style={{ color: "var(--color-text-main)" }}
                >
                    {children}
                </div>
            </div>

            <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease forwards;
        }

        /* Scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: var(--color-nav-button);
          border-radius: 3px;
        }
      `}</style>
        </div>,
        document.body
    );
};
