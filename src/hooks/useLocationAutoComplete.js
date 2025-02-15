import { useEffect, useRef, useState } from "react";

const useLocationAutoComplete = (onPlaceSelected, options = {}) => {
  const inputRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setLoaded(true);
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDLjaqx_NDPIbA5KTVU8jWvrrK-6clAcXI&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"],
        ...options,
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      onPlaceSelected(place);
    });

    return () => window.google.maps.event.clearInstanceListeners(autocomplete);
  }, [loaded, onPlaceSelected, options]);

  return inputRef;
};

export default useLocationAutoComplete;
