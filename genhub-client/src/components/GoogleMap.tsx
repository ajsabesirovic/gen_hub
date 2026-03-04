import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GoogleMapProps {
  latitude: number | string;
  longitude: number | string;
  address?: string;
  className?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

let optionsSet = false;
function initGoogleMapsOptions() {
  if (!optionsSet && GOOGLE_MAPS_API_KEY) {
    setOptions({
      key: GOOGLE_MAPS_API_KEY,
      v: "weekly",
    });
    optionsSet = true;
  }
}

export function GoogleMap({
  latitude,
  longitude,
  address,
  className = "",
}: GoogleMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === "string" ? parseFloat(longitude) : longitude;

  const isValidCoordinates =
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key not configured");
      return;
    }

    if (!isValidCoordinates) {
      setError("Invalid coordinates");
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        initGoogleMapsOptions();

                const { Map } = await importLibrary("maps");
        const { AdvancedMarkerElement } = await importLibrary("marker");

        if (!isMounted || !mapContainerRef.current) return;

        const position = { lat, lng };

                if (!mapInstanceRef.current) {
          const map = new Map(mapContainerRef.current, {
            center: position,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            mapId: "DEMO_MAP_ID",
          });
          mapInstanceRef.current = map;

                    const marker = new AdvancedMarkerElement({
            map,
            position,
            title: address || "Location",
          });
          markerRef.current = marker;
        } else {
                    mapInstanceRef.current.setCenter(position);
          if (markerRef.current) {
            markerRef.current.position = position;
          }
        }

        setIsLoaded(true);
        setError(null);
      } catch (err) {
        console.error("Failed to load Google Maps:", err);
        if (isMounted) {
          setError("Failed to load map");
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [lat, lng, address, isValidCoordinates]);

    useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, []);

  if (!isValidCoordinates) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Location will be confirmed privately with the babysitter.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className={`relative w-full h-[300px] rounded-lg overflow-hidden ${className}`}
    >
            {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
            <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: "300px" }}
      />
    </div>
  );
}

interface LocationDisplayProps {
  location?: string | null;
  formattedAddress?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export function LocationDisplay({
  location,
  formattedAddress,
  latitude,
  longitude,
}: LocationDisplayProps) {
    const lat =
    latitude != null
      ? typeof latitude === "string"
        ? parseFloat(latitude)
        : latitude
      : null;
  const lng =
    longitude != null
      ? typeof longitude === "string"
        ? parseFloat(longitude)
        : longitude
      : null;

  const hasValidCoordinates =
    lat !== null &&
    lng !== null &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng);

  if (!location) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="font-medium">{formattedAddress || location}</p>
      </div>

            {hasValidCoordinates ? (
        <GoogleMap
          latitude={lat}
          longitude={lng}
          address={formattedAddress || location}
        />
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Location will be confirmed privately with the babysitter.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
