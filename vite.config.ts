import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // or "0.0.0.0" if you prefer IPv4 only
    port: 8080,
  },
  plugins: [
    react(),
    // Example: add dev-only plugins like this:
    // mode === "development" && someDevOnlyPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
