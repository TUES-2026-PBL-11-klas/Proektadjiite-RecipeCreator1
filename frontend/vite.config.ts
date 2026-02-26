import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // `true` tells Vite to listen on all network interfaces (IPv4 & IPv6).
    // previously using "::" could cause odd WebSocket frame errors when
    // traffic was routed through certain network adapters (seen as
    // "RSV1 must be clear" in logs). `true` is the recommended value in
    // the Vite docs for LAN development.
    host: true,
    port: 8080,
    hmr: {
      overlay: false,
      // explicitly specify the protocol/host if needed by clients on the
      // LAN. this helps prevent HMR websocket errors when the browser
      // connects via a mapped network IP instead of localhost.
      protocol: "ws",
      host: "localhost",
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
