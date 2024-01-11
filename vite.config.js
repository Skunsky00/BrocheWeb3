import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Existing chunks...
          vendor: ["react", "react-dom", "@chakra-ui/react"],
          // Separate chunk for Firebase Authentication
          firebaseAuth: ["firebase/auth", "firebase/app", "firebase/firestore"],
          // Add more chunks as needed
        },
      },
    },
  },
});
