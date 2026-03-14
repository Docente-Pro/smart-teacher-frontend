import path from "path";
import { readFileSync } from "fs";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * The browser build of @turbodocx/html-to-docx is an IIFE that assigns to
 * `var HTMLToDOCX` but never exports it. Vite can't detect the export and
 * `mod.default` ends up as `undefined`. This plugin intercepts the import,
 * loads the browser build source and appends a proper `export default`.
 */
function htmlToDocxExportFix(): Plugin {
    const VIRTUAL_ID = "\0html-to-docx-browser";
    return {
        name: "fix-html-to-docx-export",
        enforce: "pre",
        resolveId(source) {
            if (source === "@turbodocx/html-to-docx") return VIRTUAL_ID;
        },
        load(id) {
            if (id === VIRTUAL_ID) {
                const filePath = path.resolve(
                    __dirname,
                    "node_modules/@turbodocx/html-to-docx/dist/html-to-docx.browser.js",
                );
                const code = readFileSync(filePath, "utf-8");
                return code + "\nexport default HTMLToDOCX;\n";
            }
        },
    };
}

export default defineConfig({
    plugins: [htmlToDocxExportFix(), react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    optimizeDeps: {
        exclude: ["@turbodocx/html-to-docx"],
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
