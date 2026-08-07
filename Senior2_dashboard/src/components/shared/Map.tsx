
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useCallback, useRef } from "react";

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  value?: LatLng[];
  onChange?: (coords: LatLng[]) => void;
  height?: string;
}

const containerStyle = {
  width: "100%",
};

export default function GoogleMapDrawing({
  value = [],
  onChange,
  height = "400px",
}: Props) {
  const mapRef = useRef<google.maps.Map>();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_KEY,
  });


  const center = value.length > 0
    ? value[0]
    : { lat: 33.5138, lng: 36.2765 };

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height }}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onClick={(e) => {
          if (!onChange) return;
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (!lat || !lng) return;
          onChange([{ lat, lng }]);
        }}
      >

        {value.map((point, index) => (
          <Marker
            key={index}
            position={point}

            label={index === 0 ? "S" : index === value.length - 1 ? "E" : ""}
          />
        ))}


        {value.length > 1 && (
          <Polyline
            path={value}
            options={{
              strokeColor: "#3b82f6",
              strokeOpacity: 0.8,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}