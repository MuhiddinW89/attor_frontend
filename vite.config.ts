import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const apiUrl = env.VITE_API_URL?.trim();

    if (mode === "production" && apiUrl) {
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(apiUrl);
        } catch {
            throw new Error("VITE_API_URL must be an absolute HTTPS URL in production.");
        }
        const hostname = parsedUrl.hostname.toLowerCase();
        const isLocalhost =
            hostname === "localhost" ||
            hostname.endsWith(".localhost") ||
            hostname === "[::1]" ||
            hostname === "0.0.0.0" ||
            /^127\./.test(hostname);
        if (parsedUrl.protocol !== "https:" || isLocalhost) {
            throw new Error("VITE_API_URL must not point to localhost in production.");
        }
    }

    return {
        plugins: [react()],
    };
});
