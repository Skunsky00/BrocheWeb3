import { useState } from "react";
import useShowToast from "./useShowToast";
// In usePreviewMedia.jsx
const usePreviewMedia = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const showToast = useShowToast();
  const maxFileSizeInBytes = 50 * 1024 * 1024; // 50MB

  const handleMediaChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > maxFileSizeInBytes) {
        showToast("Error", "File size must be less than 50MB", "error");
        setSelectedFile(null);
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setSelectedFile(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      showToast("Error", "Please select a valid media file", "error");
      setSelectedFile(null);
    }
  };

  return { selectedFile, handleMediaChange, setSelectedFile };
};

export default usePreviewMedia;
