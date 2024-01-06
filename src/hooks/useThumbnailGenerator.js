// useThumbnailGenerator.js
import { useEffect, useState } from "react";
import { generateThumbnail } from "react-video-thumbnail";

const useThumbnailGenerator = (videoUrl) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    const generateVideoThumbnail = async () => {
      if (videoUrl) {
        try {
          const thumbnail = await generateThumbnail(videoUrl, {
            width: "100%", // Adjust the width of the thumbnail as needed
            height: "100%", // Adjust the height of the thumbnail as needed
          });
          setThumbnailUrl(thumbnail);
        } catch (error) {
          console.error("Error generating thumbnail:", error);
        }
      }
    };

    generateVideoThumbnail();
  }, [videoUrl]);

  return thumbnailUrl;
};

export default useThumbnailGenerator;
