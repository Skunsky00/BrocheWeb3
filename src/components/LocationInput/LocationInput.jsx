// LocationInput.js
import { Input } from "@chakra-ui/react";
import useLocationAutocomplete from "../../hooks/useLocationAutoComplete";

const LocationInput = ({
  value,
  onChange,
  placeholder = "Enter a location",
}) => {
  const inputRef = useLocationAutocomplete((place) => {
    // Use the formatted address or name from the selected place
    if (place.formatted_address) {
      onChange(place.formatted_address);
    } else if (place.name) {
      onChange(place.name);
    }
  });

  return (
    <Input
      ref={inputRef}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)} // In case the user types manually
    />
  );
};

export default LocationInput;
