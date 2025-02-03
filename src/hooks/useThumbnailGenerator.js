import { useEffect, useState } from "react";

const useThumbnailGenerator = (videoUrl) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    if (!videoUrl) return;

    let isCancelled = false; // Prevent issues when the component unmounts

    const generateThumbnail = async () => {
      try {
        const video = document.createElement("video");
        video.src = videoUrl;
        video.crossOrigin = "anonymous"; // Prevent CORS issues
        video.muted = true;
        video.playsInline = true;

        await new Promise((resolve, reject) => {
          video.addEventListener("canplaythrough", resolve, { once: true });
          video.onerror = reject;
        });

        // Seek to a point 25% into the video
        video.currentTime = video.duration * 0.25;

        await new Promise((resolve) => {
          video.addEventListener("seeked", resolve, { once: true });
        });

        // Capture the frame
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to image URL
        const thumbnail = canvas.toDataURL("image/png");

        if (!isCancelled) {
          setThumbnailUrl(thumbnail);
        }
      } catch (err) {
        console.error("Thumbnail error:", err);
      }
    };

    generateThumbnail();

    return () => {
      isCancelled = true; // Cleanup function to avoid setting state on unmounted components
    };
  }, [videoUrl]);

  return thumbnailUrl;
};

export default useThumbnailGenerator;
