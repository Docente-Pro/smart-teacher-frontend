import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            "/api/htmldocs": {
                target: "https://htmldocs.com",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/htmldocs/, "/api"),
            },
        },
    },
});
