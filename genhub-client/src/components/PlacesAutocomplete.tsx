import { useEffect, useRef, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

const countryCodeMap: Record<string, string> = {
  Germany: "de",
  Austria: "at",
  Switzerland: "ch",
  France: "fr",
  Italy: "it",
  Spain: "es",
  Netherlands: "nl",
  Belgium: "be",
  Luxembourg: "lu",
  Serbia: "rs",
  Croatia: "hr",
  Slovenia: "si",
  "Bosnia and Herzegovina": "ba",
  Montenegro: "me",
  "North Macedonia": "mk",
  Albania: "al",
  Kosovo: "xk",
  Hungary: "hu",
  Romania: "ro",
  Bulgaria: "bg",
  Greece: "gr",
  Turkey: "tr",
  Poland: "pl",
  "Czech Republic": "cz",
  Slovakia: "sk",
  Ukraine: "ua",
  USA: "us",
  "United States": "us",
  UK: "gb",
  "United Kingdom": "gb",
  Canada: "ca",
  Australia: "au",
};

export interface PlaceResult {
  address: string;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  city: string | null;
  country: string | null;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: PlaceResult) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
    cityBias?: string;
  countryBias?: string;
  hint?: string;
  showOutsideCityWarning?: boolean;
}

function extractLocationFromPlace(place: google.maps.places.PlaceResult): {
  city: string | null;
  country: string | null;
} {
  let city: string | null = null;
  let country: string | null = null;

  if (place.address_components) {
    for (const component of place.address_components) {
      if (component.types.includes("locality")) {
        city = component.long_name;
      } else if (
        component.types.includes("administrative_area_level_1") &&
        !city
      ) {
                city = component.long_name;
      }
      if (component.types.includes("country")) {
        country = component.long_name;
      }
    }
  }

  return { city, country };
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter location",
  disabled = false,
  className = "",
  cityBias,
  countryBias,
  hint,
  showOutsideCityWarning = true,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOutsideCity, setIsOutsideCity] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

    const onChangeRef = useRef(onChange);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const cityBiasRef = useRef(cityBias);

  useEffect(() => {
    onChangeRef.current = onChange;
    onPlaceSelectRef.current = onPlaceSelect;
    cityBiasRef.current = cityBias;
  }, [onChange, onPlaceSelect, cityBias]);

    useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    let isMounted = true;

    const initAutocomplete = async () => {
      try {
        setIsLoading(true);
        initGoogleMapsOptions();

                if (listenerRef.current) {
          google.maps.event.removeListener(listenerRef.current);
          listenerRef.current = null;
        }
                
                const { Autocomplete } = await importLibrary("places");

        if (!isMounted || !inputRef.current) return;

                const options: google.maps.places.AutocompleteOptions = {
          types: ["address"],
          fields: [
            "formatted_address",
            "geometry",
            "place_id",
            "name",
            "address_components",
          ],
        };

                if (countryBias) {
          const countryCode =
            countryCodeMap[countryBias] || countryBias.toLowerCase().slice(0, 2);
          options.componentRestrictions = { country: countryCode };
        }

                const autocomplete = new Autocomplete(inputRef.current, options);

                if (cityBias) {
          try {
            const { Geocoder } = await importLibrary("geocoding");
            const geocoder = new Geocoder();
            const searchQuery = countryBias
              ? `${cityBias}, ${countryBias}`
              : cityBias;

            geocoder.geocode({ address: searchQuery }, (results, status) => {
              if (!isMounted) return;
              if (status === "OK" && results && results[0]) {
                const location = results[0].geometry.location;
                                const circle = new google.maps.Circle({
                  center: location,
                  radius: 50000,
                });
                autocomplete.setBounds(circle.getBounds()!);
              }
            });
          } catch (err) {
            console.warn("Failed to set city bias:", err);
          }
        }

                const listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (place && place.geometry?.location) {
            const { city, country } = extractLocationFromPlace(place);

            const result: PlaceResult = {
              address: place.name || place.formatted_address || "",
              formattedAddress: place.formatted_address || null,
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              placeId: place.place_id || null,
              city,
              country,
            };

                        const currentCityBias = cityBiasRef.current;
            if (currentCityBias && city && showOutsideCityWarning) {
              const isSameCity =
                city.toLowerCase() === currentCityBias.toLowerCase() ||
                city.toLowerCase().includes(currentCityBias.toLowerCase()) ||
                currentCityBias.toLowerCase().includes(city.toLowerCase());
              setIsOutsideCity(!isSameCity);
              setSelectedCity(city);
            } else {
              setIsOutsideCity(false);
              setSelectedCity(null);
            }

                        onChangeRef.current(place.formatted_address || place.name || "");

                        onPlaceSelectRef.current?.(result);
          }
        });

        listenerRef.current = listener;
        autocompleteRef.current = autocomplete;
      } catch (err) {
        console.error("Failed to initialize Places Autocomplete:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAutocomplete();

    return () => {
      isMounted = false;
      if (listenerRef.current) {
        google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [cityBias, countryBias, showOutsideCityWarning]);

    const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

            setIsOutsideCity(false);
      setSelectedCity(null);

            if (onPlaceSelect && !newValue) {
        onPlaceSelect({
          address: "",
          formattedAddress: null,
          latitude: null,
          longitude: null,
          placeId: null,
          city: null,
          country: null,
        });
      }
    },
    [onChange, onPlaceSelect]
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

            {hint && !isOutsideCity && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

            {isOutsideCity && selectedCity && cityBias && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            This address is in {selectedCity}, which is different from your
            profile city ({cityBias}). Are you sure this is correct?
          </AlertDescription>
        </Alert>
      )}

      {!GOOGLE_MAPS_API_KEY && (
        <p className="text-xs text-muted-foreground">
          Location autocomplete unavailable
        </p>
      )}
    </div>
  );
}
