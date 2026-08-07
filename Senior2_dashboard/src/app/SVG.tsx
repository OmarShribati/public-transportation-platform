



const IconWrapper = ({ size = 24, color = "currentColor", className, children, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

export const CarIcon = (props: any) => (
  <IconWrapper {...props}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M5 17h14v-6H5v6z" opacity="0.1" /> {/* تظليل خفيف */}
  </IconWrapper>
);

export const SuvIcon = (props: any) => (
  <IconWrapper {...props}>
    <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </IconWrapper>
);

export const PickupIcon = (props: any) => (
  <IconWrapper {...props}>
    <rect x="2" y="10" width="20" height="7" rx="1" />
    <path d="M5 10l2-4h8l2 4" />
    <path d="M17 10h5" />
    <circle cx="6.5" cy="17" r="2.5" />
    <circle cx="17.5" cy="17" r="2.5" />
  </IconWrapper>
);

export const VanIcon = (props: any) => (
  <IconWrapper {...props}>
    <path d="M4 16h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8l-4 4v5a2 2 0 0 0 0 2z" />
    <circle cx="7" cy="16" r="2" />
    <circle cx="17" cy="16" r="2" />
    <path d="M22 9h-4l-2 7" />
  </IconWrapper>
);

export const TruckIcon = (props: any) => (
  <IconWrapper {...props}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </IconWrapper>
);

export const BusIcon = (props: any) => (
  <IconWrapper {...props}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 18v2" />
    <path d="M18 18v2" />
    <circle cx="6" cy="16" r="2" />
    <circle cx="18" cy="16" r="2" />
    <path d="M2 11h20" />
    <path d="M10 6v5" />
    <path d="M14 6v5" />
  </IconWrapper>
);

export const MinibusIcon = (props: any) => (
  <IconWrapper {...props}>
    <rect x="3" y="7" width="18" height="10" rx="2" />
    <path d="M7 17v2" />
    <path d="M17 17v2" />
    <path d="M3 12h18" />
    <line x1="12" y1="7" x2="12" y2="12" />
  </IconWrapper>
);

export const TrailerIcon = (props: any) => (
  <IconWrapper {...props}>
    <rect x="2" y="5" width="16" height="11" />
    <circle cx="6" cy="16" r="2" />
    <circle cx="14" cy="16" r="2" />
    <line x1="18" y1="14" x2="22" y2="14" />
  </IconWrapper>
);


export const MotorcycleIcon = (props: any) => (
  <IconWrapper {...props}>
    <circle cx="5" cy="16" r="3" />
    <circle cx="19" cy="16" r="3" />
    <path d="M2 16h3l2-5h8l3 4h2" />
    <path d="M12 11l-3-4h-2" />
  </IconWrapper>
);

export const ScooterIcon = (props: any) => (
  <IconWrapper {...props}>
    <circle cx="18" cy="17" r="3" />
    <circle cx="6" cy="17" r="3" />
    <path d="M18 14v-6h-3l-2 5h-7" />
    <path d="M15 8l2-4h2" />
  </IconWrapper>
);

export const EquipmentIcon = (props: any) => (
  <IconWrapper {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> {/* درع للحماية أو ترس */}
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
  </IconWrapper>
);

export const GeneratorIcon = (props: any) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M13 8l-4 4h4l-2 4" stroke="currentColor" />
    <circle cx="6" cy="15" r="1.5" />
    <circle cx="18" cy="15" r="1.5" />
    <path d="M3 18h18" />
  </IconWrapper>
);

export const CompressorIcon = (props: any) => (
  <IconWrapper {...props}>
    <path d="M4 18h16" />
    <rect x="5" y="6" width="14" height="10" rx="3" />
    <circle cx="12" cy="16" r="2" />
    <line x1="19" y1="16" x2="22" y2="16" />
  </IconWrapper>
);

export const ExcavatorIcon = (props: any) => (
  <IconWrapper {...props}>
    <path d="M2 17h12v-6h-8v-3h7l3 3h4l2 3v3h-2" />
    <circle cx="6" cy="17" r="2" />
    <circle cx="12" cy="17" r="2" />
    <path d="M15 6l4-3 3 3-2 3" />
  </IconWrapper>
);

export const BulldozerIcon = (props: any) => (
  <IconWrapper {...props}>
    <rect x="2" y="13" width="14" height="6" rx="2" />
    <path d="M5 13V8h6l3 5" />
    <path d="M18 10v9h4v-9h-4z" />
    <circle cx="5" cy="16" r="1" />
    <circle cx="9" cy="16" r="1" />
    <circle cx="13" cy="16" r="1" />
  </IconWrapper>
);

export const LoaderIcon = (props: any) => (
  <IconWrapper {...props}>
    <circle cx="6" cy="17" r="3" />
    <circle cx="16" cy="17" r="3" />
    <path d="M12 17h-2v-6h4l2-3h3" />
    <path d="M19 8l3 3v6" />
  </IconWrapper>
);

export const AssetIcon = (props: any) => (
  <IconWrapper {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </IconWrapper>
);

export const ContainerIcon = (props: any) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="16" rx="1" />
    <line x1="8" y1="4" x2="8" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="16" y1="4" x2="16" y2="20" />
    <path d="M3 9h18" opacity="0.5" />
    <path d="M3 15h18" opacity="0.5" />
  </IconWrapper>
);



export const GradedWifiIcon = ({ wifiStatus }: { wifiStatus: 0 | 1 | 2 | 3 | 4 | 5 }) => {

  const ACTIVE_HEX = "#00C951";
  const INACTIVE_HEX = "#fff";
  const DISABLED_HEX = "#DC2626";

  const getHexColor = (level: number) => {
    if (wifiStatus === 0) return DISABLED_HEX;
    return wifiStatus >= level ? ACTIVE_HEX : INACTIVE_HEX;
  };

  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
    >

      <path
        fill={getHexColor(1)}
        stroke={getHexColor(1)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M24.0211,32.9211a4.2163,4.2163,0,1,0,4.2162,4.2163h0a4.2163,4.2163,0,0,0-4.2162-4.2163Z"
      />
      <path
        fill="none"
        stroke={getHexColor(2)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M30.7652,28.6157A10.5155,10.5155,0,0,0,17.33,28.5793v.0364"
      />

      <path
        fill="none"
        stroke={getHexColor(3)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M37.1783,21.3261a20.6755,20.6755,0,0,0-26.3145,0"
      />

      <path
        fill="none"
        stroke={getHexColor(4)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M43.5,13.6741a30.5677,30.5677,0,0,0-39,0"
      />

    </svg>
  );
};

interface BatteryProps {
  battery: "0" | "1" | "2" | "3" | "4" | "5" | "6"; 
  is_charging: boolean | null;                     
}

const FULL_COLOR = "#00C951";
const LOW_COLOR = "#FFC400"; 
const EMPTY_COLOR = "#DC3545";
const DEFAULT_COLOR = "#3498db";
const BG_COLOR = "#E5E7EB";  

const LightningIcon = ({ color }: { color: string }) => (
  <svg className="w-4 h-4 absolute -mt-0.5 ml-1" fill={color} viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
      clipRule="evenodd"
    />
  </svg>
);

const CircleQuestionMark = ({ color }: { color: string }) => (
  <svg className="w-4 h-4 absolute -mt-0.5 ml-1" fill={color} viewBox="0 0 24 24">
    <path d="M12 18H12.01M12 16.5c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4h1.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5S13.38 15 12 15s-2.5-1.12-2.5-2.5H8c0 2.21 1.79 4 4 4zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8z" />
  </svg>
);

export const BatteryIcon = ({ battery, is_charging }: BatteryProps) => {

  const batteryLevel = parseInt(battery, 10);

  const getBatteryColor = (level: number, isCharging: BatteryProps['is_charging']): string => {

    if (isCharging === null && level === 0) {
      return DEFAULT_COLOR;
    }

    if (level === 0) return EMPTY_COLOR;
    if (level <= 2) return LOW_COLOR;
    return FULL_COLOR;
  };

  const mainColor = getBatteryColor(batteryLevel, is_charging);

  const batteryCells = Array.from({ length: 6 }, (_, index) => {
    const isFilled = index < batteryLevel;
    return isFilled ? mainColor : BG_COLOR;
  });

  return (
    <div className="flex justify-center items-center">
      <div className="flex justify-evenly items-center w-12 h-6 border-2 rounded-md bg-white p-0.5"
        style={{ borderColor: mainColor }}>
        {batteryCells.map((color, index) => (
          <div
            key={index}
            className="w-0.5 h-4 rounded-sm"
            style={{ backgroundColor: color }}
          ></div>
        ))}

        {(is_charging !== false && batteryLevel > 0) && (
          <div className="absolute flex justify-center items-center w-12 h-6">
            {is_charging === true && <LightningIcon color={mainColor} />}
            {is_charging === null && <CircleQuestionMark color={mainColor} />}
          </div>
        )}

      </div>

      <div className="w-1.5 h-3 rounded-tr-sm rounded-br-sm border-2 border-l-0"
        style={{ backgroundColor: mainColor, borderColor: mainColor }}>
      </div>
    </div>
  );
};