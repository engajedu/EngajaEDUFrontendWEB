import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 'server' só é usado no DEV
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: false,
    proxy: {
      "/api": {
        target: "http://192.168.1.173:5001", // <-- sua API local em DEV
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
}));
