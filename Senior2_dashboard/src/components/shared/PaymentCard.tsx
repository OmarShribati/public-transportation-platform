import React, { useRef } from 'react';
import { 
  Plus, 
  CreditCard, 
  Phone, 
  Globe, 
  Power,
  Download,
  QrCode as QrIcon
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';

const GOLD = '#d8ad55';

export interface CardData {
  card_id?: number;
  card_number?: string;
  owner_name?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  qr_token?: string;
}

interface PaymentCardProps {
  data?: CardData | null;
  onAddCard?: () => void;
  isLoading?: boolean;
  onToggleStatus?: () => void;
  isUpdatingStatus?: boolean;
}

const formatValidDate = (dateString?: string, addYears = 0) => {
  if (!dateString) return "00/00";
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear() + addYears).slice(-2);
  return `${month}/${year}`;
};

function QrCodeGenerator({ token }: { token?: string }) {
  return (
    <div className="w-full h-full bg-white p-1 rounded flex flex-col justify-center items-center shadow-sm">
      {token ? (
        <QRCode value={token} size={65} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
      ) : (
        <div className="w-full h-full bg-slate-200 rounded-sm animate-pulse" />
      )}
    </div>
  );
}

const cardStandardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '428px', 
  aspectRatio: '85.6 / 53.98',
  borderRadius: '3.18mm',
  overflow: 'hidden',
  position: 'relative',
};

const FrontCard = React.forwardRef<HTMLDivElement, { data: CardData }>(({ data }, ref) => {
  return (
    <div ref={ref} style={cardStandardStyle} className="shadow-2xl relative">
      <img 
        src="/fcfee201972f4df8b9c145b059156b85.png" 
        alt="Front Card Background"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />
    </div>
  );
});

FrontCard.displayName = 'FrontCard';

const BackCard = React.forwardRef<HTMLDivElement, { data: CardData }>(({ data }, ref) => {
  return (
    <div ref={ref} style={cardStandardStyle} className=" relative  ">
      <img 
        src="/ChatGPT_Image_Jul_28__2026__07_41_01_PM-removebg-preview.png" 
        alt="Back Card Background"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      {/* QR Code positioned precisely inside the designated box */}
      <div className="absolute top-[22.5%] left-[6.8%] w-[15%] aspect-square">
        <QrCodeGenerator token={data.qr_token} />
      </div>

      {/* Card Number */}
      <div className="absolute top-[25%] right-[6.2%] text-[12px]  text-right">
        <div className="font-bold font-mono tracking-wider text-[#06261e]">
          {data.card_number || "---- ---- ---- ----"}
        </div>
      </div>

      {/* Card Holder */}
      <div className="absolute top-[40%] right-[17%] text-[12px] text-right">
        <div className=" uppercase text-[#06261e] tracking-wide">
          {data.owner_name || "UNKNOWN"}
        </div>
      </div>
    </div>
  );
});

BackCard.displayName = 'BackCard';

export const PaymentCard = ({ data, onAddCard, isLoading, onToggleStatus, isUpdatingStatus }: PaymentCardProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const isActive = data?.status?.toLowerCase() === 'active';

  const handleDownloadImage = async (ref: React.RefObject<HTMLDivElement | null>, fileName: string) => {
    if (ref.current) {
      try {
        const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error generating image:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-2xl text-center shadow-2xl flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Generating Card...</h3>
        <p className="text-slate-400 text-sm max-w-md">
          Please wait while we connect to the server and issue your smart card.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-2xl text-center shadow-2xl flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
          <CreditCard className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Transport Card Registered</h3>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          No payment card data was found associated with this account. You can add a new card directly to the transport system.
        </p>
        <button
          onClick={onAddCard}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add New Card
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-amber-400 shadow-inner">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Current Card Status</div>
           
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-center w-full md:w-auto">
          {onToggleStatus && (
            <button
              onClick={onToggleStatus}
              disabled={isUpdatingStatus}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {isUpdatingStatus ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              {isActive ? 'Deactivate Card' : 'Activate Card'}
            </button>
          )}

        
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <div className="w-full flex flex-col items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Front Side</span>
          <FrontCard  data={data} />
        </div>

        <div className="w-full flex flex-col items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Back Side</span>
          <BackCard  data={data} />
        </div>

        <div className="w-full flex flex-col items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Isolated QR Code</span>
          <div 
            className="w-full max-w-[280px] aspect-square bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl relative"
          >
            <div ref={qrRef} className="bg-white p-3 rounded-xl shadow-md flex items-center justify-center w-40 h-40">
              {data.qr_token ? (
                <QRCode value={data.qr_token} size={150} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              ) : (
                <div className="w-full h-full bg-slate-200 rounded-sm animate-pulse" />
              )}
            </div>

            <span className="text-xs font-mono text-slate-400 mt-3 truncate max-w-full">
              {data.qr_token || "No Token"}
            </span>

            <button
              onClick={() => handleDownloadImage(qrRef, `qr-code-${data.card_id || 'token'}.png`)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-900/30 transition-all active:scale-95 w-full justify-center"
            >
              <Download className="w-3.5 h-3.5" />
              Download QR Image
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};